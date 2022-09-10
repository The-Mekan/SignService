import { nativeEnum, object, string, TypeOf } from "zod";
import { userType} from '../models/user.model.js';


const userRoleEnum=nativeEnum(userType);

 export const createUserSchema = object({
  body: object({
    firstName: string({
      required_error: "First name is required",
    }),
    lastName: string({
      required_error: "Last name is required",
    }),
    role:userRoleEnum,
    password: string({
      required_error: "Password is required",
    }).min(6, "Password is too short - should be min 6 chars"),
    passwordConfirmation: string({
      required_error: "Password confirmation is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
  
});

export const payloadUpdate = {
  body: object({
    firstName: string({
      required_error: "First name is required",
    }),
    lastName: string({
      required_error: "Last name is required",
    }),
    birthday: string().transform((a) => new Date(a)),
  }),
};


const paramsUpdate = {
  params: object({
    userId: string({
      required_error: "userId is required",
    }),
  }),

};
export const payloadResendEmail = {
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
  }),
};

export const verifyUserSchema = object({
  params: object({
    id: string(),
    verificationCode: string(),
  }),
});


export const forgotPasswordSchema = object({
  body:object({
    email:string({
      required_error: "Email is required",

    }).email("Not a valid email"),
  }),
});

export const resetPasswordSchema = object({
  params:object({
    id:string(),
    passwordResetCode:string(),
  }),
  body:object({ 
    password: string({
    required_error: "Password is required",
  }).min(6, "Password is too short - should be min 6 chars"),
  passwordConfirmation: string({
    required_error: "Password confirmation is required",
  })
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords do not match",
  path: ["passwordConfirmation"],
}),
})

export const updateUserSchema = object({
  ...payloadUpdate,
  
});
export const sendUserResendEmailSchema = object({
  ...payloadResendEmail,
  
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type UpdateUserInput = TypeOf<typeof updateUserSchema>;
export type SendUserResendEmailSchemaInput = TypeOf<typeof sendUserResendEmailSchema>;

export type VerifyUserInput = TypeOf<typeof verifyUserSchema>["params"];

  export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>["body"];

  export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;

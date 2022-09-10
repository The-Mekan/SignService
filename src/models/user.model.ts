import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

export const privateFields=[
  "password",
  "__v",
  "verificationCode",
  "passwordResetCode",
  "verified",
];
export enum userType {
  consumer = 'consumer',
  restaurantOwner = 'restaurantOwner',
  admin = 'admin',
}

export interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role:String;
  verificationCode:string;
  passwordResetCode:string|null;
  verified:boolean;
}

export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<Boolean>;
}


const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    role:
    {
      type:String,
      enum:userType,
      default:userType.consumer
    },
    verificationCode:{type:String, required:true,default: () => nanoid(),},
    passwordResetCode:{type:String},
    verified:{type:Boolean,default:false},
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {

 
 
  const  user = this as  unknown as UserDocument;
   

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.saltWorkFactor as string));

  const hash = await bcrypt.hashSync(user.password, salt);

  user.password = hash;

  return next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;

  return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;

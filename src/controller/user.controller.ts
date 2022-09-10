import { Request, Response } from "express";
import { omit } from "lodash";
import { CreateUserInput, ForgotPasswordInput, ResetPasswordInput, SendUserResendEmailSchemaInput, UpdateUserInput, VerifyUserInput } from "../schema/user.schema.js";
import { createUser, findUserById,findUserByEmail, findAndUpdateUser, findUser } from "../service/user.service.js";
import logger from "../utils/logger.utils.js";
import { nanoid } from "nanoid";
import sendEmail from "../utils/mailer.utils.js";
import verificationEmailTemplate from "../utils/verificationEmail.utils.js";
const smtp = {
  user: process.env.smtpUser,
  pass:process.env.smtpPass,
  host:process.env.smtpHost,
  port:process.env.smtpPort,
  secure:process.env.smtpSecure
};



export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  
  try {
    const body=req.body;
    const user = await createUser(body);
    await sendEmail({
      from:smtp.user,
      to:user.email,
      subject:"Please verify your account",
      html:verificationEmailTemplate(user.verificationCode,user._id),

    });
    return res.send(user);
  } catch (e: any) {
    if(e.message.includes("11000")){
      return res.status(409).send("Acount already exists");
    }
    logger.error(e);
    return res.status(500).send(e.message);
  }
}
export async function resendVerificationEmail(
  req: Request<{},{},SendUserResendEmailSchemaInput["body"]>,
  res: Response
) {
  const userEmail = req.body.email;
  const user= await findUserByEmail(userEmail);
  if(!user){
    return res.sendStatus(404);
  }
 const email= await sendEmail({
    from:smtp.user,
    to:user.email,
    subject:"Please verify your account",
    html:verificationEmailTemplate(user.verificationCode,user._id),

  });
  
  return res.sendStatus(200);
}


export async function updateUserHandler(
  req: Request<{},{},UpdateUserInput["body"]>,
  res: Response
) {
  const id = res.locals.user._id;
  const update = req.body;

  const user = await findUserById(id);
  if (!user) {
    return res.sendStatus(404);
  }
  const updatedUser = await findAndUpdateUser({ _id:id }, update, {
    new: true,
  });

  return res.send(updatedUser);
}
export async function verifyUserHandler(
  req:Request<VerifyUserInput>,
  res:Response
  ) {
  const id= req.params.id;
  const verificationCode=req.params.verificationCode;

  //find user by id
 const user= await findUserById(id);
 //check to see if they are already verified
 if(!user){
  return res.send("Could not verify user");
 }
 if(user.verified){
  return res.send("User is already verified")
 }
 if(user.verificationCode === verificationCode){
  user.verified=true;
  await user.save();
  return res.send("User successfully verified");
 }

 return res.send("Could not verify user");
}
export async function forgotPasswordHandler(
  req:Request<{},{},ForgotPasswordInput>,
  res:Response
  ) {
  const message="If a user with that email is registered you will receive a password reset email";
  const {email}=req.body;
  const user=await findUserByEmail(email);

  if(!user){
    logger.debug(`User with email ${email} does not exists`);
    return res.send(message);
  }

  if(!user.verified){
    return res.send("User is not verified");
  }

  const passwordResetCode = nanoid();

  user.passwordResetCode=passwordResetCode;
  await user.save();

  await sendEmail({
    to:user.email,
    from:smtp.user,
    subject:"Reset your password",
    text:`Password reset code: ${passwordResetCode}. id:${user._id}`
  });
  logger.debug(`Password reset email sent to ${email}`);
  return res.send(message);
}

export async function resetPasswordHandler(
  req:Request<ResetPasswordInput["params"],
  {},ResetPasswordInput["body"]>,
  res:Response
  ){
  const {id,passwordResetCode}= req.params;
  const {password}= req.body;
  const user=await findUserById(id);

  if(!user || !user.passwordResetCode || user.passwordResetCode !== passwordResetCode){
    return res.status(400).send("Could not reset user password");
  }
  user.passwordResetCode=null;
  user.password=password;
  await user.save();
  return res.send("Successfully updated password");
}

export async function getCurrentUserHandler(req:Request,res:Response) {
    return res.send(res.locals.user);
}




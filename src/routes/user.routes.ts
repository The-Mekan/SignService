import express from "express";

import { createUserHandler, forgotPasswordHandler, getCurrentUserHandler, resendVerificationEmail, resetPasswordHandler, updateUserHandler, verifyUserHandler } from "../controller/user.controller.js";
import requireUser from "../middleware/requireUser.js";
import validateResource from "../middleware/validateResource.js";
import { createUserSchema, forgotPasswordSchema, resetPasswordSchema, updateUserSchema, verifyUserSchema} from "../schema/user.schema.js";

const router = express.Router();

 
router.post("/v1/api/users",validateResource(createUserSchema),createUserHandler);
router.put("/v1/api/users",requireUser,validateResource(updateUserSchema),updateUserHandler);
router.post("/v1/api/users/resendemail",resendVerificationEmail);
router.post("/v1/api/users/verify/:id/:verificationCode",validateResource(verifyUserSchema),verifyUserHandler);
router.post("/v1/api/users/forgotpassword",validateResource(forgotPasswordSchema),forgotPasswordHandler);
router.post("/v1/api/users/resetpassword/:id/:passwordResetCode",validateResource(resetPasswordSchema),resetPasswordHandler);
router.get('/v1/api/users/me',requireUser,getCurrentUserHandler)

export default router;
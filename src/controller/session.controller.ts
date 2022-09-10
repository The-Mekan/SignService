import { Request, Response } from "express";
import {
  createSession,
  findSessionById,
  findSessions,
  signAccessToken,
  updateSession,
} from "../service/session.service.js";
import { findUserById, validatePassword } from "../service/user.service.js";
import { signJwt, verifyJwt } from "../utils/jwt.utils.js";
import pkg from 'lodash';
const { get } = pkg;
import { JwtPayload } from "jsonwebtoken";

export async function createUserSessionHandler(req: Request, res: Response) {
  // Validate the user's password
  const user = await validatePassword(req.body);

  if (!user) {
    return res.status(401).send("Invalid email or password");
  }
  if(!user.verified){
    return res.status(401).send("Please verify user");
  }

  // create a session
  const session = await createSession(user._id, req.get("user-agent") || "");

  // create an access token

  const accessToken = signJwt(
    { ...user, session: session._id },
    "accessTokenPrivateKey",
    { expiresIn: process.env.accessTokenTtl } // 1 y,
  );

  // create a refresh token
  const refreshToken = signJwt(
    { ...user, session: session._id },
    "refreshTokenPrivateKey",
    { expiresIn: process.env.refreshTokenTtl } // 15 minutes
  );

  // return access & refresh tokens
  res.cookie("jwtaccess", accessToken,{
    //httpOnly:true,
    maxAge:1000 * 60 * 60 * 24,
  }); 
  res.cookie("jwtrefresh", refreshToken,{
    //httpOnly:true,
    maxAge:1000 * 60 * 60 * 24 * 365,
  });

  return res.send( {user});
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  const userId = res.locals.user._id;

  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session;

  await updateSession({ _id: sessionId }, { valid: false });

  return res.send({
    accessToken: null,
    refreshToken: null,
  });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken = get(req, "headers.x-refresh");

  const {decoded,expired,valid} = verifyJwt(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) {
    return res.status(401).send("Could not refresh access token 1");
  }

  const session = await findSessionById(get(decoded, "session"));
  
  if (!session || !session.valid) {
    return res.status(401).send("Could not refresh access token 2");
  }

  const user = await findUserById(session.user._id);

  if (!user) {
    return res.status(401).send("Could not refresh access token 3");
  }

  const accessToken = signAccessToken(user);

  return res.send({ accessToken });
}

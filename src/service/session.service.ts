import pkg from 'lodash';
const { get } = pkg;
import { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, { SessionDocument } from "../models/session.model.js";
import { verifyJwt, signJwt } from "../utils/jwt.utils.js";
import { findUser } from "./user.service.js";
import UserModel, { UserDocument } from "../models/user.model.js";

export async function createSession(userId: string, userAgent: string) {
  const session = await SessionModel.create({ user: userId, userAgent });

  return session.toJSON();
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
  return SessionModel.find(query).lean();
}
export async function findSessionById(id: string) {
  return SessionModel.findById(id);
}

export async function updateSession(
  query: FilterQuery<SessionDocument>,
  update: UpdateQuery<SessionDocument>
) {
  return SessionModel.updateOne(query, update);
}

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const { decoded } = verifyJwt(refreshToken, "refreshTokenPublicKey");

  if (!decoded || !get(decoded, "session")) return false;

  const session = await SessionModel.findById(get(decoded, "session"));

  if (!session || !session.valid) return false;

  const user = await findUser({ _id: session.user });

  if (!user) return false;

  const accessToken = signJwt(
    { ...user, session: session._id },
    "accessTokenPrivateKey",
    { expiresIn: process.env.accessTokenTtl } // 15 minutes
  );

  return accessToken;
}



export function signAccessToken(user: UserDocument) {

  const accessToken = signJwt(
    { ...user },
    "accessTokenPrivateKey",
    { expiresIn: process.env.accessTokenTtl } // 1 y,
  );

  return accessToken;
}


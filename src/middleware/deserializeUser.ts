import pkg from 'lodash';
const { get } = pkg;
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils.js";
import { reIssueAccessToken } from "../service/session.service.js";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.jwtaccess;
    const refreshToken=req.cookies.jwtrefresh;
  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt(accessToken, "accessTokenPublicKey");
  //Suggestion here take user find by id and put the req
  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
    }

    const result = verifyJwt(newAccessToken as string, "accessTokenPublicKey");

    res.locals.user = result.decoded;
    return next();
  }

  return next();
};

export default deserializeUser;

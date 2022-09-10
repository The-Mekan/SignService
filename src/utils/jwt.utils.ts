import jwt from "jsonwebtoken";


export function signJwt(
  object: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  let keyType:string="";
  if(keyName == "accessTokenPrivateKey"){
    keyType=process.env.ACCESS_TOKEN_PRIVATE_KEY as string;
  }else {
    keyType=process.env.REFRESH_PRIVATE_KEY as string;
  }
  const signingKey = Buffer.from(
    keyType,
    "base64"
  ).toString("ascii");

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
) {
  let keyType:string="";
  if(keyName == "accessTokenPublicKey"){
    keyType=process.env.ACCESS_TOKEN_PUBLIC_KEY as string;
  }else {
    keyType=process.env.REFRESH_PUBLIC_KEY as string;
  }
  const publicKey = Buffer.from(keyType, "base64").toString(
    "ascii"
  );

  try {
    const decoded = jwt.verify(token, publicKey)  ;
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}

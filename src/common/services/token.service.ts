import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "../enums";
import { BadRequestException } from "../response";
import { HydratedDocument } from "mongoose";
import { IUser } from "../interfaces/user.interface";
import { randomUUID } from "crypto";
import { TokenType } from "../enums/token";
import redisService from "./redis.service";

class TokenService {
  private redisService;
  constructor() {
    this.redisService = redisService;
  }

  accessKey = "lol";
  refreshKey = "omnia";

  AdminaccessKey = "lol";
  AdminrefreshKey = "omnia";

  generateToken = ({
    data,
    expiresIn = "1h",
    secret,
    audience = ["web"],
  }: {
    data: object;
    secret: string;
    expiresIn?: string;
    audience: string[];
  }) => {
    return jwt.sign(data, secret, {
      expiresIn: "30m",
      audience,
      issuer: "social_media",
    });
  };

  detectUserKey = (role: string) => {
    switch (role) {
      case Role.ADMIN:
        return {
          accessKey: this.AdminaccessKey,
          refreshKey: this.AdminrefreshKey,
        };
        break;
      case Role.USER:
        return {
          accessKey: this.accessKey,
          refreshKey: this.refreshKey,
        };
        break;
      default:
        throw new BadRequestException("invalid role");
        break;
    }
  };

  verifyToken =  (token: string, secret: string):JwtPayload|string => {
    return jwt.verify(token, secret);
  };

  createCredential = (user: HydratedDocument<IUser>) => {
    const { accessKey, refreshKey } = this.detectUserKey(user.role);

    const jti = randomUUID();
    return {
      accessToken: this.generateToken({
        data: { sub: user._id, role: user.role, jti },
        expiresIn: "30m",
        secret: accessKey,
        audience: [user.role],
      }),
      refreshToken: this.generateToken({
        data: { sub: user._id, jti },
        expiresIn: "7d",
        secret: refreshKey,
        audience: [user.role],
      }),
    };
  };

  decodeToken = async (
    token: string,
    tokenType: TokenType,
  ) => {
    const data = jwt.decode(token) as jwt.JwtPayload;
    if (!data.aud || !data || data.aud.length===0) {
      throw new BadRequestException("token aud not found");
    }

    const role = data.aud[0]
    // const userId = data.sub
    if (
      data.jti &&
      ( await this.redisService.get(redisService.tokenKey({ userId: data.user, jti: data.jti })))
    ) {
      throw new BadRequestException("login again");
    }

    const { accessKey, refreshKey } = this.detectUserKey(role!);
    const decoded = this.verifyToken(
      token,
      tokenType == TokenType.ACCESS ? accessKey : refreshKey,
    ) as JwtPayload  ;
    return decoded;
  };
}

const tokenService = new TokenService();
export default tokenService;

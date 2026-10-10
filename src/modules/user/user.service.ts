import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import redisService from "../../common/services/redis.service";
import { UserRepository } from "../../DB/repo/user.repository";
import { UserHydrated } from "../../DB/models/user.model";
import s3Service from "../../common/services/s3.service";
import { StorageTypeEnum } from "../../common/enums/storage";

class UserService {
  private userRepo: UserRepository;
  private redisService;
  private s3Service;
  constructor() {
    this.userRepo = new UserRepository();
    this.redisService = redisService;
    this.s3Service = s3Service;
  }
  profile(data: HydratedDocument<IUser>): HydratedDocument<IUser> {
    return data;
  }

  logOut = async (
    userId: string,
    flag: "all" | "only",
    { jti, iat }: { jti: string; iat: number },
  ) => {
    if (flag === "all") {
      await this.userRepo.updateOne({
        filter: { _id: userId },
        update: {
          $set: { changeConditional: new Date() },
        },
      });
      const result = await this.redisService.keys(
        this.redisService.prefixTokenKey({ userId }),
      );
      console.log(result);
      if (result.length) {
        await this.redisService.delete(result);
      }
    } else {
      await redisService.set({
        key: this.redisService.tokenKey({ userId, jti }),
        val: jti,
        ttl: iat + 60,
      });
    }
    return;
  };

  updateUserProfile = async (
    file: Express.Multer.File,
    user: UserHydrated,
    StorageType: StorageTypeEnum,
  ) => {
    const url = await this.s3Service.uploadFile({
      file,
      folder: "user",
      path: "profile",
      StorageType,
    });
    return url;
  };
}

const userService = new UserService();
export default userService;

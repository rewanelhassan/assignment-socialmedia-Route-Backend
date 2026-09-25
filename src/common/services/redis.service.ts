import { config } from "dotenv";
import { createClient, RedisClientType } from "redis";
import { BadRequestException } from "../response";

export class RedisService {
  private redisClient: RedisClientType;

  constructor() {
    config()
    this.redisClient = createClient({
      url: process.env.REDIS_URL! as string,
    });
    this.handleEvent()
  }

  public async connection() {
    try {
      await this.redisClient.connect();
      console.log("Redis connected successfully...");
    } catch (error) {
      console.error("Redis connection error:", error);
    }
  }

  private handleEvent(){
    this.redisClient.on("error",(err)=>{
        console.log({err})
    })
  }

  prefixTokenKey = ({ userId }: { userId: string }) => {
    return `TOKEN::${userId}`;
  };

  tokenKey = ({ userId, jti }: { userId: string; jti: string }) => {
    return `TOKEN::${userId}::${jti}`;
  };

  otpKey = (email: string) => {
    return `OTP::${email}`;
  };

  forgetOtpKey = (email: string) => {
    return `OTP::FORGET_PASSWORD::${email}`;
  };

  otpCounterKey = (email: string) => {
    return `OTP::COUNT::${email}`;
  };
  async get(key: string) {
    try {
      const result = await this.redisClient.get(key);
      if (!result) return null;

      try {
        return JSON.parse(result);
      } catch (error) {
        return result;
      }
    } catch (error) {
      console.log({ error });
      throw new BadRequestException("internal server error");
    }
  }

  async set({ key, val, ttl }: { key: string; val: any; ttl?: number }) {
    try {
      return ttl
        ? await this.redisClient.set(key, JSON.stringify(val), { EX: ttl })
        : await this.redisClient.set(key, JSON.stringify(val));
    } catch (error) {
      console.log({ error });
      throw new BadRequestException("internal server error");
    }
  }

  async delete(key: string | string[]) {
    return await this.redisClient.del(key);
  }

  async ttl(key: string) {
    return await this.redisClient.ttl(key);
  }

  async exists(key: string) {
    return await this.redisClient.exists(key);
  }

  async incr(key: string) {
    return await this.redisClient.incr(key);
  }

  async decr(key: string) {
    return await this.redisClient.decr(key);
  }

  async keys(prefix: string) {
    return await this.redisClient.keys(prefix);
  }
}

const redisService = new RedisService() 

export  default redisService
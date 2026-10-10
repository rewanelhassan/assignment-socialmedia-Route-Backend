import { compare, hash } from "../../common/utils/hash";
import { encrypt } from "../../common/utils/encrypt";
import { generateOtp } from "../../common/utils/generate-otp";
import emailEmitter from "../../common/utils/mail-event";
import { otpTemplate } from "../../common/utils/otp.temp";
import { sendEmail } from "../../common/utils/mail";
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "../../common/response";
import { UserRepository } from "../../DB/repo/user.repository";
import { ILogin, ISignup } from "./dto/auth.dto";
import tokenService from "../../common/services/token.service.js";
import redisService from "../../common/services/redis.service.js";

class AuthService {
  private userRepo: UserRepository;
  private redisService: any;
  private tokenService: any ;

  constructor() {
    this.userRepo = new UserRepository();
    this.redisService = redisService;
    this.tokenService = tokenService;
  
  }

  async login(data: ILogin) {
    const { email, password } = data;
    console.log("user login");

    const user = await this.userRepo.findOne({
      filter: { email },
      options: { lean: false },
    });

    if (!user) {
      throw new NotFoundException("user not found");
    }

    const isPasswordValid = await compare({
      plainText: password,
      hashedText: user.password,
    });
    if (!isPasswordValid) {
      throw new BadRequestException("invalid email or password");
    }

   const {accessToken , refreshToken}= await  this.tokenService.createCredential(user)

    return { accessToken , refreshToken };
  }

  async signup(data: ISignup) {
    const { email, password } = data;
    console.log("user signup");

    const existUser = await this.userRepo.findOne({
      filter: { email },
    });

    if (existUser) {
      throw new ConflictException("email already exists");
    }

    // data.password = await hash({ plainText: password });
    // if (data.phone) {
    //   data.phone = encrypt(data.phone);
    // }

    const user = await this.userRepo.create({
      data: {
        ...data,
        phone: data.phone ?? "",
      },
    });

    const otp = await generateOtp();

    await this.redisService.set({
      key: this.redisService.otpKey(user.email),
      ttl: 120,
      val: await hash({ plainText: `${otp}` }),
    });

    await this.redisService.set({
      key: this.redisService.otpCounterKey(user.email),
      ttl: 60 * 5,
      val: 1,
    });

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: user.email,
        subject: "confirm email",
        html: otpTemplate({
          otp,
          username: user.fName,
          title: "confirm email otp",
        }),
      });
    });

    return { user };
  }

  async confirmEmail(input:{email:string , otp:string}){
    const {email ,otp}=input 
    const existUser = await this.userRepo.findOne({filter:{email , confirmedEmail:false}})

    if(!existUser){
        throw new NotFoundException("user nit found")
    }

    const hashedOtp = await redisService.get(
        this.redisService.otpKey(existUser.email)
    )
    if(!hashedOtp){
        throw new BadRequestException("invalid or expired otp")
    }
    const isValid = await compare({plainText:otp , hashedText:hashedOtp  })

    if(!isValid){
        throw new BadRequestException("invalid or expired otp")
    }
   const updated= await  this.userRepo.updateOne({
        filter:{
            email
        },
        update:{
            confirmedEmail:true,

        }
    })

    await redisService.delete(this.redisService.otpKey(existUser.email))
    await redisService.delete(this.redisService.otpCounterKey(existUser.email))



  }

  async resendConfirmEmail(input:{email:string}){
    const {email }=input 
    const existUser = await this.userRepo.findOne({filter:{email , confirmedEmail:false}})

    if(!existUser){
        throw new NotFoundException("user nit found")
    }

    const ttl=await redisService.ttl(this.redisService.otpKey(existUser.email))
    if(ttl>0){
        throw new BadRequestException("otp still valid")
    }

    const otpCounter = await redisService.get(this.redisService.otpCounterKey(existUser.email))
    if(otpCounter>3){
        throw new BadRequestException("you reach your limit , try next 5 min")
    }

    const otp = await generateOtp()

    await redisService.set({
        key:this.redisService.otpKey(existUser.email),
        ttl:120,
        val:await hash({plainText:`${otp}`}),
    })

    await redisService.incr(this.redisService.otpCounterKey(existUser.email))

    emailEmitter.emit("sendEmail", async()=>{
        await sendEmail({
            to:existUser.email,
            subject:"confirm email",
            html:otpTemplate({
                otp,
                username:existUser.fName,
                title:"confirm email otp"
            })
        })
    })

    return existUser;

  }

  async forgetPassword(input:{email:string}){
    const {email }=input 
    const existUser = await this.userRepo.findOne({filter:{email , confirmedEmail:true}})

    if(!existUser){
        throw new NotFoundException("user nit found")
    }

    const otp = await generateOtp()

    await redisService.set({
        key:this.redisService.forgetOtpKey(existUser.email),
        ttl:120,
        val:await hash({plainText:`${otp}`}),
    })
    await redisService.set({
        key:this.redisService.forgetOtpCounterKey(existUser.email),
        ttl:60*5,
        val: "1",
    })


    emailEmitter.emit("sendEmail", async()=>{
        await sendEmail({
            to:existUser.email,
            subject:"forget password email",
            html:otpTemplate({
                otp,
                username:existUser.fName,
                title:"forget password  otp"
            })
        })
    })

    return ;

  }

   async verifyForgetPassword(input:{email:string,otp:string}){
    const {email, otp }=input 
    const existUser = await this.userRepo.findOne({filter:{email , confirmedEmail:true}})

    if(!existUser){
        throw new NotFoundException("user nit found")
    }
     const hashedOtp = await redisService.get(
        this.redisService.forgetOtpKey(existUser.email)
    )
    if(!hashedOtp){
        throw new BadRequestException("invalid or expired otp")
    }

    const otpCounter = await redisService.get(this.redisService.otpCounterKey(existUser.email))
    if(otpCounter>3){
        throw new BadRequestException("you reach your limit , try next 5 min")
    }

    const isValid = await compare({plainText:otp , hashedText:hashedOtp  })
    if(!isValid){
        throw new BadRequestException("invalid or expired otp")
    }
    return ;

  }

  async resetPassword(input:{email:string ,otp:string,password:string}){
    const {email,otp,password}=input ;
    const existUser = await this.userRepo.findOne({filter:{email , confirmedEmail:true}})

    if(!existUser){
        throw new NotFoundException("user nit found")
    }

    const hashedOtp = await redisService.get(
    this.redisService.forgetOtpKey(existUser.email)
  );

  if (!hashedOtp) {
    throw new BadRequestException("invalid or expired otp");
  }

  const isValid = await compare({ plainText: otp, hashedText: hashedOtp });
  if (!isValid) {
    throw new BadRequestException("invalid or expired otp");
  }

  const hashedPassword = await hash({ plainText: password });
  await this.userRepo.updateOne({
    filter: { email },
    update: {
      password: hashedPassword,
      changeConditional: new Date(),  //اخرج من الاجهزه القديمه
    },
  });

  await redisService.delete(this.redisService.forgetOtpKey(existUser.email));
  await redisService.delete(this.redisService.forgetOtpCounterKey(existUser.email));

  return ;



  }


}

const authService = new AuthService();
export default authService;

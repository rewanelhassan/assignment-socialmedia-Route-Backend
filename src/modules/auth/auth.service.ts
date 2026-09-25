import { compare, hash } from "../../common/utils/hash";
import { encrypt } from "../../common/utils/encrypt";
import { generateOtp } from "../../common/utils/generate-otp";
import emailEmitter from "../../common/utils/mail-event";
import { otpTemplate } from "../../common/utils/otp.temp";
import { sendEmail } from "../../common/utils/mail";
import { BadRequestException, NotFoundException, ConflictException } from "../../common/response";  
import { UserRepository } from "../../DB/repo/user.repository";  
import { ILogin, ISignup } from "./dto/auth.dto";

class AuthService {
    private userRepo: UserRepository;
    private redisService: any;

    constructor() {
        this.userRepo = new UserRepository();
        // this.redisService = redisService;
    }

    async login(data: ILogin) {
        const { email, password } = data;
        console.log("user login");

        const user = await this.userRepo.findOne({
            filter: { email },
            options: { lean: false }
        });

        if (!user) {
            throw new NotFoundException("user not found");
        }

        
        const isPasswordValid = await compare({ plainText: password, hashedText: user.password });
        if (!isPasswordValid) {
            throw new BadRequestException("invalid email or password");
        }

        return { user };
    }

    async signup(data: ISignup) {
        const { email, password } = data;
        console.log("user signup");

        const existUser = await this.userRepo.findOne({
            filter: { email }
        });

        if (existUser) {
            throw new ConflictException("email already exists");
        }

        data.password = await hash({ plainText: password });
        if (data.phone) {
            data.phone = encrypt(data.phone);
        }

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

         
        emailEmitter.emit("sendEmail", {
            to: user.email,
            subject: "confirm email",
            html: otpTemplate({
                otp,
                username: user.fName,
                title: "confirm email otp"
            })
        });

        return { user };
    }
}

const authService = new AuthService();
export default authService;
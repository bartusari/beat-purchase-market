import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dtos/registerUserDto';
import { LoginUserDto } from './dtos/loginUserDto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginUser: LoginUserDto) {
    const user = await this.usersRepository.findOne({
      where: { username: loginUser.username },
    });
    if (!user) return null;

    const ok = await bcrypt.compare(loginUser.password, user.password);
    return ok ? user : null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerUser: RegisterUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: registerUser.username },
        { email: registerUser.email },
      ],
    });
    if (existingUser) {
      throw new BadRequestException(
        'Girdiğiniz kullanıcı adında veya email adresinde bir kullanıcı zaten mevcut.',
      );
    }

    const userData: Partial<User> = {
      username: registerUser.username,
      email: registerUser.email,
      password: await bcrypt.hash(registerUser.password, 10),
      role: registerUser.role,
    };

    if (registerUser.profileImage) {
      userData.profileImage = registerUser.profileImage;
    }

    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = savedUser;

    return userWithoutPassword;
  }
}

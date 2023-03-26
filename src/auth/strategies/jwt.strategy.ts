import { FastifyRequest } from 'fastify';
import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractSecureJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    });
  }

  private static extractSecureJWT(req: FastifyRequest): string | null {
    if (req?.cookies?.jwt?.length > 0) return req.cookies.jwt;
    return null;
  }

  async validate(validationPayload: {
    email: string;
    sub: string;
  }): Promise<any> {
    const user = await this.userService.findById(validationPayload.sub);
    return user;
  }
}
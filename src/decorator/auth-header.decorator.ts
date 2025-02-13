import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthHeader = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (request.headers.authorization === undefined) {
      throw new BadRequestException('Authorization header is missing');
    }
    if (request.headers.authorization === '') {
      throw new BadRequestException('Authorization header is empty');
    }
    return request.headers.authorization;
  },
);
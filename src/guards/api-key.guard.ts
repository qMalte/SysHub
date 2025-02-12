// api-key.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Controller } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKey: string;

  constructor() {
    const apiKey = process.env.API_KEY;

    if (apiKey === undefined || apiKey === '') {
      throw new Error('API_KEY Umgebungsvariable ist nicht gesetzt');
    }

    this.apiKey = apiKey;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.header('Authorization');

    if (!authHeader) {
      throw new UnauthorizedException('Authorization Header is missing.');
    }

    const apiKey = authHeader.replace('Bearer ', '');

    if (apiKey !== this.apiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { catchError, map, Observable, throwError } from 'rxjs'
import fastify = require('fastify')
import { version } from '../../package.json'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  // version: string = process.env.npm_package_version

  private readonly logger = new Logger(ResponseInterceptor.name)
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response: fastify.FastifyReply = context.switchToHttp().getResponse()
    response.header('Api-Version', version)
    return next.handle().pipe(
      map((data) => {
        return {
          success: true,
          error: 0,
          message: data?.message,
          data,
        }
      }),
    )
  }
}

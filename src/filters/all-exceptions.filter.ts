import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    let error_msg
    if (exception.getResponse) {
      error_msg = exception.getResponse()
      if (error_msg instanceof Object) {
        error_msg = error_msg.message
      }
    } else {
      error_msg = exception.message
    }

    if (exception instanceof BadRequestException) {
      if (Array.isArray(error_msg)) {
        httpStatus = 200
      }
    }

    const responseBody = {
      success: false,
      error: httpStatus,
      error_msg,
    }
    if (process.env.NODE_ENV !== 'production') {
      responseBody['stack'] = exception.stack
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}

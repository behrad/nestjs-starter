import { HttpException, HttpStatus } from '@nestjs/common'

export class InputValidationException extends HttpException {
  constructor(msg) {
    super(msg || 'Invalid Inputs', HttpStatus.OK)
  }
}

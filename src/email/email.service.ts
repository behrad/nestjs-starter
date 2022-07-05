import { Injectable } from '@nestjs/common'
import { createTransport } from 'nodemailer'
import * as Mail from 'nodemailer/lib/mailer'
import { ConfigService } from '@nestjs/config'

@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail

  constructor(private readonly configService: ConfigService) {
    this.nodemailerTransport = createTransport({
      host: configService.get('EMAIL_SERVICE'),
      port: 465,
      secure: true,
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  }

  sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options)
  }

  test() {
    this.sendMail({
      to: 'behradz@gmail.com',
      from: this.configService.get('EMAIL_USER'),
      subject: 'Sample Test',
      text: 'I hope this message gets delivered!',
    })
  }
}

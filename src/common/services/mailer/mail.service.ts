import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as hbs from 'nodemailer-handlebars';
import { join } from 'path';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // SSL false because port 587 uses STARTTLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          partialsDir: join(__dirname, 'templates'),
          defaultLayout: false,
        },
        viewPath: join(__dirname, 'templates'),
        extName: '.hbs',
      }),
    );
  }


  async sendOtpEmail(to: string, firstName: string, otp: string) {
    await this.transporter.sendMail({
        to,
        subject: 'رمز التحقق الخاص بك',
        text: `رمز التحقق الخاص بك هو: ${otp}. هذا الرمز صالح لمدة 5 دقائق.`,
        template: 'sendOtp',
        context: {
            name: firstName,
            otp,
        },
    });
  }
}

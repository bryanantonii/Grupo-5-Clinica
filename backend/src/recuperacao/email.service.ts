import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}
  configurado(): boolean {
    return (
      !!(
        this.config.get<string>('SMTP_URL') ||
        this.config.get<string>('SMTP_HOST')
      ) && !!this.config.get<string>('SMTP_FROM')
    );
  }
  async enviarRecuperacao(email: string, link: string): Promise<void> {
    const url = this.config.get<string>('SMTP_URL');
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const usuario = this.config.get<string>('SMTP_USER');
    const transporte = url
      ? nodemailer.createTransport(url)
      : nodemailer.createTransport({
          host: this.config.get<string>('SMTP_HOST'),
          port,
          secure: port === 465,
          auth: usuario
            ? { user: usuario, pass: this.config.get<string>('SMTP_PASS') }
            : undefined,
          connectionTimeout: 10000,
          socketTimeout: 15000,
        });
    try {
      await transporte.sendMail({
        from: this.config.get<string>('SMTP_FROM'),
        to: email,
        subject: 'Recupere seu acesso à Clinora',
        text:
          'Você solicitou uma nova senha. Abra o link abaixo, válido por 30 minutos e uma única utilização:\n\n' +
          link +
          '\n\nSe você não fez esta solicitação, ignore esta mensagem.',
      });
    } finally {
      transporte.close();
    }
  }
}

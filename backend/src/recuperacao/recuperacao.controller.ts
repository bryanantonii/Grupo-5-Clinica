import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches } from 'class-validator';
import { Publico } from '../auth/decorators/publico.decorator';
import { emailNormalizado } from '../cadastros/validacao';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { RecuperacaoService } from './recuperacao.service';

export class SolicitarRecuperacaoDto {
  @ApiProperty() @Transform(emailNormalizado) @IsEmail() email: string;
}
export class RedefinirSenhaDto extends PickType(CreateUsuarioDto, [
  'senha',
] as const) {
  @ApiProperty() @IsString() @Matches(/^[a-f\d]{64}$/) token: string;
}
@Publico()
@ApiTags('Recuperação de acesso')
@Controller('auth')
export class RecuperacaoController {
  constructor(private readonly service: RecuperacaoService) {}
  @Post('recuperar-acesso')
  @HttpCode(200)
  @ApiOperation({ summary: 'Envia um link de uso único pelo SMTP configurado' })
  solicitar(@Body() dto: SolicitarRecuperacaoDto) {
    return this.service.solicitar(dto.email);
  }
  @Post('redefinir-senha')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Atualiza o hash da senha e revoga as sessões anteriores do paciente',
  })
  redefinir(@Body() dto: RedefinirSenhaDto) {
    return this.service.redefinir(dto.token, dto.senha);
  }
}

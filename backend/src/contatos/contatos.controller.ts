import { Body, Controller, Get, Patch, Post, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Equals, IsEmail, IsIn, IsString, Length } from 'class-validator';
import { aparar, emailNormalizado } from '../cadastros/validacao';
import { Publico } from '../auth/decorators/publico.decorator';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { ContatosService } from './contatos.service';

export class CriarContatoDto {
  @ApiProperty() @Transform(aparar) @IsString() @Length(3, 80) nome: string;
  @ApiProperty() @Transform(emailNormalizado) @IsEmail() email: string;
  @ApiProperty()
  @IsIn(['Agendamento', 'Convênios', 'Acesso à clínica', 'Outros assuntos'])
  assunto: string;
  @ApiProperty()
  @Transform(aparar)
  @IsString()
  @Length(10, 2000)
  mensagem: string;
}
export class MarcarLeituraDto {
  @ApiProperty({ example: true }) @Equals(true) lida: boolean;
}

@ApiTags('Mensagens de contato')
@Controller('contatos')
export class ContatosController {
  constructor(private readonly service: ContatosService) {}
  @Publico()
  @Post()
  @ApiOperation({
    summary: 'Registra a mensagem no banco para atendimento pela equipe',
  })
  criar(@Body() dto: CriarContatoDto) {
    return this.service.criar(dto);
  }
  @Perfis('admin', 'atendente')
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Permite à equipe ler as mensagens recebidas' })
  listar() {
    return this.service.listar();
  }
  @Perfis('admin', 'atendente')
  @ApiBearerAuth()
  @Patch(':id/leitura')
  @ApiOperation({ summary: 'Marca uma mensagem como lida pela equipe' })
  ler(@Param('id') id: string, @Body() dto: MarcarLeituraDto) {
    void dto; // A entrada é validada pelo ValidationPipe antes de marcar a leitura.
    return this.service.ler(id);
  }
}

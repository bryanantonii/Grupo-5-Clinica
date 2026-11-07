import { PickType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { aparar } from '../../cadastros/validacao';
import { CreateUsuarioDto } from './create-usuario.dto';

export class CadastroPacienteDto extends PickType(CreateUsuarioDto, [
  'nome',
  'email',
  'senha',
] as const) {}

export class AtualizarContaPacienteDto extends PickType(CreateUsuarioDto, [
  'nome',
  'email',
] as const) {
  @ApiPropertyOptional({ example: '(51) 99999-9999' })
  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(aparar)
  @IsString()
  @MaxLength(20)
  @Matches(/^$|^\(\d{2}\) \d{4,5}-\d{4}$/)
  telefone?: string;
}

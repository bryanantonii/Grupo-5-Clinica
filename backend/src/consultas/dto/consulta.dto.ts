import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { aparar } from '../../cadastros/validacao';
import { ListagemDto } from '../../cadastros/listagem.dto';
import { STATUS, type Status } from '../schemas/consulta.schema';
export class CriarConsultaDto {
  @ApiProperty() @IsMongoId() paciente: string;
  @ApiProperty() @IsMongoId() profissional: string;
  @ApiProperty({ example: '2026-12-01T13:00:00-03:00' })
  @IsDateString({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  dataHora: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(aparar)
  @IsString()
  @MaxLength(300)
  motivo?: string;
}
export class AtualizarConsultaDto extends PartialType(CriarConsultaDto, {
  skipNullProperties: false,
}) {}
export class MudarStatusDto {
  @ApiProperty({ enum: STATUS }) @IsIn(STATUS) status: Status;
}
export class ListarConsultasDto extends ListagemDto {
  @ApiPropertyOptional({ enum: STATUS })
  @IsOptional()
  @IsIn(STATUS)
  status?: Status;
}

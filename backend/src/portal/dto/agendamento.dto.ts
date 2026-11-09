import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { aparar, TELEFONE } from '../../cadastros/validacao';

export class HorariosDto {
  @ApiProperty() @IsMongoId() profissional: string;
  @ApiProperty({ example: '2026-12-01' })
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  data: string;
}
export class AgendarPacienteDto {
  @ApiProperty() @IsMongoId() profissional: string;
  @ApiProperty() @IsMongoId() especialidade: string;
  @ApiProperty({ example: '2026-12-01T08:00:00-03:00' })
  @IsDateString({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  dataHora: string;
  @ApiProperty({ example: '2000-05-21' })
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dataNascimento: string;
  @ApiProperty({ example: '(51) 99999-9999' })
  @Transform(aparar)
  @IsString()
  @Matches(TELEFONE)
  telefone: string;
  @ApiPropertyOptional({ nullable: true })
  @ValidateIf((_, valor: unknown) => valor !== undefined && valor !== null)
  @IsMongoId()
  convenio?: string | null;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(aparar)
  @IsString()
  @MaxLength(300)
  motivo?: string;
  @ApiProperty({ example: true })
  @Equals(true, { message: 'Confirme os dados do agendamento.' })
  ciente: boolean;
}

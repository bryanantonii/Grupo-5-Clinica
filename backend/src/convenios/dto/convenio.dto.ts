import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { aparar } from '../../cadastros/validacao';
import {
  MODALIDADES_CONVENIO,
  type ModalidadeConvenio,
} from '../schemas/convenio.schema';
export class CriarConvenioDto {
  @ApiProperty() @Transform(aparar) @IsString() @Length(3, 60) nome: string;
  @ApiProperty({ example: '123456' })
  @Transform(aparar)
  @IsString()
  @Matches(/^\d{6}$/)
  codigoAns: string;
  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  percentualCobertura: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(aparar)
  @IsString()
  @Matches(/^(?:$|\(\d{2}\) \d{4,5}-\d{4})$/)
  telefone?: string;
  @ApiPropertyOptional({ enum: MODALIDADES_CONVENIO })
  @IsOptional()
  @IsIn(MODALIDADES_CONVENIO)
  modalidade?: ModalidadeConvenio;
}
export class AtualizarConvenioDto extends PartialType(CriarConvenioDto, {
  skipNullProperties: false,
}) {}

import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { aparar } from '../../cadastros/validacao';
export class CriarEspecialidadeDto {
  @ApiProperty() @Transform(aparar) @IsString() @Length(3, 50) nome: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(aparar)
  @IsString()
  @MaxLength(300)
  descricao?: string;
  @ApiProperty({ minimum: 15, maximum: 120 })
  @IsInt()
  @Min(15)
  @Max(120)
  duracaoConsultaMin: number;
  @ApiProperty({ minimum: 0 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  valorParticular: number;
}
export class AtualizarEspecialidadeDto extends PartialType(
  CriarEspecialidadeDto,
  { skipNullProperties: false },
) {}

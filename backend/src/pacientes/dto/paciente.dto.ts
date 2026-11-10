import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { aparar, emailNormalizado, TELEFONE } from '../../cadastros/validacao';
export class CriarPacienteDto {
  @ApiProperty() @Transform(aparar) @IsString() @Length(3, 80) nome: string;
  @ApiProperty() @Transform(emailNormalizado) @IsEmail() email: string;
  @ApiProperty()
  @Transform(aparar)
  @IsString()
  @Matches(TELEFONE)
  telefone: string;
  @ApiProperty({ example: '1990-05-21' })
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dataNascimento: string;
  @ApiPropertyOptional({ nullable: true })
  @ValidateIf((_o, valor: unknown) => valor !== undefined && valor !== null)
  @IsMongoId()
  convenio?: string | null;
}
export class AtualizarPacienteDto extends PartialType(CriarPacienteDto, {
  skipNullProperties: false,
}) {}

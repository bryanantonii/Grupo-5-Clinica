import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const aparar = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateProfissionalDto {
  @ApiProperty({ example: 'Dra. Ana Lima', minLength: 3, maxLength: 80 })
  @Transform(aparar)
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(3, 80, { message: 'Nome deve ter entre 3 e 80 caracteres' })
  nome: string;

  @ApiProperty({ example: 'CRM-RS 45678', minLength: 4, maxLength: 20 })
  @Transform(aparar)
  @IsString()
  @IsNotEmpty({ message: 'Registro profissional é obrigatório' })
  @Length(4, 20, { message: 'Registro deve ter entre 4 e 20 caracteres' })
  registro: string;

  @ApiProperty({
    example: '665f1c2b9a1e4b0012345678',
    description: 'ID de uma especialidade existente',
  })
  @IsMongoId({ message: 'Especialidade: id inválido' })
  especialidade: string;

  @ApiProperty({ example: 'ana.lima@example.com' })
  @Transform(aparar)
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @ApiProperty({ example: '(51) 99876-5432' })
  @Transform(aparar)
  @IsString()
  @Matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, {
    message: 'Telefone inválido. Use o formato (51) 99999-9999',
  })
  telefone: string;
}

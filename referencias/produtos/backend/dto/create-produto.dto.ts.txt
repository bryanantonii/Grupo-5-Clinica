import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { CATEGORIAS, type Categoria } from '../schemas/produto.schema';

/**
 * DTO de entrada: o "formulário oficial" que a API aceita (PDF 04, cap. 13).
 * Campos fora deste DTO são rejeitados pelo ValidationPipe.
 */
export class CreateProdutoDto {
  @ApiProperty({ example: 'Arroz integral 1 kg' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @Length(3, 80, { message: 'O nome deve ter entre 3 e 80 caracteres' })
  nome: string;

  @ApiPropertyOptional({ example: 'Pacote de 1 kg, tipo 1' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  descricao?: string;

  @ApiProperty({ example: 8.9 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  preco: number;

  @ApiProperty({ example: 25 })
  @IsInt({ message: 'O estoque deve ser um número inteiro' })
  @Min(0, { message: 'O estoque não pode ser negativo' })
  estoque: number;

  @ApiProperty({ enum: CATEGORIAS, example: 'alimento' })
  @IsIn(CATEGORIAS, { message: `Categoria deve ser: ${CATEGORIAS.join(', ')}` })
  categoria: Categoria;
}

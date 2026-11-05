import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateProfissionalDto } from './create-profissional.dto';
import { UpdateProfissionalDto } from './update-profissional.dto';
import { ListarProfissionaisDto } from './listar-profissionais.dto';

describe('DTOs de Profissionais', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const dto = {
    nome: 'Dra. Ana Lima',
    registro: 'CRM-RS 12345',
    especialidade: '665f1c2b9a1e4b0012345678',
    email: 'ana@example.com',
    telefone: '(51) 99999-9999',
  };
  const criar = (valor: unknown) =>
    pipe.transform(valor, { type: 'body', metatype: CreateProfissionalDto });
  const editar = (valor: unknown) =>
    pipe.transform(valor, { type: 'body', metatype: UpdateProfissionalDto });

  it('aceita e apara dados válidos', async () => {
    await expect(
      criar({ ...dto, nome: '  Dra. Ana Lima  ' }),
    ).resolves.toMatchObject(dto);
  });
  it.each([
    ['nome', 'An'],
    ['nome', ' '.repeat(4)],
    ['nome', 'N'.repeat(81)],
    ['registro', 'CRM'],
    ['registro', 'R'.repeat(21)],
    ['email', 'invalido'],
    ['telefone', '51999999999'],
    ['especialidade', 'abc'],
    ['nome', null],
    ['email', null],
  ])('rejeita %s inválido: %p', async (campo, valor) => {
    await expect(criar({ ...dto, [campo]: valor })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
  it('rejeita campos desconhecidos e ativo na criação', async () => {
    await expect(
      criar({ ...dto, senha: 'nao-aceitar' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(criar({ ...dto, ativo: false })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
  it('aceita PATCH parcial e ativo booleano', async () => {
    await expect(
      editar({ nome: 'Dra. Ana Souza', ativo: false }),
    ).resolves.toMatchObject({ ativo: false });
  });
  it.each([
    { nome: null },
    { registro: null },
    { email: null },
    { especialidade: null },
    { ativo: null },
    { ativo: 'false' },
  ])('não aceita nulo ou tipo inválido no PATCH: %p', async (valor) => {
    await expect(editar(valor)).rejects.toBeInstanceOf(BadRequestException);
  });
  it('converte todos=true/false e rejeita outros valores e filtros inválidos', async () => {
    const consultar = (valor: unknown) =>
      pipe.transform(valor, {
        type: 'query',
        metatype: ListarProfissionaisDto,
      });
    await expect(consultar({ todos: 'false' })).resolves.toMatchObject({
      todos: false,
    });
    await expect(consultar({ todos: 'true' })).resolves.toMatchObject({
      todos: true,
    });
    await expect(consultar({ todos: 'sim' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(consultar({ especialidade: 'abc' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(consultar({ busca: { $ne: '' } })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

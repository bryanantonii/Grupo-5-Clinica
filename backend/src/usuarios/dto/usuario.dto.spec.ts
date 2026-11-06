import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';
import { LoginDto } from '../../auth/dto/login.dto';

describe('Entradas de autenticação', () => {
  const valido = {
    nome: 'Ana Lima',
    email: 'ana@example.com',
    senha: 'Senha@123',
  };
  it('normaliza nome e e-mail sem alterar a senha', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      ...valido,
      nome: '  Ana Lima  ',
      email: ' ANA@EXAMPLE.COM ',
    });
    expect(await validate(dto)).toEqual([]);
    expect(dto.nome).toBe('Ana Lima');
    expect(dto.email).toBe('ana@example.com');
    expect(dto.senha).toBe(valido.senha);
  });
  it('recusa criação de administrador pelo corpo da requisição', async () => {
    const erros = await validate(
      plainToInstance(CreateUsuarioDto, { ...valido, perfil: 'admin' }),
    );
    expect(erros.some((e) => e.property === 'perfil')).toBe(true);
  });
  it('rejeita senha curta', async () => {
    expect(
      (
        await validate(
          plainToInstance(CreateUsuarioDto, { ...valido, senha: '123' }),
        )
      ).some((e) => e.property === 'senha'),
    ).toBe(true);
  });
  it('rejeita truncamento do bcrypt em UTF-8 no cadastro e no login', async () => {
    const senha = 'á'.repeat(40);
    expect(
      (
        await validate(plainToInstance(CreateUsuarioDto, { ...valido, senha }))
      ).some((e) => e.property === 'senha'),
    ).toBe(true);
    expect(
      (
        await validate(
          plainToInstance(LoginDto, { email: valido.email, senha }),
        )
      ).some((e) => e.property === 'senha'),
    ).toBe(true);
  });
  it('recusa campos internos enviados pelo cliente', async () => {
    const erros = await validate(
      plainToInstance(CreateUsuarioDto, {
        ...valido,
        senhaHash: 'injetado',
        ativo: true,
      }),
      { whitelist: true, forbidNonWhitelisted: true },
    );
    expect(erros.map((e) => e.property).sort()).toEqual(['ativo', 'senhaHash']);
  });
});

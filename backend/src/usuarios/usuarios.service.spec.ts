import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './schemas/usuario.schema';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService (testes que precisam passar na aula 12)', () => {
  let service: UsuariosService;
  const consulta = (v: unknown) => ({
    lean: () => ({ exec: () => Promise.resolve(v) }),
  });
  const modelMock = { findOne: jest.fn(), create: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const modulo = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getModelToken(Usuario.name), useValue: modelMock },
      ],
    }).compile();
    service = modulo.get(UsuariosService);
  });

  it('grava o hash bcrypt, e não a senha em texto puro', async () => {
    modelMock.findOne.mockReturnValue(consulta(null));
    modelMock.create.mockImplementation((dados: Record<string, unknown>) =>
      Promise.resolve({ toObject: () => ({ _id: '1', ...dados }) }),
    );
    await service.criar({
      nome: 'Ana',
      email: 'ana@email.com',
      senha: 'Senha@123',
      perfil: 'atendente',
    });
    const gravado = (modelMock.create.mock.calls as unknown[][])[0][0] as {
      senha?: string;
      senhaHash: string;
    };
    expect(gravado.senha).toBeUndefined();
    expect(gravado.senhaHash).not.toBe('Senha@123');
    expect(await bcrypt.compare('Senha@123', gravado.senhaHash)).toBe(true);
  });

  it('não devolve o hash na resposta', async () => {
    modelMock.findOne.mockReturnValue(consulta(null));
    modelMock.create.mockImplementation((dados: Record<string, unknown>) =>
      Promise.resolve({ toObject: () => ({ _id: '1', ...dados }) }),
    );
    const criado = await service.criar({
      nome: 'Ana',
      email: 'ana@email.com',
      senha: 'Senha@123',
      perfil: 'atendente',
    });
    expect(criado).not.toHaveProperty('senhaHash');
  });

  it('recusa e-mail já cadastrado com 409', async () => {
    modelMock.findOne.mockReturnValue(consulta({ _id: '1' }));
    await expect(
      service.criar({
        nome: 'Ana',
        email: 'ana@email.com',
        senha: 'Senha@123',
        perfil: 'atendente',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

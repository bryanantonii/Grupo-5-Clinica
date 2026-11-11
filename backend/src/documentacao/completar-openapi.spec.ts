import type { OpenAPIObject } from '@nestjs/swagger';
import { completarOpenApi } from './completar-openapi';

function documento(): OpenAPIObject {
  return {
    openapi: '3.0.0',
    info: { title: 'Clinora', version: '1' },
    paths: {
      '/api/v1/auth/cadastro-paciente': {
        post: {
          responses: {},
          requestBody: {
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
      '/api/v1/contatos': { get: { responses: {} }, post: { responses: {} } },
      '/api/v1/convenios/{id}': { delete: { responses: {} } },
      '/api/v1/relatorios/resumo': { get: { responses: {} } },
    },
  };
}

describe('Documentação OpenAPI', () => {
  it('diferencia o envio público de contato da leitura protegida e documenta o cadastro com 201', () => {
    const d = completarOpenApi(documento());
    expect(d.paths['/api/v1/contatos'].post!.security).toEqual([]);
    expect(d.paths['/api/v1/contatos'].get!.security).toEqual([{ bearer: [] }]);
    expect(
      d.paths['/api/v1/auth/cadastro-paciente'].post!.responses['201'],
    ).toBeDefined();
    expect(
      d.paths['/api/v1/auth/cadastro-paciente'].post!.responses['409'],
    ).toBeDefined();
  });
  it('mantém DELETE sem corpo e informa os erros de autenticação e permissão', () => {
    const operacao =
      completarOpenApi(documento()).paths['/api/v1/convenios/{id}'].delete!;
    expect(operacao.responses['204']).not.toHaveProperty('content');
    expect(operacao.responses['401']).toBeDefined();
    expect(operacao.responses['401']).toHaveProperty(
      'content.application/json.example.statusCode',
      401,
    );
    expect(operacao.responses['403']).toBeDefined();
    expect(operacao.responses['404']).toBeDefined();
  });
  it('explica o limite real de Relatórios e mantém as rotas existentes', () => {
    const d = documento();
    const caminhos = Object.keys(d.paths);
    completarOpenApi(d);
    expect(Object.keys(d.paths)).toEqual(caminhos);
    expect(d.paths['/api/v1/relatorios/resumo'].get!.description).toContain(
      'sem filtro de período',
    );
  });
});

import type { OpenAPIObject, OperationObject } from '@nestjs/swagger';

const id = '665f1c2b9a1e4b0012345678';
const exemplos: Record<string, Record<string, unknown>> = {
  pacientes: {
    nome: 'Paciente Exemplo',
    email: 'paciente@example.com',
    telefone: '(51) 99999-1234',
    dataNascimento: '1995-05-21',
    convenio: null,
  },
  profissionais: {
    nome: 'Dra. Exemplo',
    registro: 'CRM-RS 12345',
    especialidade: id,
    email: 'profissional@example.com',
    telefone: '(51) 99999-1234',
  },
  especialidades: {
    nome: 'Clínica geral',
    descricao: 'Consulta de avaliação geral',
    duracaoConsultaMin: 30,
    valorParticular: 150,
  },
  convenios: {
    nome: 'Convênio Exemplo',
    codigoAns: '012345',
    percentualCobertura: 80,
    telefone: '(51) 99999-1234',
    modalidade: 'individual',
  },
  consultas: {
    paciente: id,
    profissional: id,
    dataHora: '2027-03-01T09:00:00-03:00',
    motivo: 'Consulta de avaliação',
  },
  usuarios: {
    nome: 'Atendente Exemplo',
    email: 'atendente@example.com',
    senha: 'SenhaFicticia123!',
    perfil: 'atendente',
  },
};
const descricoes: Record<string, string> = {
  'GET relatorios/resumo':
    'Consulta totais de pacientes ativos, consultas marcadas ou confirmadas e faltas',
  'GET relatorios/consultas-por-status': 'Agrupa as consultas por status',
  'GET relatorios/consultas-por-especialidade':
    'Agrupa somente consultas realizadas por especialidade',
  'PATCH consultas/{id}/status':
    'Altera o status conforme o fluxo de estados da consulta',
};
const erroSchema = {
  type: 'object' as const,
  properties: {
    statusCode: { type: 'integer' as const, example: 400 },
    message: {
      oneOf: [
        { type: 'string' as const },
        { type: 'array' as const, items: { type: 'string' as const } },
      ],
    },
    error: { type: 'string' as const, example: 'Bad Request' },
  },
};

function acesso(rota: string, metodo: string): string {
  if (
    rota.startsWith('catalogo/') ||
    (rota.startsWith('auth/') && rota !== 'auth/me') ||
    (rota === 'contatos' && metodo === 'post')
  )
    return 'público';
  if (rota === 'conta' || rota.startsWith('conta/')) return 'paciente';
  if (
    rota.startsWith('relatorios/') ||
    (rota.startsWith('usuarios') && rota !== 'usuarios/me') ||
    metodo === 'delete'
  )
    return 'admin';
  return 'admin ou atendente';
}

function entrada(rota: string): Record<string, unknown> | undefined {
  if (rota.endsWith('/status')) return { status: 'confirmada' };
  if (rota === 'usuarios/{id}/paciente') return { paciente: id };
  if (rota.endsWith('/leitura')) return { lida: true };
  if (rota.endsWith('/cancelar')) return undefined;
  if (rota === 'auth/cadastro-paciente')
    return {
      nome: 'Paciente Exemplo',
      email: 'paciente@example.com',
      senha: 'SenhaFicticia123!',
    };
  if (rota === 'auth/login' || rota === 'auth/login-paciente')
    return { email: 'conta@example.com', senha: 'SenhaFicticia123!' };
  if (rota === 'auth/recuperar-acesso')
    return { email: 'paciente@example.com' };
  if (rota === 'auth/redefinir-senha')
    return { token: 'a'.repeat(64), senha: 'NovaSenhaFicticia123!' };
  if (rota === 'conta')
    return {
      nome: 'Paciente Exemplo',
      email: 'paciente@example.com',
      telefone: '(51) 99999-1234',
    };
  if (rota === 'conta/consultas')
    return {
      profissional: id,
      especialidade: id,
      dataHora: '2027-03-01T09:00:00-03:00',
      dataNascimento: '1995-05-21',
      telefone: '(51) 99999-1234',
      convenio: null,
      ciente: true,
    };
  if (rota === 'contatos')
    return {
      nome: 'Pessoa Exemplo',
      email: 'pessoa@example.com',
      assunto: 'Agendamento',
      mensagem: 'Gostaria de informações sobre o agendamento.',
    };
  return exemplos[rota.split('/')[0]];
}

/** Completa a documentação sem modificar controllers, validações ou respostas HTTP. */
export function completarOpenApi(documento: OpenAPIObject): OpenAPIObject {
  for (const [caminho, item] of Object.entries(documento.paths)) {
    if (!item) continue;
    for (const metodo of ['get', 'post', 'patch', 'delete'] as const) {
      const operacao: OperationObject | undefined = item[metodo];
      if (!operacao) continue;
      const rota = caminho.replace(/^\/api\/v1\//, '');
      const perfil = acesso(rota, metodo);
      const verbo = {
        get: rota.includes('{id}') ? 'Consulta' : 'Lista',
        post: 'Cadastra',
        patch: 'Atualiza',
        delete: rota.startsWith('consultas') ? 'Cancela' : 'Inativa',
      }[metodo];
      operacao.summary ||=
        descricoes[metodo.toUpperCase() + ' ' + rota] ||
        `${verbo} ${rota.split('/')[0]}`;
      operacao.description = [
        operacao.description,
        `Acesso: ${perfil}.`,
        'Exemplos são fictícios. Substitua os IDs pelos obtidos na API e escolha datas futuras em dia útil.',
      ]
        .filter(Boolean)
        .join('\n\n');
      if (rota.startsWith('relatorios/'))
        operacao.description +=
          '\n\nAgregação geral, sem filtro de período nesta versão.';
      operacao.security = perfil === 'público' ? [] : [{ bearer: [] }];
      const sucesso =
        metodo === 'delete'
          ? '204'
          : metodo === 'post' &&
              ![
                'auth/login',
                'auth/login-paciente',
                'auth/recuperar-acesso',
                'auth/redefinir-senha',
              ].includes(rota)
            ? '201'
            : '200';
      operacao.responses ||= {};
      const anterior = operacao.responses[sucesso];
      if (sucesso === '204') {
        operacao.responses[sucesso] = {
          description: 'Operação concluída, sem corpo de resposta.',
        };
      } else {
        operacao.responses[sucesso] = {
          ...(anterior && !('$ref' in anterior) ? anterior : {}),
          description:
            'Sucesso. O conteúdo é retornado dentro de dados; senhas e hashes nunca são expostos.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sucesso', 'dados'],
                properties: {
                  sucesso: { type: 'boolean', enum: [true] },
                  dados: {},
                },
              },
            },
          },
        };
      }
      const falhas: Record<string, string> = {
        '400': 'Entrada, ID, referência, data ou transição inválida.',
      };
      if (perfil !== 'público')
        Object.assign(falhas, {
          '401': 'Token ausente, inválido, expirado ou sessão revogada.',
          '403': 'O perfil autenticado não pode executar esta ação.',
        });
      if (rota.includes('{id}'))
        falhas['404'] = 'Registro inexistente ou indisponível para esta conta.';
      if (
        (metodo === 'post' || metodo === 'patch') &&
        !rota.startsWith('auth/login') &&
        !rota.startsWith('auth/recuperar') &&
        !rota.startsWith('auth/redefinir') &&
        rota !== 'contatos'
      )
        falhas['409'] =
          'Duplicidade, horário ocupado ou conflito de atualização.';
      if (rota === 'auth/login' || rota === 'auth/login-paciente')
        falhas['401'] =
          'Credenciais inválidas ou conta sem acesso a esta área.';
      if (rota === 'auth/recuperar-acesso')
        falhas['503'] =
          'Serviço de e-mail ainda não configurado ou endereço do portal inválido.';
      for (const [codigo, descricao] of Object.entries(falhas))
        operacao.responses[codigo] = {
          description: descricao,
          content: {
            'application/json': {
              schema: erroSchema,
              example: { statusCode: Number(codigo), message: descricao },
            },
          },
        };
      const exemplo = entrada(rota);
      const corpo = operacao.requestBody;
      if (
        exemplo &&
        corpo &&
        !('$ref' in corpo) &&
        corpo.content['application/json']
      )
        corpo.content['application/json'].example = exemplo;
    }
  }
  return documento;
}

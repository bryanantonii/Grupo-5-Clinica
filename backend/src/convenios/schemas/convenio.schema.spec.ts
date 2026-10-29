import { model } from 'mongoose';
import { Convenio, ConvenioSchema } from './convenio.schema';
import { CONVENIOS_EXEMPLO } from '../seed/convenios.dados';

const ConvenioModel = model<Convenio>('ConvenioTesteSchema', ConvenioSchema);
const valido = () => ({
  nome: 'Plano de teste',
  codigoAns: '012345',
  percentualCobertura: 80,
});

describe('Schema de Convênios', () => {
  it('aceita os cinco exemplos sem precisar conectar ao banco', async () => {
    for (const dados of CONVENIOS_EXEMPLO) {
      await expect(
        new ConvenioModel(dados).validate(),
      ).resolves.toBeUndefined();
    }
  });

  it('preserva zeros do código ANS e aplica os valores padrão', () => {
    const convenio = new ConvenioModel(valido());
    expect(convenio.codigoAns).toBe('012345');
    expect(convenio.modalidade).toBe('individual');
    expect(convenio.ativo).toBe(true);
  });

  it('aceita modalidade coletiva e cadastro inativo', async () => {
    const convenio = new ConvenioModel({
      ...valido(),
      modalidade: 'coletivo',
      ativo: false,
    });
    await expect(convenio.validate()).resolves.toBeUndefined();
    expect(convenio.ativo).toBe(false);
  });

  it.each([
    ['nome', 'Ab'],
    ['nome', 'A'.repeat(61)],
    ['codigoAns', '12345'],
    ['codigoAns', '1234567'],
    ['codigoAns', 'ABC123'],
    ['percentualCobertura', -1],
    ['percentualCobertura', 101],
    ['percentualCobertura', 80.5],
    ['modalidade', 'qualquer'],
    ['telefone', '123'],
  ])('rejeita %s inválido (%s)', async (campo, valor) => {
    await expect(
      new ConvenioModel({ ...valido(), [campo]: valor }).validate(),
    ).rejects.toHaveProperty(`errors.${campo}`);
  });

  it('exige os três campos obrigatórios de criação', async () => {
    const validacao = new ConvenioModel({}).validate();
    await expect(validacao).rejects.toHaveProperty('errors.codigoAns');
    await expect(validacao).rejects.toHaveProperty('errors.nome');
    await expect(validacao).rejects.toHaveProperty(
      'errors.percentualCobertura',
    );
  });

  it('aceita cobertura nos dois limites e telefone ausente', async () => {
    for (const percentualCobertura of [0, 100]) {
      await expect(
        new ConvenioModel({ ...valido(), percentualCobertura }).validate(),
      ).resolves.toBeUndefined();
    }
  });

  it('remove espaços das extremidades dos textos', () => {
    const convenio = new ConvenioModel({
      ...valido(),
      nome: '  Plano de teste  ',
      telefone: ' (51) 99999-9999 ',
    });
    expect(convenio.nome).toBe('Plano de teste');
    expect(convenio.telefone).toBe('(51) 99999-9999');
  });

  it('recusa campos desconhecidos em vez de persistir permissões ou senhas', () => {
    expect(
      () => new ConvenioModel({ ...valido(), senha: 'exemplo' }),
    ).toThrow();
  });
});

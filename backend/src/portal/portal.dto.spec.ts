import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AgendarPacienteDto, HorariosDto } from './dto/agendamento.dto';

describe('Contrato do agendamento do próprio paciente', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  const entrada = {
    profissional: '665f1c2b9a1e4b0012345680',
    especialidade: '665f1c2b9a1e4b0012345678',
    dataHora: '2099-12-01T08:00:00-03:00',
    dataNascimento: '2000-05-21',
    telefone: '(51) 99999-9999',
    convenio: null,
    ciente: true,
  };
  const validar = (body: unknown) =>
    pipe.transform(body, { type: 'body', metatype: AgendarPacienteDto });
  it('aceita particular e preserva os IDs, sem permitir identidade enviada pelo navegador', async () => {
    await expect(validar(entrada)).resolves.toMatchObject(entrada);
    await expect(
      validar({ ...entrada, paciente: '665f1c2b9a1e4b0012345699' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it.each([
    ['profissional', '1'],
    ['especialidade', 'inexistente'],
    ['convenio', 'nome-do-plano'],
    ['dataNascimento', '2000-02-30'],
    ['dataHora', '2099-12-01T08:00:00'],
    ['telefone', '123'],
    ['ciente', false],
    ['ciente', 'true'],
  ])('recusa %s fora do contrato (%s)', async (campo, valor) => {
    await expect(
      validar({ ...entrada, [campo]: valor }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('não aceita campos administrativos no agendamento', async () => {
    await expect(
      validar({
        ...entrada,
        status: 'confirmada',
        usuario: entrada.profissional,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('a disponibilidade rejeita datas impossíveis antes de consultar o banco', async () => {
    await expect(
      pipe.transform(
        { profissional: entrada.profissional, data: '2027-02-30' },
        { type: 'query', metatype: HorariosDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

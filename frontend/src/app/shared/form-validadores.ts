import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function textoAparado(minimo: number, maximo: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const texto = String(control.value ?? '').trim();
    return texto.length < minimo || texto.length > maximo ? { textoAparado: true } : null;
  };
}

export const senhasIguais: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const senha = group.get('senha')?.value;
  const confirmar = group.get('confirmar')?.value;
  return senha && confirmar && senha !== confirmar ? { senhasDiferentes: true } : null;
};

/** Compara os campos em horário local e rejeita datas que o Date normalizaria. */
export function dataHoraFutura(data: string, horario: string, agora = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) return false;
  const [ano, mes, dia] = data.split('-').map(Number);
  const [hora, minuto] = horario.split(':').map(Number);
  const instante = new Date(ano, mes - 1, dia, hora, minuto);
  return (
    instante.getFullYear() === ano &&
    instante.getMonth() === mes - 1 &&
    instante.getDate() === dia &&
    instante.getHours() === hora &&
    instante.getMinutes() === minuto &&
    instante.getTime() > agora.getTime()
  );
}

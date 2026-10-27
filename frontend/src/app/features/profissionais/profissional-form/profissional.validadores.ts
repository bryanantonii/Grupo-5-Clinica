import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { textoAparado } from '../../../shared/form-validadores';
import { EspecialidadeOpcao } from '../services/profissionais.service';

export const TELEFONE = /^\(\d{2}\) \d{4,5}-\d{4}$/;

export function referenciaExistente(opcoes: () => readonly EspecialidadeOpcao[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    !control.value || opcoes().some((opcao) => opcao._id === control.value)
      ? null
      : { referenciaInexistente: true };
}

/** FormBuilder produz o FormGroup e os FormControls tipados usados nas duas telas. */
export function criarFormularioProfissional(
  fb: FormBuilder,
  opcoes: () => readonly EspecialidadeOpcao[],
) {
  return fb.nonNullable.group({
    nome: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(80), textoAparado(3, 80)],
    ],
    registro: [
      '',
      [Validators.required, Validators.minLength(4), Validators.maxLength(20), textoAparado(4, 20)],
    ],
    especialidade: ['', [Validators.required, referenciaExistente(opcoes)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, Validators.pattern(TELEFONE)]],
  });
}

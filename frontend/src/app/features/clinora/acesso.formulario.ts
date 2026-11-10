import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { senhasIguais, textoAparado } from '../../shared/form-validadores';

/** As quatro telas compartilham os campos, com regras conforme a operação. */
export function criarFormularioAcesso(fb: FormBuilder, modo: string) {
  const comSenha = modo !== 'recuperar';
  const comConfirmacao = modo === 'cadastro' || modo === 'nova-senha';
  return fb.nonNullable.group(
    {
      nome: [
        '',
        modo === 'cadastro'
          ? [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(80),
              textoAparado(3, 80),
            ]
          : [],
      ],
      email: ['', modo !== 'nova-senha' ? [Validators.required, Validators.email] : []],
      senha: ['', comSenha ? [Validators.required, Validators.minLength(8), (c: AbstractControl) => typeof c.value === 'string' && new TextEncoder().encode(c.value).length > 72 ? { limiteBcrypt: true } : null] : []],
      confirmar: ['', comConfirmacao ? [Validators.required] : []],
      ciente: [false, modo === 'cadastro' ? [Validators.requiredTrue] : []],
    },
    { validators: comConfirmacao ? [senhasIguais] : [] },
  );
}

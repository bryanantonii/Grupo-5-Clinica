# Aula 12 — Autenticação com JWT e Senhas com Hash

> Apresentação: **Regras de Negócio, JWT e Criptografia — Aulas 11, 12 e 13** (slides 7 a 11 e 16, no Classroom).
> Versão usada em todo o projeto: **NestJS 11 · @nestjs/jwt · bcryptjs · Mongoose 9**.

Esta página liga cada conceito da **Aula 12 (Autenticação e JWT)** aos arquivos do projeto. Nesta aula, o papel **Segurança** lidera a implementação dos módulos centrais de usuários e autenticação, enquanto os demais colegas auxiliam e preparam as rotas dos seus módulos.

## Onde ver cada conceito no projeto

| Slide | Conceito | Onde está no projeto |
| --- | --- | --- |
| 7 | Autenticação (quem é você? `401`) × Autorização (o que pode fazer? `403`) | `backend/src/auth/` (Aula 12) e `guards/perfis.guard.ts` (Aula 13) |
| 8 | JWT como crachá assinado: Header, Payload (`sub`, `nome`, `perfil`, `exp: 1h`) e Assinatura | `backend/src/auth/auth.service.ts` (`jwtService.signAsync`) |
| 9 | Cuidados com o token e `@ApiBearerAuth()` no Swagger | `backend/.env.example` (`JWT_SECRET`) · `produtos.controller.ts` (`@ApiBearerAuth()`) |
| 10 | Senha nunca em texto: hash com salt (`bcryptjs`) e `select: false` | `backend/src/usuarios/schemas/usuario.schema.ts` · `usuarios.service.ts` |
| 11 | Estrutura NestJS, Guard global (`APP_GUARD`) e decorator `@Publico()` | `backend/src/auth/` · `backend/src/usuarios/` |
| 11 | Testes obrigatórios que definem o comportamento esperado | `backend/testes-obrigatorios/` (`usuarios.service.spec.ts` e `auth.service.spec.ts`) |

## Experimente antes de começar

1. Abra [`backend/src/produtos/produtos.controller.ts`](../../backend/src/produtos/produtos.controller.ts) e repare no decorator `@ApiBearerAuth()` no topo da classe.
2. Abra [`backend/.env.example`](../../backend/.env.example) e veja a variável necessária:
   ```env
   JWT_SECRET=troque-por-um-texto-longo-e-aleatorio-com-pelo-menos-32-caracteres
   ```
   Copie essa linha para o seu `backend/.env`.
3. Abra a pasta [`backend/testes-obrigatorios/`](../../backend/testes-obrigatorios/) e leia o arquivo `LEIA-ME.md`: os testes já estão prontos e dizem exatamente como `UsuariosService` e `AuthService` devem se comportar.

## Autenticação × Autorização (slide 7)

- **Autenticação (Aula 12):** verifica a identidade do usuário (e-mail + senha). Se falhar, devolve **`401 Unauthorized`** ("Credenciais inválidas" ou "Token não informado").
- **Autorização (Aula 13):** verifica o que o usuário autenticado tem permissão para executar. Se não tiver o perfil necessário, devolve **`403 Forbidden`** ("Seu perfil não tem permissão para esta ação").

## Senha com Hash e Salt (`bcryptjs`) (slide 10)

Nunca guarde senhas em texto puro no banco. Use `bcryptjs`:

```ts
import * as bcrypt from 'bcryptjs';

// No UsuariosService (ao cadastrar):
const senhaHash = await bcrypt.hash(dto.senha, 10);

// No AuthService (no login):
const senhaValida = await bcrypt.compare(senhaDigitada, usuario.senhaHash);
```

- **Salt:** string aleatória adicionada a cada senha antes do hash (duas senhas iguais geram hashes completamente diferentes).
- **Lento de propósito:** impede ataques rápidos de força bruta.
- **`select: false` no Schema:** garanta que `senhaHash` nunca seja retornado por padrão em buscas do Mongoose:
  ```ts
  @Prop({ required: true, select: false })
  senhaHash: string;
  ```
  Para buscar a senha no momento do login, use explicitamente `.select('+senhaHash')`.

## O Crachá JWT e o Guard Global (slides 8, 9 e 11)

Ao autenticar com sucesso, a API assina um token contendo:
- `sub`: o `_id` do usuário
- `nome`: nome do usuário
- `perfil`: perfil de acesso (`admin`, `atendente`, etc.)
- `exp`: validade de 1 hora (`expiresIn: '1h'`)

Toda rota do sistema exige o token automaticamente através de um Guard registrado globalmente (`APP_GUARD`), exceto as rotas públicas (como `POST /api/v1/auth/login`), marcadas com o decorator customizado `@Publico()`.

## Estrutura esperada dos módulos (nomes exatos)

Crie os arquivos respeitando rigorosamente estes nomes e caminhos:

```
backend/src/
  usuarios/
    schemas/usuario.schema.ts
    dto/create-usuario.dto.ts
    usuarios.service.ts
    usuarios.controller.ts
    usuarios.module.ts
  auth/
    decorators/publico.decorator.ts
    guards/jwt-auth.guard.ts
    dto/login.dto.ts
    usuario-logado.ts
    auth.service.ts
    auth.controller.ts
    auth.module.ts
```

### 1. `publico.decorator.ts`
```ts
import { SetMetadata } from '@nestjs/common';
export const ROTA_PUBLICA = 'rotaPublica';
export const Publico = () => SetMetadata(ROTA_PUBLICA, true);
```

### 2. `jwt-auth.guard.ts`
```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROTA_PUBLICA } from '../decorators/publico.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publica = this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (publica) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token não informado');
    }

    const [tipo, token] = authHeader.split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token malformado');
    }

    try {
      request.usuario = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }
}
```

### 3. Registro no `auth.module.ts`
```ts
@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
```

## Os Testes Obrigatórios

Conforme indicado em `backend/testes-obrigatorios/LEIA-ME.md`:
1. Copie `backend/testes-obrigatorios/usuarios.service.spec.ts` para `backend/src/usuarios/usuarios.service.spec.ts`.
2. Copie `backend/testes-obrigatorios/auth.service.spec.ts` para `backend/src/auth/auth.service.spec.ts`.
3. Rode `npm test` até que todos os testes passem (sem alterar os testes, apenas implementando seu código).

## Primeiro Usuário Administrador no `seed.ts`

Adicione a criação do primeiro admin com senha já em hash ao final do `backend/src/seed/seed.ts`:

```ts
const Usuario = mongoose.model('Usuario', UsuarioSchema, 'usuarios');
await Usuario.deleteMany({});
await Usuario.create({
  nome: 'Administrador',
  email: 'admin@sistema.com',
  senhaHash: await bcrypt.hash('Admin@123', 10),
  perfil: 'admin',
  ativo: true,
});
console.log('✔ Usuário administrador inserido (admin@sistema.com / Admin@123)');
```

## Atividade da aula (slide 16 — Checkpoint C4, parte 2)

- [ ] Instalar as dependências: `cd backend && npm install @nestjs/jwt bcryptjs && npm install -D @types/bcryptjs`
- [ ] Definir `JWT_SECRET` no `.env` (mínimo 32 caracteres)
- [ ] Criar os módulos `usuarios` e `auth` conforme os esqueletos acima e o Manual de Construção
- [ ] Copiar os testes obrigatórios de `backend/testes-obrigatorios/` e garantir que passam com `npm test`
- [ ] Atualizar o `seed.ts` com o usuário admin e rodar `npm run seed`
- [ ] **Todos os alunos:** adicionar `@ApiBearerAuth()` no topo dos seus controllers e testar no Swagger:
  1. Chamar sem token → deve devolver `401 Unauthorized`;
  2. Fazer login em `POST /api/v1/auth/login` com as credenciais do admin;
  3. Clicar no botão verde **Authorize** no topo do Swagger, colar o token e testar as rotas novamente → deve responder com sucesso (`200` / `201`).
- [ ] Responder às **perguntas de verificação da Aula 12** em `docs/respostas-<nome>.md`:
  1. Qual a diferença entre autenticação e autorização?
  2. Por que a senha é guardada como hash e não criptografada de forma reversível?
  3. O que vai dentro do seu token e por que não colocamos o e-mail ou a senha nele?

> Na **Aula 13**, você vai implementar a autorização por perfis (`@Perfis`), o interceptor de autenticação no front-end e ligar todas as telas do Angular à API real. Siga para [`guia/aulas/aula-13.md`](aula-13.md).


import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfissionaisModule } from './profissionais/profissionais.module';
import { ConveniosModule } from './convenios/convenios.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';
import { ConsultasModule } from './consultas/consultas.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Lê o arquivo .env (copie o .env.example para .env)
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexão com o MongoDB usando a variável MONGODB_URI
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/projeto-integrador',
        ),
      }),
    }),

    // Módulos disponíveis da Clinora.
    ProfissionaisModule,
    ConveniosModule,
    AuthModule,
    PacientesModule,
    EspecialidadesModule,
    ConsultasModule,
    RelatoriosModule,
  ],
})
export class AppModule {}

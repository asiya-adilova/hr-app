import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './employees/employees.module';
import { RelativesModule } from './relatives/relatives.module';
import { EducationsModule } from './educations/educations.module';
import { WorkExperiencesModule } from './work-experiences/work-experiences.module';
import { ReferencesModule } from './references/references.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SecurityModule,
    EmployeesModule,
    RelativesModule,
    EducationsModule,
    WorkExperiencesModule,
    ReferencesModule,
  ],
})
export class AppModule {}

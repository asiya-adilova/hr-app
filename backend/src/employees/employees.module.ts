import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { RelativesModule } from '../relatives/relatives.module';
import { EducationsModule } from '../educations/educations.module';
import { WorkExperiencesModule } from '../work-experiences/work-experiences.module';

@Module({
  imports: [RelativesModule, EducationsModule, WorkExperiencesModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}

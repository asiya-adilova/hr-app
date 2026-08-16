import { Module } from '@nestjs/common';
import { GendersController } from './genders/genders.controller';
import { GendersService } from './genders/genders.service';
import { CitizenshipsController } from './citizenships/citizenships.controller';
import { CitizenshipsService } from './citizenships/citizenships.service';
import { NationalitiesController } from './nationalities/nationalities.controller';
import { NationalitiesService } from './nationalities/nationalities.service';
import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';
import { PositionsController } from './positions/positions.controller';
import { PositionsService } from './positions/positions.service';
import { EmploymentTypesController } from './employment-types/employment-types.controller';
import { EmploymentTypesService } from './employment-types/employment-types.service';
import { EducationLevelsController } from './education-levels/education-levels.controller';
import { EducationLevelsService } from './education-levels/education-levels.service';
import { MaritalStatusesController } from './marital-statuses/marital-statuses.controller';
import { MaritalStatusesService } from './marital-statuses/marital-statuses.service';
import { DriverLicenseCategoriesController } from './driver-license-categories/driver-license-categories.controller';
import { DriverLicenseCategoriesService } from './driver-license-categories/driver-license-categories.service';

@Module({
  controllers: [
    GendersController,
    CitizenshipsController,
    NationalitiesController,
    DepartmentsController,
    PositionsController,
    EmploymentTypesController,
    EducationLevelsController,
    MaritalStatusesController,
    DriverLicenseCategoriesController,
  ],
  providers: [
    GendersService,
    CitizenshipsService,
    NationalitiesService,
    DepartmentsService,
    PositionsService,
    EmploymentTypesService,
    EducationLevelsService,
    MaritalStatusesService,
    DriverLicenseCategoriesService,
  ],
})
export class ReferencesModule {}

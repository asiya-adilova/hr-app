import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { toApiResponse } from '../common/response/service-result-mapper';
import { ServiceResult } from '../common/response/service-result';
import { ApiDataResponse } from '../common/swagger/api-data-response';
import { Auth } from '../security/decorators/auth.decorator';
import { GendersService } from './genders/genders.service';
import { CitizenshipsService } from './citizenships/citizenships.service';
import { NationalitiesService } from './nationalities/nationalities.service';
import { DepartmentsService } from './departments/departments.service';
import { PositionsService } from './positions/positions.service';
import { EmploymentTypesService } from './employment-types/employment-types.service';
import { EducationLevelsService } from './education-levels/education-levels.service';
import { MaritalStatusesService } from './marital-statuses/marital-statuses.service';
import { DriverLicenseCategoriesService } from './driver-license-categories/driver-license-categories.service';
import { CountriesService } from './countries/countries.service';
import { CitiesService } from './cities/cities.service';
import { ReferenceMapResponseDto } from './dto/reference-map-response.dto';

@ApiTags('References')
@Auth()
@Controller('references')
export class ReferencesController {
  constructor(
    private readonly gendersService: GendersService,
    private readonly citizenshipsService: CitizenshipsService,
    private readonly nationalitiesService: NationalitiesService,
    private readonly departmentsService: DepartmentsService,
    private readonly positionsService: PositionsService,
    private readonly employmentTypesService: EmploymentTypesService,
    private readonly educationLevelsService: EducationLevelsService,
    private readonly maritalStatusesService: MaritalStatusesService,
    private readonly driverLicenseCategoriesService: DriverLicenseCategoriesService,
    private readonly countriesService: CountriesService,
    private readonly citiesService: CitiesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Все справочники одним запросом' })
  @ApiDataResponse(ReferenceMapResponseDto)
  async getAll() {
    const [
      genders,
      citizenships,
      nationalities,
      departments,
      positions,
      employmentTypes,
      educationLevels,
      maritalStatuses,
      driverLicenseCategories,
      countries,
      cities,
    ] = await Promise.all([
      this.gendersService.getAll(),
      this.citizenshipsService.getAll(),
      this.nationalitiesService.getAll(),
      this.departmentsService.getAll(),
      this.positionsService.getAll(),
      this.employmentTypesService.getAll(),
      this.educationLevelsService.getAll(),
      this.maritalStatusesService.getAll(),
      this.driverLicenseCategoriesService.getAll(),
      this.countriesService.getAll(),
      this.citiesService.getAll(),
    ]);

    const failed = [
      genders,
      citizenships,
      nationalities,
      departments,
      positions,
      employmentTypes,
      educationLevels,
      maritalStatuses,
      driverLicenseCategories,
      countries,
      cities,
    ].find((result) => !result.successful);

    if (failed) {
      return toApiResponse(failed);
    }

    return toApiResponse(
      ServiceResult.success({
        genders: genders.result,
        citizenships: citizenships.result,
        nationalities: nationalities.result,
        departments: departments.result,
        positions: positions.result,
        employmentTypes: employmentTypes.result,
        educationLevels: educationLevels.result,
        maritalStatuses: maritalStatuses.result,
        driverLicenseCategories: driverLicenseCategories.result,
        countries: countries.result,
        cities: cities.result,
      }),
    );
  }
}

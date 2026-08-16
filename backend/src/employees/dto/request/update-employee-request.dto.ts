import { PartialType } from '@nestjs/swagger';

import { CreateEmployeeDto } from './create-employee-request.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

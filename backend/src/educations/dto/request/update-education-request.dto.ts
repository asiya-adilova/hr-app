import { PartialType } from '@nestjs/swagger';
import { CreateEducationDto } from './create-education-request.dto';

export class UpdateEducationDto extends PartialType(CreateEducationDto) {}

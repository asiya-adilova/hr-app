import { PartialType } from '@nestjs/swagger';
import { CreateRelativeDto } from './create-relative-request.dto';

export class UpdateRelativeDto extends PartialType(CreateRelativeDto) {}

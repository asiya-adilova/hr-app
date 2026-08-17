import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateEducationDto } from './create-education-request.dto';

export class ReplaceEducationsDto {
  @ApiProperty({ type: [CreateEducationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationDto)
  items!: CreateEducationDto[];
}

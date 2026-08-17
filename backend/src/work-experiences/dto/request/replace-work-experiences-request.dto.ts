import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateWorkExperienceDto } from './create-work-experience-request.dto';

export class ReplaceWorkExperiencesDto {
  @ApiProperty({ type: [CreateWorkExperienceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkExperienceDto)
  items!: CreateWorkExperienceDto[];
}

import { Module } from '@nestjs/common';
import { WorkExperiencesController } from './work-experiences.controller';
import { WorkExperiencesService } from './work-experiences.service';

@Module({
  controllers: [WorkExperiencesController],
  providers: [WorkExperiencesService],
  exports: [WorkExperiencesService],
})
export class WorkExperiencesModule {}

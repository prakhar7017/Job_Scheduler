import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../schemas/job.schema';
import { JobExecution, JobExecutionSchema } from '../schemas/job-execution.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobExecution.name, schema: JobExecutionSchema },
    ]),
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../scheduler/dto/job.dto';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @ApiProperty({ description: 'Unique identifier for the job' })
  @Prop({ required: true, unique: true })
  jobId: string;

  @ApiProperty({ description: 'Name of the job' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Type of job schedule (hourly, daily, weekly)', enum: JobType })
  @Prop({ required: true, enum: JobType })
  type: JobType;

  @ApiProperty({ description: 'Job configuration parameters' })
  @Prop({ type: Object, required: true })
  config: {
    minute?: number;
    hour?: number;
    dayOfWeek?: number;
  };

  @ApiProperty({ description: 'Cron expression for the job' })
  @Prop({ required: true })
  cronExpression: string;

  @ApiProperty({ description: 'Optional payload data for the job' })
  @Prop({ type: Object })
  payload?: any;

  @ApiProperty({ description: 'Next scheduled run time' })
  @Prop()
  nextRunAt: Date;

  @ApiProperty({ description: 'Last run time' })
  @Prop()
  lastRunAt?: Date;

  @ApiProperty({ description: 'Status of the job (active, paused, completed, failed)' })
  @Prop({ default: 'active' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @Prop()
  createdAt?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Prop()
  updatedAt?: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);

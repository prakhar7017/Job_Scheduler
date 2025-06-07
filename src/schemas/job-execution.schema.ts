import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type JobExecutionDocument = JobExecution & Document;

@Schema({ timestamps: true })
export class JobExecution {
  @ApiProperty({ description: 'Reference to the job (UUID)' })
  @Prop({ type: String, required: true })
  jobId: string;

  @ApiProperty({ description: 'Name of the job' })
  @Prop({ required: true })
  jobName: string;

  @ApiProperty({ description: 'Execution start time' })
  @Prop({ required: true })
  startTime: Date;

  @ApiProperty({ description: 'Execution end time' })
  @Prop()
  endTime?: Date;

  @ApiProperty({ description: 'Duration of execution in milliseconds' })
  @Prop()
  duration?: number;

  @ApiProperty({ description: 'Status of the execution (success, failed)' })
  @Prop({ required: true })
  status: string;

  @ApiProperty({ description: 'Error message if execution failed' })
  @Prop()
  errorMessage?: string;

  @ApiProperty({ description: 'Output or result of the job execution' })
  @Prop()
  output?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @Prop()
  createdAt?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Prop()
  updatedAt?: Date;
}

export const JobExecutionSchema = SchemaFactory.createForClass(JobExecution);

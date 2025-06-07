import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum JobType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export class JobConfig {
  @ApiProperty({ description: 'Minute of the hour (0-59)', required: false })
  @IsOptional()
  minute?: number;

  @ApiProperty({ description: 'Hour of the day (0-23)', required: false })
  @IsOptional()
  hour?: number;

  @ApiProperty({ description: 'Day of the week (0-6, Sunday to Saturday)', required: false })
  @IsOptional()
  dayOfWeek?: number;
}

export class JobDto {
  @ApiProperty({ description: 'Name of the job', example: 'Daily Report' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Type of job schedule', 
    enum: JobType,
    example: JobType.DAILY
  })
  @IsNotEmpty()
  @IsEnum(JobType)
  type: JobType;

  @ApiProperty({ 
    description: 'Job configuration based on type',
    type: JobConfig,
    example: { hour: 8, minute: 30 }
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => JobConfig)
  config: JobConfig;

  @ApiProperty({ 
    description: 'Optional payload data for the job', 
    required: false,
    example: { reportType: 'sales' }
  })
  @IsOptional()
  payload?: any;
}

export class CreateJobResponseDto {
  @ApiProperty({ description: 'Unique identifier for the created job' })
  jobId: string;
  
  @ApiProperty({ description: 'Response message' })
  message: string;
}

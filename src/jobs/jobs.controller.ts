import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JobsService } from './jobs.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('executions')
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private readonly jobsService: JobsService) {}

  @OnEvent('execute_job')
  async handleJobExecution(data: any) {
    this.logger.log(`Received job execution request: ${JSON.stringify(data)}`);
    await this.jobsService.executeJob(data);
  }
  
  @Get('executions')
  @ApiOperation({ summary: 'Get job execution history' })
  @ApiQuery({ name: 'jobId', required: false, description: 'Filter by job ID' })
  @ApiResponse({ status: 200, description: 'List of job executions' })
  async getExecutionHistory(@Query('jobId') jobId?: string) {
    return this.jobsService.getJobExecutionHistory(jobId);
  }
  
  @Get('executions/:id')
  @ApiOperation({ summary: 'Get job execution by ID' })
  @ApiParam({ name: 'id', description: 'Job execution ID' })
  @ApiResponse({ status: 200, description: 'Job execution details' })
  @ApiResponse({ status: 404, description: 'Job execution not found' })
  async getExecutionById(@Param('id') id: string) {
    const execution = await this.jobsService.getJobExecutionHistory(id);
    if (!execution || execution.length === 0) {
      return { error: 'Job execution not found' };
    }
    return execution[0];
  }
}

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CreateJobResponseDto, JobDto } from './dto/job.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully', type: CreateJobResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid job configuration' })
  async createJob(@Body() jobDto: JobDto): Promise<CreateJobResponseDto> {
    const jobId = await this.schedulerService.createJob(jobDto);
    return {
      jobId,
      message: `Job created successfully with ID: ${jobId}`,
    };
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all scheduled jobs' })
  @ApiResponse({ status: 200, description: 'List of all scheduled jobs' })
  async getAllJobs() {
    return this.schedulerService.getAllJobs();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get job details by ID' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobById(@Param('id') jobId: string) {
    const job = await this.schedulerService.getJobById(jobId);
    if (!job) {
      return { error: 'Job not found' };
    }
    return job;
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Delete a job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID to delete' })
  @ApiResponse({ status: 200, description: 'Job deletion result' })
  async deleteJob(@Param('id') jobId: string) {
    const result = await this.schedulerService.deleteJob(jobId);
    return {
      success: result,
      message: result ? `Job ${jobId} deleted successfully` : `Failed to delete job ${jobId}`,
    };
  }
}

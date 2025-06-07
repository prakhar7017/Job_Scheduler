import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { v4 as uuidv4 } from 'uuid';
import { JobDto, JobType } from './dto/job.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../schemas/job.schema';
import { JobExecution, JobExecutionDocument } from '../schemas/job-execution.schema';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private eventEmitter: EventEmitter2,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobExecution.name) private jobExecutionModel: Model<JobExecutionDocument>,
  ) {}

  /**
   * Creates a new job based on the provided job DTO
   */
  async createJob(jobDto: JobDto): Promise<string> {
    const jobId = uuidv4();
    
    try {
      let cronExpression: string;
      
      switch (jobDto.type) {
        case JobType.HOURLY:
          cronExpression = this.createHourlyCronExpression(jobDto.config.minute || 0);
          break;
        case JobType.DAILY:
          cronExpression = this.createDailyCronExpression(jobDto.config.hour || 0, jobDto.config.minute || 0);
          break;
        case JobType.WEEKLY:
          cronExpression = this.createWeeklyCronExpression(jobDto.config.dayOfWeek || 0, jobDto.config.hour || 0, jobDto.config.minute || 0);
          break;
        default:
          throw new Error(`Unsupported job type: ${jobDto.type}`);
      }
      
      this.logger.log(`Creating job ${jobId} with cron expression: ${cronExpression}`);
      
      const job = new CronJob(cronExpression, () => {
        this.executeJob(jobId, jobDto);
      });
      
      // Store job in MongoDB
      const nextRunDate = job.nextDate().toJSDate();
      await this.jobModel.create({
        jobId,
        name: jobDto.name,
        type: jobDto.type,
        config: jobDto.config,
        cronExpression,
        payload: jobDto.payload,
        nextRunAt: nextRunDate,
        status: 'active'
      });
      
      this.schedulerRegistry.addCronJob(jobId, job);
      job.start();
      
      return jobId;
    } catch (error) {
      this.logger.error(`Error creating job: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Creates an hourly job that runs at the specified minute
   */
  private createHourlyJob(jobId: string, jobDto: JobDto): void {
    const { minute = 0 } = jobDto.config;
    
    // Validate minute is between 0-59
    if (minute < 0 || minute > 59) {
      throw new Error('Minute must be between 0 and 59');
    }
    
    // Cron expression for hourly job at specific minute: minute hour * * *
    const cronExpression = `${minute} * * * *`;
    this.addCronJob(jobId, cronExpression, jobDto);
  }

  /**
   * Creates a daily job that runs at the specified time
   */
  private createDailyJob(jobId: string, jobDto: JobDto): void {
    const { hour = 0, minute = 0 } = jobDto.config;
    
    // Validate hour is between 0-23
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }
    
    // Validate minute is between 0-59
    if (minute < 0 || minute > 59) {
      throw new Error('Minute must be between 0 and 59');
    }
    
    // Cron expression for daily job at specific time: minute hour * * *
    const cronExpression = `${minute} ${hour} * * *`;
    this.addCronJob(jobId, cronExpression, jobDto);
  }

  /**
   * Creates a weekly job that runs on the specified day at the specified time
   */
  private createWeeklyJob(jobId: string, jobDto: JobDto): void {
    const { dayOfWeek = 0, hour = 0, minute = 0 } = jobDto.config;
    
    // Validate dayOfWeek is between 0-6 (Sunday-Saturday)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }
    
    // Validate hour is between 0-23
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }
    
    // Validate minute is between 0-59
    if (minute < 0 || minute > 59) {
      throw new Error('Minute must be between 0 and 59');
    }
    
    // Cron expression for weekly job: minute hour * * dayOfWeek
    const cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;
    this.addCronJob(jobId, cronExpression, jobDto);
  }

  /**
   * Adds a cron job to the scheduler registry
   */
  private addCronJob(jobId: string, cronExpression: string, jobDto: JobDto): void {
    const job = new CronJob(cronExpression, () => {
      this.executeJob(jobId, jobDto);
    });
    
    this.schedulerRegistry.addCronJob(jobId, job);
    job.start();
    
    this.logger.log(`Job ${jobId} scheduled with cron: ${cronExpression}`);
  }

  /**
   * Executes the job by sending a message to the job service
   */
  private executeJob(jobId: string, jobDto: JobDto): void {
    this.logger.log(`Executing job ${jobId}`);
    
    // Emit event for job execution
    this.eventEmitter.emit('execute_job', {
      id: jobId,
      name: jobDto.name,
      payload: jobDto.payload,
      timestamp: new Date().toISOString(),
    });
    
    // Also log to console for demonstration purposes
    console.log(`Hello World from job ${jobId} (${jobDto.name}) at ${new Date().toISOString()}`);
  }

  /**
   * Gets all scheduled jobs
   */
  async getAllJobs(): Promise<any[]> {
    // Get all jobs from MongoDB
    const dbJobs = await this.jobModel.find().exec();
    
    // Get all cron jobs from registry
    const cronJobs = this.schedulerRegistry.getCronJobs();
    const activeJobs: { jobId: string; nextRun: Date }[] = [];
    
    cronJobs.forEach((job, jobId) => {
      activeJobs.push({
        jobId,
        nextRun: job.nextDate().toJSDate(),
      });
    });
    
    // Combine data from MongoDB and cron registry
    return dbJobs.map(job => {
      const activeJob = activeJobs.find(aj => aj.jobId === job.jobId);
      return {
        ...job.toObject(),
        active: !!activeJob,
        nextRun: activeJob ? activeJob.nextRun : job.nextRunAt
      };
    });
  }
  
  /**
   * Get job details by ID
   */
  async getJobById(jobId: string): Promise<any> {
    // Get job from MongoDB
    const job = await this.jobModel.findOne({ jobId }).exec();
    if (!job) return null;
    
    // Check if job is active in the scheduler registry
    let isActive = false;
    let nextRun = job.nextRunAt;
    
    try {
      const cronJob = this.schedulerRegistry.getCronJob(jobId);
      isActive = true;
      nextRun = cronJob.nextDate().toJSDate();
    } catch (error) {
      // Job not found in registry, it's inactive
      isActive = false;
    }
    
    // Get execution history
    const executions = await this.jobExecutionModel.find({ jobId })
      .sort({ startTime: -1 })
      .limit(10)
      .exec();
    
    return {
      ...job.toObject(),
      active: isActive,
      nextRun,
      executions
    };
  }

  /**
   * Deletes a job by ID
   */
  async deleteJob(jobId: string): Promise<boolean> {
    try {
      // Delete from scheduler registry
      try {
        this.schedulerRegistry.deleteCronJob(jobId);
      } catch (error) {
        this.logger.warn(`Job ${jobId} not found in scheduler registry: ${error.message}`);
      }
      
      // Delete from MongoDB
      const result = await this.jobModel.deleteOne({ jobId }).exec();
      
      if (result.deletedCount > 0) {
        this.logger.log(`Job ${jobId} deleted from database`);
        return true;
      } else {
        this.logger.warn(`Job ${jobId} not found in database`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to delete job ${jobId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Creates a cron expression for hourly jobs
   */
  private createHourlyCronExpression(minute: number): string {
    return `0 ${minute} * * * *`;
  }

  /**
   * Creates a cron expression for daily jobs
   */
  private createDailyCronExpression(hour: number, minute: number): string {
    return `0 ${minute} ${hour} * * *`;
  }

  /**
   * Creates a cron expression for weekly jobs
   */
  private createWeeklyCronExpression(dayOfWeek: number, hour: number, minute: number): string {
    return `0 ${minute} ${hour} * * ${dayOfWeek}`;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { writeFile, appendFile } from 'fs/promises';
import { join } from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../schemas/job.schema';
import { JobExecution, JobExecutionDocument } from '../schemas/job-execution.schema';

interface JobExecutionPayload {
  id: string;
  name: string;
  payload?: any;
  timestamp: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly outputFilePath = join(process.cwd(), 'job-outputs.log');

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobExecution.name) private jobExecutionModel: Model<JobExecutionDocument>,
  ) {}

  /**
   * Executes a job and logs the output
   */
  async executeJob(data: JobExecutionPayload): Promise<void> {
    this.logger.log(`Executing job: ${data.id} (${data.name})`);
    const startTime = new Date();
    
    try {
      // Format time with AM/PM indication
      const formattedTime = startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // This ensures AM/PM format
      });
      const formattedDate = startTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Generate output message with formatted time
      const outputMessage = `Hello World from job ${data.id} (${data.name}) at ${formattedDate}, ${formattedTime}`;
      
      // Log to console
      console.log(outputMessage);
      
      // Also log to a file
      const logMessage = `[${data.timestamp}] Job ${data.id} (${data.name}): Hello World\n`;
      await appendFile(this.outputFilePath, logMessage);
      
      // Find the job in the database
      const job = await this.jobModel.findOne({ jobId: data.id }).exec();
      
      // Record job execution in MongoDB
      const endTime = new Date();
      const executionRecord = await this.jobExecutionModel.create({
        jobId: data.id,
        jobName: data.name,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        status: 'success',
        output: outputMessage,
      });
      
      // Update the job's lastRunAt field
      if (job) {
        job.lastRunAt = endTime;
        await job.save();
      }
      
      this.logger.log(`Job execution recorded with ID: ${executionRecord._id}`);
      this.logger.log(`Job output logged to file: ${this.outputFilePath}`);
    } catch (error) {
      // Record failed execution
      const endTime = new Date();
      await this.jobExecutionModel.create({
        jobId: data.id,
        jobName: data.name,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        status: 'failed',
        errorMessage: error.message,
      });
      
      this.logger.error(`Failed to execute job: ${error.message}`);
    }
  }
  
  /**
   * Get job execution history
   */
  async getJobExecutionHistory(jobId?: string): Promise<JobExecutionDocument[]> {
    if (jobId) {
      return this.jobExecutionModel.find({ jobId }).sort({ startTime: -1 }).exec();
    }
    return this.jobExecutionModel.find().sort({ startTime: -1 }).limit(100).exec();
  }
}

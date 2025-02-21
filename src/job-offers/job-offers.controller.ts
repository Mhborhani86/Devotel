import { Controller, Get, Post, Query, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { Job } from './entities/job.entity';
import { JobFilterDto } from './dto/jobFilterDto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';


@ApiTags('Job Offers')
@Controller('job-offers')
export class JobOffersController {
  private readonly logger = new Logger(JobOffersController.name);

  constructor(private readonly jobOffersService: JobOffersService) {}

  @Get('provider1')
  @ApiOperation({ summary: 'Fetch jobs from provider one' })
  @ApiResponse({ status: 200, description: 'Successfully fetched jobs from provider one', type: [Job] })
  @ApiResponse({ status: 404, description: 'No jobs found from provider one' })
  async fetchJobsFromProviderOne(): Promise<Job[]> {
    try {
      this.logger.log('Fetching job data from provider one...');
      const jobs = await this.jobOffersService.fetchJobsFromProviderOne();
      if (!jobs || jobs.length === 0) {
        this.logger.warn('No jobs found in the response from provider one');
        throw new NotFoundException('No jobs found');
      }
      this.logger.log(`${jobs.length} jobs fetched successfully from provider one`);
      return jobs;
    } catch (error) {
      this.logger.error('Error occurred while fetching jobs from provider one', error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while fetching job data from provider one');
    }
  }

  @Get('provider2')
  @ApiOperation({ summary: 'Fetch jobs from provider two' })
  @ApiResponse({ status: 200, description: 'Successfully fetched jobs from provider two', type: [Job] })
  @ApiResponse({ status: 404, description: 'No jobs found from provider two' })
  async fetchJobsFromProviderTwo(): Promise<Job[]> {
    try {
      this.logger.log('Fetching job data from provider two...');
      const jobs = await this.jobOffersService.fetchJobsFromProviderTwo();
      if (!jobs || jobs.length === 0) {
        this.logger.warn('No jobs found in the response from provider two');
        throw new NotFoundException('No jobs found');
      }
      this.logger.log(`${jobs.length} jobs fetched successfully from provider two`);
      return jobs;
    } catch (error) {
      this.logger.error('Error occurred while fetching jobs from provider two', error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while fetching job data from provider two');
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import jobs from all providers' })
  @ApiResponse({ status: 200, description: 'Successfully imported jobs', type: String })
  async importJobs(): Promise<string> {
    try {
      const jobs = await this.jobOffersService.importJobsFromProviders();
      if (jobs && jobs.length > 0) {
        return 'Successfully imported jobs.';
      } else {
        return 'No jobs found to import.';
      }
    } catch (error) {
      this.logger.error('Failed to import jobs', error.stack);
      throw new Error('Failed to import jobs. Please try again later.');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get jobs with filters' })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Job title to filter by' })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Job location to filter by' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of jobs per page' })
  @ApiResponse({ status: 200, description: 'Jobs fetched successfully', type: [Job] })
  @ApiResponse({ status: 400, description: 'Invalid query parameters provided' })
  async getJobs(@Query() filterDto: JobFilterDto) {
    try {
      const result = await this.jobOffersService.getJobsWithFilters(filterDto);
      return {
        message: 'Jobs fetched successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          message: 'Invalid query parameters provided',
          status: 'error',
          details: error.message,
        };
      }
      return {
        message: error.message || 'Failed to fetch jobs',
        status: 'error',
      };
    }
  }
}

import { Injectable,Logger, NotFoundException, BadRequestException} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as process from 'process';
import * as dotenv from 'dotenv';
import { JobFilterDto } from './dto/jobFilterDto';

dotenv.config();
@Injectable()
export class JobOffersService {
  private readonly logger = new Logger(JobOffersService.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Job) private jobRepository: Repository<Job>,
  ) {}

  public async fetchJobsFromProviderOne(): Promise<Job[]> {
    const apiProviderOneUrl = process.env.URL_PROVIDER_ONE ?? "https://assignment.devotel.io/api/provider1/jobs";
    try {
      const response = await this.httpService.get(apiProviderOneUrl).toPromise();
      if (response?.data?.jobs && response.data.jobs.length > 0) 
      {
        this.logger.log('Data fetched Provider One successfully');
        const jobsData = response.data.jobs;
        const jobs: Job[] = jobsData.map(jobData => {
          const job = new Job();
          job.jobId = jobData.jobId;
          job.title = jobData.title;
          job.location = jobData.details.location ?? 'N/A';
          job.type = jobData.details.type ?? 'N/A';
          job.salaryRange = jobData.details.salaryRange ?? 'N/A';
          job.companyName = jobData.company.name ?? 'N/A';
          job.industry = jobData.company.industry ?? 'N/A';
          job.website = jobData.website ?? 'N/A';  
          job.experienc = jobData.experienc ?? null;          
          job.skills = jobData.skills;
          job.postedDate = jobData.postedDate;
          job.postedDate = jobData.postedDate;  
          return job;
        });  
        return jobs;
      } else {
        this.logger.warn('No jobs found in the response');
        throw new NotFoundException('No jobs found in the response');
      }
    } catch (error) {
      this.logger.error('Error occurred while fetching data', error.stack);
      throw new BadRequestException('Error fetching job provider one data');
    }
  }

  public async fetchJobsFromProviderTwo(): Promise<Job[]> {
    const apiProviderTwoUrl = process.env.URL_PROVIDER_TWO ?? "https://assignment.devotel.io/api/provider2/jobs";
    try {
      this.logger.log(`Fetching data from: ${apiProviderTwoUrl}`);
      const response = await this.httpService.get(apiProviderTwoUrl).toPromise();      
      if (response?.data) {
        this.logger.log('Data fetched Provider Two successfully');
        const jobsList = response.data.data.jobsList;
        const jobs = Object.keys(jobsList).map(jobKey => {
          const job = jobsList[jobKey];
          const jobData = {
            jobId: jobKey,
            title: job.position,
            location: [job.location.city, job.location.state].join(","),
            type: job.location.remote === true ? 'Remote' : 'N/A',
            salaryRange: this.formatSalaryRange(job.compensation.min, job.compensation.max),
            companyName: job.employer.companyName ?? 'N/A',
            industry: job.industry ?? 'N/A', 
            website: job.employer.website,            
            experienc: job.requirements.experience,
            skills: job.requirements.technologies,
            postedDate: new Date(job.datePosted ?? Date()),
          };          
          return jobData;
        });        
        return jobs;
      } else {
        this.logger.warn('No data found in the response');
        throw new NotFoundException('No data found in the response');
      }
    } catch (error) {
      this.logger.error('Error occurred while fetching data', error.stack);
      throw new BadRequestException('Error fetching job provider one data');
    }
  }

  @Cron(process.env.JOB_IMPORT_CRON ?? CronExpression.EVERY_10_SECONDS)
  public async importJobsFromProviders(): Promise<string> {
    
    try {
      const providerOneJobs = await this.fetchJobsFromProviderOne();
      const providerTwoJobs = await this.fetchJobsFromProviderTwo();
      const allJobs = [...providerOneJobs, ...providerTwoJobs];
      if (allJobs.length > 0) {
        const savedJobs = await this.saveJobs(allJobs);
        return `Successfully imported ${savedJobs.length} jobs.`;
      } else {
        return 'No jobs found to import.';
      }
    } catch (error) {
      this.logger.error('Error importing jobs', error.stack);
      throw new BadRequestException('Failed to import jobs.');
    }
  }
  public async saveJobs(jobs: Job[]): Promise<Job[]> {
    const existingJobs = await this.jobRepository.find({
      where: jobs.map(job => ({ jobId: job.jobId })),
      select: ['jobId'],
    });
    const existingJobIds = existingJobs.map(job => job.jobId);
    const jobsToSave = jobs.filter(job => !existingJobIds.includes(job.jobId));
    if (jobsToSave.length > 0) {
      await this.jobRepository.save(jobsToSave);
    }
    return jobsToSave;
  }

 public async getJobsWithFilters(filterDto: JobFilterDto): Promise<any> {
    const { title, location, page, pageSize } = filterDto;    
    try {      
      const query = this.jobRepository.createQueryBuilder('job');      
      if (title) {
        query.andWhere('job.title ILIKE :title', { title: `%${title}%` });
      }
      if (location) {
        query.andWhere('job.location ILIKE :location', { location: `%${location}%` });
      }
      query.skip((page - 1) * pageSize).take(pageSize);
      const [jobs, total] = await query.getManyAndCount();      
      if (!jobs || jobs.length === 0) {
        throw new NotFoundException('No jobs found with the provided filters');
      }
      const totalPages = Math.ceil(total / pageSize);
      return {
        data: jobs,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      this.logger.error('Error while fetching jobs', error.stack);
      throw new BadRequestException('Failed to fetch jobs');
    }
  }
  
  private formatSalaryRange(minSalary: string,maxSalary: string): string {    
    const minFormatted = `${Math.round(parseInt(minSalary) / 1000)}k`;
    const maxFormatted = `${Math.round(parseInt(maxSalary) / 1000)}k`;
    return `$${minFormatted} - $${maxFormatted}`;
  }
   
}

import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersService } from './job-offers.service';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { of,throwError  } from 'rxjs';

import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('JobOffersService', () => {
  let service: JobOffersService;
  let jobRepository: Repository<Job>;
  let httpService: HttpService;

  const mockJobRepository = {
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: getRepositoryToken(Job), useValue: mockJobRepository },
      ],
    }).compile();

    service = module.get<JobOffersService>(JobOffersService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    httpService = module.get<HttpService>(HttpService);
  });

  describe('fetchJobsFromProviderOne', () => {
    it('should return jobs when data is fetched successfully', async () => {
      const mockResponse = {
        data: {
          jobs: [
            {
              jobId: 'job-1',
              title: 'Software Engineer',
              details: { location: 'New York, NY', type: 'Remote', salaryRange: '80k-120k' },
              company: { name: 'Tech Co.', industry: 'Software' },
              website: 'https://techco.com',
              experienc: 3,
              skills: ['JavaScript', 'Node.js'],
              postedDate: '2025-02-10T12:00:00Z',
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const jobs = await service.fetchJobsFromProviderOne();
      
      expect(jobs).toHaveLength(1);
      expect(jobs[0].jobId).toBe('job-1');
      expect(jobs[0].title).toBe('Software Engineer');
      expect(jobs[0].salaryRange).toBe('80k-120k');
    });
    
    it('should throw BadRequestException on error', async () => {
      mockHttpService.get.mockReturnValueOnce(throwError(() => new Error('Error fetching data')));

      await expect(service.fetchJobsFromProviderOne()).rejects.toThrow(BadRequestException);
    });
  });

  describe('fetchJobsFromProviderTwo', () => {
    it('should return jobs when data is fetched successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            jobsList: {
              'job-2': {
                position: 'Frontend Developer',
                location: { city: 'Los Angeles', state: 'CA', remote: true },
                compensation: { min: '70000', max: '100000' },
                employer: { companyName: 'Design Corp', website: 'https://designcorp.com' },
                requirements: { experience: 2, technologies: ['React', 'CSS'] },
                datePosted: '2025-02-15T14:00:00Z',
              },
            },
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const jobs = await service.fetchJobsFromProviderTwo();
      
      expect(jobs).toHaveLength(1);
      expect(jobs[0].jobId).toBe('job-2');
      expect(jobs[0].title).toBe('Frontend Developer');
      expect(jobs[0].salaryRange).toBe('$70k - $100k');
    });

    it('should throw BadRequestException on error', async () => {
      mockHttpService.get.mockReturnValueOnce(throwError(() => new Error('Error fetching data')));

      await expect(service.fetchJobsFromProviderTwo()).rejects.toThrow(BadRequestException);
    });
  });

  describe('importJobsFromProviders', () => {
    it('should import jobs successfully from both providers', async () => {
      const providerOneJobs = [
        { jobId: 'job-1', title: 'Software Engineer', location: 'New York, NY', type: 'Remote', salaryRange: '80k-120k', companyName: 'Tech Co.', industry: 'Software', website: 'https://techco.com', experienc: 3, skills: ['JavaScript', 'Node.js'], postedDate: new Date() },
      ];

      const providerTwoJobs = [
        { jobId: 'job-2', title: 'Frontend Developer', location: 'Los Angeles, CA', type: 'Remote', salaryRange: '$70k - $100k', companyName: 'Design Corp', industry: 'Design', website: 'https://designcorp.com', experienc: 2, skills: ['React', 'CSS'], postedDate: new Date() },
      ];

      jest.spyOn(service, 'fetchJobsFromProviderOne').mockResolvedValue(providerOneJobs);
      jest.spyOn(service, 'fetchJobsFromProviderTwo').mockResolvedValue(providerTwoJobs);
      jest.spyOn(service, 'saveJobs').mockResolvedValue([...providerOneJobs, ...providerTwoJobs]);

      const result = await service.importJobsFromProviders();
      expect(result).toBe('Successfully imported 2 jobs.');
    });

    it('should return "No jobs found to import" when no jobs are available', async () => {
      jest.spyOn(service, 'fetchJobsFromProviderOne').mockResolvedValue([]);
      jest.spyOn(service, 'fetchJobsFromProviderTwo').mockResolvedValue([]);

      const result = await service.importJobsFromProviders();
      expect(result).toBe('No jobs found to import.');
    });
  });

  describe('getJobsWithFilters', () => {
    it('should return filtered jobs', async () => {
      const mockJobs = [
        { jobId: 'job-1', title: 'Software Engineer', location: 'New York, NY', type: 'Remote', salaryRange: '80k-120k', companyName: 'Tech Co.', industry: 'Software', website: 'https://techco.com', experienc: 3, skills: ['JavaScript', 'Node.js'], postedDate: new Date() },
      ];

      mockJobRepository.getManyAndCount.mockResolvedValue([mockJobs, 1]);

      const result = await service.getJobsWithFilters({ title: 'Software', location: 'New York', page: 1, pageSize: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});

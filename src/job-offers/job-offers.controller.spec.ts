import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from './job-offers.service';
import { Job } from './entities/job.entity';
import { NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JobFilterDto } from './dto/jobFilterDto';

describe('JobOffersController', () => {
  let controller: JobOffersController;
  let service: JobOffersService;

  const mockJobService = {
    fetchJobsFromProviderOne: jest.fn(),
    fetchJobsFromProviderTwo: jest.fn(),
    importJobsFromProviders: jest.fn(),
    getJobsWithFilters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOffersController],
      providers: [
        { provide: JobOffersService, useValue: mockJobService },
      ],
    }).compile();

    controller = module.get<JobOffersController>(JobOffersController);
    service = module.get<JobOffersService>(JobOffersService);
  });

  describe('fetchJobsFromProviderOne', () => {
    it('should return jobs from provider one successfully', async () => {
      const mockJobs: Job[] = [
        {
          jobId: 'job-1',
          title: 'Software Engineer',
          location: 'New York, NY',
          type: 'Remote',
          salaryRange: '80k-120k',
          companyName: 'Tech Co.',
          website: 'https://techco.com',
          experienc: 3,
          industry: 'Software',
          skills: ['JavaScript', 'Node.js'],
          postedDate: new Date(),
        },
      ];
      
      mockJobService.fetchJobsFromProviderOne.mockResolvedValue(mockJobs);
      const result = await controller.fetchJobsFromProviderOne();
      expect(result).toEqual(mockJobs);
      expect(mockJobService.fetchJobsFromProviderOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no jobs are found', async () => {
      mockJobService.fetchJobsFromProviderOne.mockResolvedValue([]);       
      await expect(controller.fetchJobsFromProviderOne()).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockJobService.fetchJobsFromProviderOne.mockRejectedValue(new Error('Internal Error'));
      await expect(controller.fetchJobsFromProviderOne()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('fetchJobsFromProviderTwo', () => {
    it('should return jobs from provider two successfully', async () => {
      const mockJobs: Job[] = [
        {
          jobId: 'job-2',
          title: 'Product Manager',
          location: 'San Francisco, CA',
          type: 'Full-time',
          salaryRange: '100k-150k',
          companyName: 'Tech Corp',
          website: 'https://techcorp.com',
          experienc: 5,
          industry: 'Technology',
          skills: ['Product Management', 'Agile'],
          postedDate: new Date(),
        },
      ];

      mockJobService.fetchJobsFromProviderTwo.mockResolvedValue(mockJobs);
      const result = await controller.fetchJobsFromProviderTwo();
      expect(result).toEqual(mockJobs);
      expect(mockJobService.fetchJobsFromProviderTwo).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no jobs are found', async () => {
      mockJobService.fetchJobsFromProviderTwo.mockResolvedValue([]);
      await expect(controller.fetchJobsFromProviderTwo()).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockJobService.fetchJobsFromProviderTwo.mockRejectedValue(new Error('Internal Error'));
      await expect(controller.fetchJobsFromProviderTwo()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('importJobs', () => {
    it('should return success message when jobs are imported', async () => {
      mockJobService.importJobsFromProviders.mockResolvedValue('Successfully imported jobs.');
      const result = await controller.importJobs();
      expect(result).toBe('Successfully imported jobs.');
      expect(mockJobService.importJobsFromProviders).toHaveBeenCalled();
    });
    
    it('should throw error message when import fails', async () => {
      mockJobService.importJobsFromProviders.mockRejectedValue(new Error('Failed to import jobs'));
      await expect(controller.importJobs()).rejects.toThrowError('Failed to import jobs. Please try again later.');
    });
  });

  describe('getJobs', () => {
    it('should return jobs with filters successfully', async () => {
      const filterDto: JobFilterDto = { title: 'Engineer', location: 'NY', page: 1, pageSize: 10 };
      const mockResult = {
        data: [{ jobId: 'job-1', title: 'Software Engineer', location: 'New York, NY', type: 'Remote', salaryRange: '80k-120k' }],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      };

      mockJobService.getJobsWithFilters.mockResolvedValue(mockResult);
      const result = await controller.getJobs(filterDto);
      expect(result.message).toBe('Jobs fetched successfully');
      expect(result.data).toEqual(mockResult);
    });

    it('should return error message when BadRequestException is thrown', async () => {
      const filterDto: JobFilterDto = { title: 'Engineer', location: 'NY', page: 1, pageSize: 10 };
      const mockError = new BadRequestException('Invalid query parameters provided');
      mockJobService.getJobsWithFilters.mockRejectedValue(mockError);
      const result = await controller.getJobs(filterDto);
      expect(result.message).toBe('Invalid query parameters provided');
      expect(result.status).toBe('error');
      expect(result.details).toBe('Invalid query parameters provided');
    });

    it('should return general error message when an error occurs', async () => {
      const filterDto: JobFilterDto = { title: 'Engineer', location: 'NY', page: 1, pageSize: 10 };
      mockJobService.getJobsWithFilters.mockRejectedValue(new Error('General Error'));
      const result = await controller.getJobs(filterDto);
      expect(result.message).toBe('General Error');
      expect(result.status).toBe('error');
    });
  });
});

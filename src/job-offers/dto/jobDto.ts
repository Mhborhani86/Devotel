import { IsString, MaxLength, IsArray, IsDateString, IsNumber } from 'class-validator';

export class JobDto {
  @IsString()
  @MaxLength(255)
  jobId: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(255)
  location: string;

  @IsString()
  @MaxLength(255)
  type: string;

  @IsString()
  @MaxLength(255)
  salaryRange: string;

  @IsString()
  @MaxLength(255)
  companyName: string;

  @IsString()
  @MaxLength(255)
  website: string;

  @IsNumber()
  experienc: number;
  
  @IsString()
  @MaxLength(255)
  industry: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsDateString()
  postedDate: Date;
}

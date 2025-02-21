import { IsOptional, IsString, IsInt, Min, Max, IsPositive, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JobFilterDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty if provided.' })
  @ApiProperty({ description: 'The title of the job to filter by', required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Location cannot be empty if provided.' })
  @ApiProperty({ description: 'The location of the job to filter by', required: false })
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page number must be greater than or equal to 1.' })
  @ApiProperty({ description: 'Page number for pagination', default: 1, required: false })
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page size must be greater than or equal to 1.' })
  @Max(100, { message: 'Page size must be less than or equal to 100.' })
  @ApiProperty({ description: 'Number of jobs per page', default: 10, required: false })
  pageSize: number = 10;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'The number should be positive.' })
  @ApiProperty({ description: 'An additional filter number', required: false })
  someNumber?: number;
}

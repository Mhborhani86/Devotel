import { Entity, PrimaryColumn, Column } from 'typeorm';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Job {
  @PrimaryColumn()
  @ApiProperty({ description: 'Unique identifier for the job' })
  jobId: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'The title of the job' })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'The location of the job' })
  location: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'The type of the job (e.g. full-time, part-time, remote)' })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Salary range for the job (e.g. 65k-85k)' })
  salaryRange: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'The company offering the job' })
  companyName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @ApiProperty({ description: 'The website of the company', required: false })
  website: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @ApiProperty({ description: 'Required years of experience', required: false })
  experienc: number;

  @Column({ type: 'varchar', length: 255 })
  @IsOptional()
  @ApiProperty({ description: 'Industry of the job', required: false })
  industry: string;

  @Column('text', { array: true })
  @ApiProperty({ description: 'Skills required for the job', type: [String] })
  skills: string[];

  @Column({ type: 'timestamptz' })
  @ApiProperty({ description: 'Date when the job was posted' })
  postedDate: Date;
}

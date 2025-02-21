import { Module ,Logger} from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import { Job } from './entities/job.entity';
dotenv.config();

@Module({
  imports: [HttpModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: process.env.DATABASE_ADDRESS ?? 'localhost',
            port: parseInt(process.env.DATABASE_PORT ?? '5432'),
            username: process.env.DATABASE_USERNAME ?? 'postgres',
            password: process.env.DATABASE_PASSWORD ?? 'Sql123456',
            database: process.env.DATABASE_NAME ?? 'job_offers',
            entities: [Job],
            synchronize: true,
            logging: true,
            extra: {
              ssl: false,
            },
          });
          await dataSource.initialize();
          Logger.log('Connected to the PostgreSQL database successfully.', 'Database');
          return dataSource.options;
        } catch (error) {
          Logger.error('Database connection failed!', error.stack, 'Database');
          throw error;
        }
      },
      
    }),
    TypeOrmModule.forFeature([Job]),
    ScheduleModule.forRoot(),
  ],
  controllers: [JobOffersController],
  providers: [JobOffersService],
})
export class JobOffersModule {}
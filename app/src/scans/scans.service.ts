import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  Repository,
  FindOptionsWhere,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import { Scan } from './scans.entity';
import { User } from 'src/users/user.entity';
import { CreateScanInput } from './inputs/create-scan.input';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';
import { ScanFiltersInput } from './inputs/scan-filters.input';
import { ScansResponse } from './types/scans-response.type';
import { ScanStats } from './types/scan-stats.type';
import { isValidDateString } from 'src/commom/utils/date.utils';
import { ScanSortBy } from './enums/scan-sort-by.enum';
import { ScanStatus } from './enums/scan-status.enum';
import { SortOrder } from 'src/commom/enums/sort-order.enum';

const CREATABLE_SCAN_STATUSES = [ScanStatus.DRAFT, ScanStatus.QUEUED];

@Injectable()
export class ScansService {
  private readonly logger = new Logger(ScansService.name);

  constructor(
    @InjectRepository(Scan)
    private readonly scansRepository: Repository<Scan>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectQueue('scans')
    private readonly scansQueue: Queue,
  ) {}

  async findById(scanId: string, userId: string): Promise<Scan> {
    if (!scanId) {
      throw new BadRequestException('Scan id is required');
    }

    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const scan = await this.scansRepository.findOne({
        where: {
          id: scanId,
          user: { id: userId },
        },
        relations: ['user', 'vulnerabilities'],
      });

      if (!scan) {
        throw new NotFoundException(
          `Scan with ID ${scanId} not found or you don't have permission to access it`,
        );
      }

      return scan;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve scan',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findMany(
    userId: string,
    paginationArgs: PaginationArgs,
    filters?: ScanFiltersInput,
  ): Promise<ScansResponse> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 10 } = paginationArgs;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Scan> = {
      user: { id: userId },
    };

    if (filters) {
      const { search, status, createdAfter, createdBefore } = filters;

      if (search) {
        where.url = ILike(`%${search}%`);
      }

      if (status) {
        where.status = status;
      }

      if (createdAfter && !isValidDateString(createdAfter)) {
        throw new BadRequestException('Invalid createdAfter date');
      }

      if (createdBefore && !isValidDateString(createdBefore)) {
        throw new BadRequestException('Invalid createdBefore date');
      }

      if (createdAfter && createdBefore) {
        where.createdAt = Between(
          new Date(createdAfter),
          new Date(createdBefore),
        );
      } else if (createdAfter) {
        where.createdAt = MoreThanOrEqual(new Date(createdAfter));
      } else if (createdBefore) {
        where.createdAt = LessThanOrEqual(new Date(createdBefore));
      }
    }

    const sortFieldMap: Record<ScanSortBy, keyof Scan> = {
      [ScanSortBy.CREATED_AT]: 'createdAt',
      [ScanSortBy.UPDATED_AT]: 'updatedAt',
      [ScanSortBy.URL]: 'url',
    };

    const sortBy: ScanSortBy =
      filters?.sortBy && Object.values(ScanSortBy).includes(filters.sortBy)
        ? filters.sortBy
        : ScanSortBy.CREATED_AT;

    const sortOrder: SortOrder =
      filters?.sortOrder && Object.values(SortOrder).includes(filters.sortOrder)
        ? filters.sortOrder
        : SortOrder.DESC;

    const order: Record<string, 'asc' | 'desc'> = {
      [sortFieldMap[sortBy]]: sortOrder,
    };

    const [scans, total] = await this.scansRepository.findAndCount({
      where,
      relations: ['user'],
      order,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      scans,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async createScan(input: CreateScanInput, userId: string): Promise<Scan> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    if (!input.url?.trim()) {
      throw new BadRequestException('Scan URL is required');
    }

    if (input.status && !CREATABLE_SCAN_STATUSES.includes(input.status)) {
      throw new BadRequestException(
        `Invalid status "${input.status}" for scan creation. Only "draft" and "queued" are allowed.`,
      );
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const scan = await this.scansRepository.manager.transaction(
      async (manager) => {
        try {
          const newScan = manager.create(Scan, {
            url: input.url.trim(),
            status: input.status ?? ScanStatus.DRAFT,
            user,
          });

          const savedScan = await manager.save(Scan, newScan);

          const scanWithRelations = await manager.findOne(Scan, {
            where: { id: savedScan.id },
            relations: ['user'],
          });

          if (!scanWithRelations) {
            throw new InternalServerErrorException(
              'Failed to reload scan with relations',
            );
          }

          return scanWithRelations;
        } catch (error) {
          if (
            error instanceof NotFoundException ||
            error instanceof BadRequestException
          ) {
            throw error;
          }

          throw new InternalServerErrorException(
            'Failed to create scan',
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    );

    if (scan.status === ScanStatus.QUEUED) {
      try {
        await this.scansQueue.add('scan', {
          scanId: scan.id,
          url: scan.url,
        });
        this.logger.log(`Scan ${scan.id} added to queue`);
      } catch (error) {
        this.logger.error(`Failed to add scan ${scan.id} to queue:`, error);

        scan.status = ScanStatus.FAILED;
        await this.scansRepository.save(scan);
      }
    }

    return scan;
  }

  async startScan(scanId: string, userId: string): Promise<Scan> {
    const scan = await this.findById(scanId, userId);

    if (scan.status !== ScanStatus.DRAFT) {
      throw new BadRequestException(
        `Only DRAFT scans can be started. Current status: "${scan.status}"`,
      );
    }

    scan.status = ScanStatus.QUEUED;
    await this.scansRepository.save(scan);

    try {
      await this.scansQueue.add('scan', {
        scanId: scan.id,
        url: scan.url,
      });
      this.logger.log(`Scan ${scan.id} added to queue`);
    } catch (error) {
      this.logger.error(`Failed to add scan ${scan.id} to queue:`, error);
      scan.status = ScanStatus.FAILED;
      await this.scansRepository.save(scan);
    }

    return scan;
  }

  async getScansStats(userId: string): Promise<ScanStats> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const results = await this.scansRepository
        .createQueryBuilder('scan')
        .select([
          'COUNT(*) AS "totalScans"',
          `SUM(CASE WHEN scan.status = '${ScanStatus.DRAFT}' THEN 1 ELSE 0 END) AS "draftCount"`,
          `SUM(CASE WHEN scan.status = '${ScanStatus.QUEUED}' THEN 1 ELSE 0 END) AS "queuedCount"`,
          `SUM(CASE WHEN scan.status = '${ScanStatus.ACTIVE}' THEN 1 ELSE 0 END) AS "activeCount"`,
          `SUM(CASE WHEN scan.status = '${ScanStatus.COMPLETED}' THEN 1 ELSE 0 END) AS "completedCount"`,
          `SUM(CASE WHEN scan.status = '${ScanStatus.FAILED}' THEN 1 ELSE 0 END) AS "failedCount"`,
        ])
        .where('scan.userId = :userId', { userId })
        .getRawOne<{
          totalScans: string;
          draftCount: string;
          queuedCount: string;
          activeCount: string;
          completedCount: string;
          failedCount: string;
        }>();

      return {
        totalScans: Number(results?.totalScans) || 0,
        scansByStatus: {
          draft: Number(results?.draftCount) || 0,
          queued: Number(results?.queuedCount) || 0,
          active: Number(results?.activeCount) || 0,
          completed: Number(results?.completedCount) || 0,
          failed: Number(results?.failedCount) || 0,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve scan statistics',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

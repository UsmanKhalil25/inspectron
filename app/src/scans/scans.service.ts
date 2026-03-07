import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { isValidDateString } from 'src/commom/utils/date.utils';
import { ScanSortBy } from './enums/scan-sort-by.enum';
import { SortOrder } from 'src/commom/enums/sort-order.enum';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(Scan)
    private readonly scansRepository: Repository<Scan>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
        relations: ['user'],
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
      const { search, createdAfter, createdBefore } = filters;

      if (search) {
        where.url = ILike(`%${search}%`);
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

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.scansRepository.manager.transaction(async (manager) => {
      try {
        const scan = manager.create(Scan, {
          url: input.url.trim(),
          user,
        });

        const savedScan = await manager.save(Scan, scan);

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
    });
  }
}

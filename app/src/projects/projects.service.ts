import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';

import { Project } from './project.entity';
import { User } from 'src/users/user.entity';
import { Scan } from 'src/scans/scans.entity';
import { ScanStatus } from 'src/scans/enums/scan-status.enum';
import { Vulnerability } from 'src/scans/vulnerability.entity';
import { VulnerabilitySeverity } from 'src/scans/enums/vulnerability-severity.enum';
import { ProjectVulnerabilityStats } from './types/project-vulnerability-stats.type';
import { CreateProjectInput } from './inputs/create-project.input';
import { UpdateProjectInput } from './inputs/update-project.input';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';
import { ProjectFiltersInput } from './inputs/project-filters.input';
import { ProjectsResponse } from './types/projects-response.type';
import { ProjectSortBy } from './enums/project-sort-by.enum';
import { SortOrder } from 'src/commom/enums/sort-order.enum';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Scan)
    private readonly scansRepository: Repository<Scan>,
    @InjectRepository(Vulnerability)
    private readonly vulnerabilityRepository: Repository<Vulnerability>,
  ) {}

  async findById(projectId: string, userId: string): Promise<Project> {
    if (!projectId) {
      throw new BadRequestException('Project id is required');
    }

    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const project = await this.projectsRepository.findOne({
      where: { id: projectId, user: { id: userId } },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${projectId} not found or you don't have permission to access it`,
      );
    }

    const scanCount = await this.scansRepository.count({
      where: { project: { id: projectId } },
    });

    const lastScan = await this.scansRepository.findOne({
      where: { project: { id: projectId } },
      order: { createdAt: 'DESC' },
    });

    project.scanCount = scanCount;
    project.lastScanStatus = lastScan?.status ?? null;

    return project;
  }

  async findMany(
    userId: string,
    paginationArgs: PaginationArgs,
    filters?: ProjectFiltersInput,
  ): Promise<ProjectsResponse> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 10 } = paginationArgs;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Project> = {
      user: { id: userId },
    };

    if (filters?.search) {
      where.name = ILike(`%${filters.search}%`);
    }

    const sortFieldMap: Record<ProjectSortBy, keyof Project> = {
      [ProjectSortBy.CREATED_AT]: 'createdAt',
      [ProjectSortBy.UPDATED_AT]: 'updatedAt',
      [ProjectSortBy.NAME]: 'name',
    };

    const sortBy: ProjectSortBy = filters?.sortBy ?? ProjectSortBy.CREATED_AT;
    const sortOrder: SortOrder = filters?.sortOrder ?? SortOrder.DESC;

    const order: Record<string, 'asc' | 'desc'> = {
      [sortFieldMap[sortBy]]: sortOrder,
    };

    const [projects, total] = await this.projectsRepository.findAndCount({
      where,
      relations: ['user'],
      order,
      skip,
      take: limit,
    });

    for (const project of projects) {
      const scanCount = await this.scansRepository.count({
        where: { project: { id: project.id } },
      });

      const lastScan = await this.scansRepository.findOne({
        where: { project: { id: project.id } },
        order: { createdAt: 'DESC' },
      });

      project.scanCount = scanCount;
      project.lastScanStatus = lastScan?.status ?? null;
    }

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      projects,
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

  async createProject(
    input: CreateProjectInput,
    userId: string,
  ): Promise<Project> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProject = await this.projectsRepository.findOne({
      where: { url: input.url.trim() },
    });

    if (existingProject) {
      throw new ConflictException(
        `A project with URL "${input.url.trim()}" already exists`,
      );
    }

    try {
      const project = this.projectsRepository.create({
        name: input.name.trim(),
        url: input.url.trim(),
        description: input.description?.trim() || undefined,
        user,
      });

      const savedProject = await this.projectsRepository.save(project);

      const result = await this.projectsRepository.findOne({
        where: { id: savedProject.id },
        relations: ['user'],
      });

      if (!result) {
        throw new InternalServerErrorException(
          'Failed to reload project with relations',
        );
      }

      result.scanCount = 0;
      result.lastScanStatus = null;

      return result;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create project',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async updateProject(
    projectId: string,
    input: UpdateProjectInput,
    userId: string,
  ): Promise<Project> {
    const project = await this.findById(projectId, userId);

    if (input.url) {
      const existingProject = await this.projectsRepository.findOne({
        where: { url: input.url.trim() },
      });

      if (existingProject && existingProject.id !== projectId) {
        throw new ConflictException(
          `A project with URL "${input.url.trim()}" already exists`,
        );
      }
    }

    try {
      Object.assign(project, {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.url !== undefined && { url: input.url.trim() }),
        ...(input.description !== undefined && {
          description: input.description?.trim() || null,
        }),
      });

      await this.projectsRepository.save(project);

      return this.findById(projectId, userId);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update project',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const project = await this.findById(projectId, userId);

    try {
      await this.projectsRepository.remove(project);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete project',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getProjectVulnerabilityStats(
    userId: string,
  ): Promise<ProjectVulnerabilityStats[]> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const projects = await this.projectsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    const stats: ProjectVulnerabilityStats[] = [];

    for (const project of projects) {
      const results = await this.vulnerabilityRepository
        .createQueryBuilder('vuln')
        .innerJoin('vuln.scan', 'scan')
        .innerJoin('scan.project', 'proj')
        .where('proj.id = :projectId', { projectId: project.id })
        .select(['vuln.severity AS "severity"', 'COUNT(vuln.id) AS "count"'])
        .groupBy('vuln.severity')
        .getRawMany<{ severity: VulnerabilitySeverity; count: string }>();

      const severityMap: Record<string, number> = {};
      for (const r of results) {
        severityMap[r.severity] = Number(r.count);
      }

      stats.push({
        projectId: project.id,
        projectName: project.name,
        critical: severityMap[VulnerabilitySeverity.CRITICAL] || 0,
        high: severityMap[VulnerabilitySeverity.HIGH] || 0,
        medium: severityMap[VulnerabilitySeverity.MEDIUM] || 0,
        low: severityMap[VulnerabilitySeverity.LOW] || 0,
        info: severityMap[VulnerabilitySeverity.INFO] || 0,
        total:
          (severityMap[VulnerabilitySeverity.CRITICAL] || 0) +
          (severityMap[VulnerabilitySeverity.HIGH] || 0) +
          (severityMap[VulnerabilitySeverity.MEDIUM] || 0) +
          (severityMap[VulnerabilitySeverity.LOW] || 0) +
          (severityMap[VulnerabilitySeverity.INFO] || 0),
      });
    }

    return stats.sort((a, b) => b.total - a.total);
  }
}

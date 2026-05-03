import { Query, Mutation, Resolver, Context, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectInput } from './inputs/create-project.input';
import { UpdateProjectInput } from './inputs/update-project.input';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';
import { ProjectFiltersInput } from './inputs/project-filters.input';
import { Project } from './types/project.type';
import { ProjectsResponse } from './types/projects-response.type';
import { ProjectVulnerabilityStats } from './types/project-vulnerability-stats.type';
import { JwtPayload } from 'src/commom/interfaces/jwt-payload.interface';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => Project)
  @UseGuards(JwtAuthGuard)
  async project(
    @Args('id') id: string,
    @Context() context: { req: { user: JwtPayload } },
  ) {
    const userId = context.req.user.sub;
    return await this.projectsService.findById(id, userId);
  }

  @Query(() => ProjectsResponse)
  @UseGuards(JwtAuthGuard)
  async projects(
    @Context() context: { req: { user: JwtPayload } },
    @Args() paginationArgs: PaginationArgs,
    @Args('filters', { nullable: true }) filters?: ProjectFiltersInput,
  ) {
    const userId = context.req.user.sub;
    return await this.projectsService.findMany(userId, paginationArgs, filters);
  }

  @Mutation(() => Project)
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Context() context: { req: { user: JwtPayload } },
    @Args('input') input: CreateProjectInput,
  ) {
    const userId = context.req.user.sub;
    return await this.projectsService.createProject(input, userId);
  }

  @Mutation(() => Project)
  @UseGuards(JwtAuthGuard)
  async updateProject(
    @Context() context: { req: { user: JwtPayload } },
    @Args('id') id: string,
    @Args('input') input: UpdateProjectInput,
  ) {
    const userId = context.req.user.sub;
    return await this.projectsService.updateProject(id, input, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteProject(
    @Context() context: { req: { user: JwtPayload } },
    @Args('id') id: string,
  ) {
    const userId = context.req.user.sub;
    return await this.projectsService.deleteProject(id, userId);
  }

  @Query(() => [ProjectVulnerabilityStats])
  @UseGuards(JwtAuthGuard)
  async projectVulnerabilityStats(
    @Context() context: { req: { user: JwtPayload } },
  ) {
    const userId = context.req.user.sub;
    return await this.projectsService.getProjectVulnerabilityStats(userId);
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from 'src/users/user.entity';
import { Project } from 'src/projects/project.entity';
import { ScanStatus } from './enums/scan-status.enum';
import { ScanType } from './enums/scan-type.enum';
import { ScanAction } from './interfaces/scan-action.interface';
import { Vulnerability } from './vulnerability.entity';
import { PerformanceMetric } from './entities/performance-metric.entity';

@Entity()
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  url: string;

  @Column({
    type: 'enum',
    enum: ScanStatus,
    default: ScanStatus.DRAFT,
  })
  status: ScanStatus;

  @Column({
    type: 'enum',
    enum: ScanType,
    default: ScanType.STATIC,
  })
  scanType: ScanType;

  @Column({ type: 'text', nullable: true })
  threadId?: string;

  @Column({ type: 'text', nullable: true })
  runId?: string;

  @Column({ type: 'text', nullable: true })
  result?: string;

  @Column({ type: 'simple-json', nullable: true, default: '[]' })
  actions?: ScanAction[];

  @OneToMany(() => Vulnerability, (vulnerability) => vulnerability.scan, {
    cascade: true,
  })
  vulnerabilities: Vulnerability[];

  @OneToMany(() => PerformanceMetric, (pm) => pm.scan, { cascade: true })
  performanceMetrics: PerformanceMetric[];

  @ManyToOne(() => User, (user) => user.scans)
  user: User;

  @ManyToOne(() => Project, (project) => project.scans, { onDelete: 'CASCADE' })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

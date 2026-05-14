import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Scan } from '../scans.entity';

@Entity()
export class PerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'integer' })
  performanceScore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lcp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fcp: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  cls: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  inp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ttfb: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  speedIndex: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalBlockingTime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  domContentLoaded: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  onLoad: number;

  @Column({ type: 'bigint' })
  totalTransferSize: number;

  @Column({ type: 'integer' })
  resourceCount: number;

  @Column({ type: 'text', nullable: true, default: null })
  resources: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  opportunities: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  diagnostics: string | null;

  @Column({ type: 'uuid' })
  scanId: string;

  @ManyToOne(() => Scan, (scan) => scan.performanceMetrics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scanId' })
  scan: Scan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

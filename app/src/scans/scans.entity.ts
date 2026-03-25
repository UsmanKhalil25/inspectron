import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
} from 'typeorm';

import { User } from 'src/users/user.entity';
import { ScanStatus } from './enums/scan-status.enum';

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

	@Column({ type: 'text', nullable: true })
	threadId?: string

	@Column({ type: 'text', nullable: true })
	runId?: string

	@ManyToOne(() => User, (user) => user.scans)
	user: User;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}

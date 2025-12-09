import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  refresh_token_hash: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  device_name: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp' })
  expires_at: Date;
}

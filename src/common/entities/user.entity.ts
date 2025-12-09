import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Session } from './session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 30 })
  first_name: string;

  @Column({ length: 30 })
  last_name: string;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ unique: true, nullable: true })
  firebase_uid: string;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];
}

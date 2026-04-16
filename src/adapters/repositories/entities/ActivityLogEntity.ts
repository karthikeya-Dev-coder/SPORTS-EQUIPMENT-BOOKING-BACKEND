import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { ActivityLog } from "@/src/application/domain/entities";

@Entity("activity_logs")
export class ActivityLogEntity implements ActivityLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column()
  action!: string;

  @Column({ type: "text" })
  details!: string;

  @CreateDateColumn()
  timestamp!: Date;
}

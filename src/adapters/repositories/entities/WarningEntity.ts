import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Warning } from "@/src/application/domain/entities";
import { UserEntity } from "./UserEntity";

@Entity("warnings")
export class WarningEntity implements Warning {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  studentId!: string;

  @Column({ type: "text" })
  reason!: string;

  @Column({ type: "int" })
  level!: 1 | 2 | 3;

  @Column()
  issuedBy!: string;

  @CreateDateColumn()
  issuedAt!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ default: false })
  isPaid!: boolean;

  @Column({ nullable: true })
  paidAt?: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "studentId" })
  student!: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "issuedBy" })
  issuer!: UserEntity;

  toJSON() {
    return {
      ...this,
      studentName: this.student?.name,
      issuedByName: this.issuer?.name
    };
  }
}

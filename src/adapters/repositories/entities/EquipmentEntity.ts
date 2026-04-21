import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Equipment } from "@/src/application/domain/entities";
import { UserEntity } from "./UserEntity";

@Entity("equipment")
export class EquipmentEntity implements Equipment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ default: 0 })
  totalQuantity!: number;

  @Column({ default: 0 })
  available!: number;

  @Column({ default: 0 })
  inUse!: number;

  @Column({ nullable: true })
  assignedStaffId?: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: "assignedStaffId" })
  assignedStaff?: UserEntity;

  @CreateDateColumn()
  createdAt!: Date;

  // Manual mapping for clean JSON response
  toJSON() {
    const { assignedStaff, ...data } = this;
    return {
      ...data,
      assignedStaffName: assignedStaff?.name || undefined
    };
  }
}

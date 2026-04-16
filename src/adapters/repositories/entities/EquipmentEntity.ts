import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { Equipment } from "@/src/application/domain/entities";

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

  @CreateDateColumn()
  createdAt!: Date;
}

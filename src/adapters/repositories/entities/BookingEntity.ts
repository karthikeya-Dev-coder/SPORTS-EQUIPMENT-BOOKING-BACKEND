import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Booking } from "@/src/application/domain/entities";
import { UserEntity } from "./UserEntity";
import { EquipmentEntity } from "./EquipmentEntity";

@Entity("bookings")
export class BookingEntity implements Booking {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  studentId!: string;

  @Column()
  equipmentId!: string;

  @Column()
  date!: string;

  @Column()
  timeSlot!: string;

  @Column({ default: 1 })
  quantity!: number;

  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected", "returned", "overdue"],
    default: "pending"
  })
  status!: 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue';

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "studentId" })
  student!: UserEntity;

  @ManyToOne(() => EquipmentEntity)
  @JoinColumn({ name: "equipmentId" })
  equipment!: EquipmentEntity;

  // JSON transformation to include virtual names
  toJSON() {
    return {
      ...this,
      studentName: this.student?.name,
      equipmentName: this.equipment?.name
    };
  }
}

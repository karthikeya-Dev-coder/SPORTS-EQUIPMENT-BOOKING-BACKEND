import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "./UserEntity";

@Entity("staff_requests")
export class StaffRequestEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  staffId!: string;

  @Column()
  equipmentName!: string;

  @Column()
  quantity!: number;

  @Column({
    type: "enum",
    enum: ["pending", "fulfilled", "dismissed"],
    default: "pending"
  })
  status!: "pending" | "fulfilled" | "dismissed";

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "staffId" })
  staff!: UserEntity;
}

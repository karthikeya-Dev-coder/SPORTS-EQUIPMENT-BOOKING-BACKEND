import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { User, UserRole } from "@/src/application/domain/entities";

@Entity("users")
export class UserEntity implements User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false }) // Hide password by default
  password?: string;

  @Column({
    type: "enum",
    enum: ["admin", "staff", "student"],
    default: "student"
  })
  role!: UserRole;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  department?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: true })
  isActive!: boolean;
}

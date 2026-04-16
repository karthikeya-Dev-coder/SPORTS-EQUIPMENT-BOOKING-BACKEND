import { DataSource, Repository } from "typeorm";
import { BookingEntity } from "./entities/BookingEntity";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";

export class BookingRepository {
  private repository: Repository<BookingEntity>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(BookingEntity);
  }

  async findAll(query?: string): Promise<BookingEntity[]> {
    const qb = this.repository.createQueryBuilder("booking")
      .leftJoinAndSelect("booking.student", "student")
      .leftJoinAndSelect("booking.equipment", "equipment")
      .orderBy("booking.createdAt", "DESC");

    if (query) {
      qb.where("student.name ILIKE :q OR equipment.name ILIKE :q", { q: `%${query}%` });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<BookingEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ["student", "equipment"] });
  }

  async findByStudentId(studentId: string): Promise<BookingEntity[]> {
    return this.repository.find({ where: { studentId }, relations: ["student", "equipment"] });
  }

  async save(booking: Partial<BookingEntity>): Promise<BookingEntity> {
    return this.repository.save(booking);
  }

  async updateStatus(id: string, status: BookingEntity['status']): Promise<void> {
    await this.repository.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

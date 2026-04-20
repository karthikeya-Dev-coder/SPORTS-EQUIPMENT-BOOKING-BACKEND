import { DataSource, Repository } from "typeorm";
import { UserEntity } from "./entities/UserEntity";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";

export class UserRepository {
  private repository: Repository<UserEntity>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(UserEntity);
  }

  async findByEmail(email: string, includeOtp: boolean = false): Promise<UserEntity | null> {
    const select: (keyof UserEntity)[] = ["id", "name", "email", "password", "role", "isActive"];
    if (includeOtp) {
      select.push("resetOtp", "resetOtpExpiresAt");
    }
    return this.repository.findOne({
      where: { email },
      select
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async save(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.repository.save(user);
  }

  async findAll(query?: string): Promise<UserEntity[]> {
    if (query) {
      return this.repository.createQueryBuilder("user")
        .where("user.name ILIKE :q OR user.email ILIKE :q", { q: `%${query}%` })
        .getMany();
    }
    return this.repository.find();
  }
}

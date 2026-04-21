import { Request, Response, Router } from "express";
import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";
import { UserEntity } from "@/src/adapters/repositories/entities/UserEntity";
import { EquipmentEntity } from "@/src/adapters/repositories/entities/EquipmentEntity";
import { BookingEntity } from "@/src/adapters/repositories/entities/BookingEntity";
import { ActivityLogEntity } from "@/src/adapters/repositories/entities/ActivityLogEntity";
import { authenticate, authorize } from '../../infrastructure/middleware/standalone_auth';
import { AuthRequest } from "../../shared/authMiddleware";

export class DashboardController {
  public router = Router();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/stats", authenticate, authorize(["admin", "staff"]), this.getStats.bind(this));
    this.router.get("/live", authenticate, authorize(["admin", "staff"]), this.getLiveUsage.bind(this));
    this.router.get("/charts", authenticate, authorize(["admin", "staff"]), this.getCharts.bind(this));
    this.router.get("/logs", authenticate, authorize(["admin", "staff"]), this.getLogs.bind(this));
  }

  private async getLogs(req: AuthRequest, res: Response) {
    const logRepo = AppDataSource.getRepository(ActivityLogEntity);
    const userRepo = AppDataSource.getRepository(UserEntity);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const whereClause: any = {
      timestamp: MoreThanOrEqual(twoDaysAgo)
    };

    // Staff only see their own logs
    if (req.user!.role === "staff") {
      whereClause.userId = req.user!.id;
    }

    const logs = await logRepo.find({
      where: whereClause,
      order: { timestamp: "DESC" },
      take: 10
    });

    // Fetch user names manually
    const userIds = [...new Set(logs.map(l => l.userId))];
    const users = await userRepo.findByIds(userIds);
    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u.name;
      return acc;
    }, {} as Record<string, string>);

    const mappedLogs = logs.map(log => ({
      ...log,
      userName: userMap[log.userId] || "Unknown User"
    }));

    return res.json(mappedLogs);
  }

  private async getCharts(req: Request, res: Response) {
    const equipmentRepo = AppDataSource.getRepository(EquipmentEntity);
    const bookingRepo = AppDataSource.getRepository(BookingEntity);

    // 1. Equipment Utilization (Category-wise)
    const equipment = await equipmentRepo.find();
    const categoryData: Record<string, number> = {};
    equipment.forEach(e => {
      categoryData[e.category] = (categoryData[e.category] || 0) + e.inUse;
    });

    // 2. Weekly Trends (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Simplified weekly trend (grouping by Day of Week)
    const bookings = await bookingRepo.find(); // For a production app, filter by date in SQL
    const trendMap: Record<string, number> = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    bookings.forEach(b => {
      const dayIndex = new Date(b.createdAt).getDay();
      const day = dayNames[dayIndex];
      if (day && trendMap[day] !== undefined) {
        trendMap[day]++;
      }
    });

    return res.json({
      utilization: Object.keys(categoryData).map(name => ({ name, count: categoryData[name] })),
      trends: dayNames.map(day => ({ day, bookings: trendMap[day] }))
    });
  }

  private async getLiveUsage(req: Request, res: Response) {
    const bookingRepo = AppDataSource.getRepository(BookingEntity);

    // Fetch all bookings that are currently in-possession
    const liveBookings = await bookingRepo.find({
      where: [
        { status: "approved" },
        { status: "overdue" }
      ],
      relations: ["student", "equipment"],
      order: { date: "DESC" }
    });

    return res.json(liveBookings);
  }

  private async getStats(req: Request, res: Response) {
    const userRepo = AppDataSource.getRepository(UserEntity);
    const equipmentRepo = AppDataSource.getRepository(EquipmentEntity);
    const bookingRepo = AppDataSource.getRepository(BookingEntity);

    const [staffCount, studentCount, equipmentCount, bookingCount] = await Promise.all([
      userRepo.count({ where: { role: "staff" } }),
      userRepo.count({ where: { role: "student" } }),
      equipmentRepo.count(),
      bookingRepo.count()
    ]);

    const quantitySum = await equipmentRepo
      .createQueryBuilder("equipment")
      .select("SUM(equipment.totalQuantity)", "sum")
      .getRawOne();

    return res.json({
      staffCount,
      studentCount,
      equipmentCount,
      bookingCount,
      totalQuantitySum: parseInt(quantitySum.sum) || 0
    });
  }
}

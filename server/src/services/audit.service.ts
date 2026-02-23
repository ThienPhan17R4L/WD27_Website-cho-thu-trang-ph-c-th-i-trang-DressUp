import { AuditLogModel } from "../models/AuditLog";
import { Types } from "mongoose";

interface AuditChange {
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export const auditService = {
  async log(
    entity: string,
    entityId: string,
    action: string,
    performedBy?: string,
    changes: AuditChange[] = [],
    metadata?: Record<string, unknown>
  ) {
    await AuditLogModel.create({
      entity,
      entityId: new Types.ObjectId(entityId),
      action,
      performedBy: performedBy ? new Types.ObjectId(performedBy) : undefined,
      changes,
      metadata,
    } as any);
  },

  async getAuditTrail(entity: string, entityId: string) {
    return AuditLogModel.find({
      entity,
      entityId: new Types.ObjectId(entityId),
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  },

  async getRecentLogs(filters: {
    entity?: string;
    performedBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 200);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filters.entity) query.entity = filters.entity;
    if (filters.performedBy)
      query.performedBy = new Types.ObjectId(filters.performedBy);

    const [data, total] = await Promise.all([
      AuditLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLogModel.countDocuments(query),
    ]);

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  },
};

import { Schema, model, Types } from "mongoose";

export interface AuditLogDoc {
  _id: Types.ObjectId;
  entity: string;
  entityId: Types.ObjectId;
  action: string;
  performedBy?: Types.ObjectId;
  changes: Array<{
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<AuditLogDoc>(
  {
    entity: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "user" },
    changes: [
      {
        field: { type: String },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
        _id: false,
      },
    ],
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });

export const AuditLogModel = model<AuditLogDoc>("AuditLog", AuditLogSchema);

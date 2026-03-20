import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

export interface ITenant extends Document {
  tenantId: string;
  name: string;
  apiKey: string;
  created_at: Date;
}

const TenantSchema = new Schema<ITenant>({
  tenantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  apiKey: { 
    type: String, 
    unique: true, 
    default: () => crypto.randomBytes(20).toString('hex') 
  },
  created_at: { type: Date, default: Date.now }
});

export const Tenant = model<ITenant>('Tenant', TenantSchema);
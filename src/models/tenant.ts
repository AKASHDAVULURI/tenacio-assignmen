import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
  tenantId: string;
  name: string;
  apiKey?: string; // optional now
  created_at: Date;
}

const TenantSchema = new Schema<ITenant>({
  tenantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },

  //  Removed auto-generation
  //  Now API key will be generated via separate API
  apiKey: {
    type: String,
    unique: true,
    sparse: true, // important for optional unique field
    default: null
  },

  created_at: { type: Date, default: Date.now }
});

export const Tenant = model<ITenant>('Tenant', TenantSchema);
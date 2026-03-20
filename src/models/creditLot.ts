import { Schema, model, Document } from 'mongoose';

export interface ICreditLot extends Document {
  tenantId: string;
  amount: number;
  remaining: number;
  expiryDate: Date;
  createdAt: Date;
}

const CreditLotSchema = new Schema<ICreditLot>({
  tenantId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  remaining: { type: Number, required: true },
  expiryDate: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

export const CreditLot = model<ICreditLot>('CreditLot', CreditLotSchema);
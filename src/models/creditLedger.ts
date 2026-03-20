import { Schema, model, Document } from 'mongoose';

export interface ILedger extends Document {
  tenantId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  balanceAfter: number;
  timestamp: Date;
}

const LedgerSchema = new Schema<ILedger>({
  tenantId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  balanceAfter: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const Ledger = model<ILedger>('Ledger', LedgerSchema);
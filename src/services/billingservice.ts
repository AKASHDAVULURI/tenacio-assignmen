import { Tenant } from '../models/tenant';
import { CreditLot } from '../models/creditLot';
import { Ledger } from '../models/creditLedger';
import mongoose from 'mongoose';

export class BillingService {
  
  // 1. Calculate Total Balance (Sum of non-expired lots)
  static async getBalance(tenantId: string): Promise<number> {
    const activeLots = await CreditLot.find({
      tenantId,
      remaining: { $gt: 0 },
      expiryDate: { $gt: new Date() }
    });
    
    return activeLots.reduce((acc, lot) => acc + lot.remaining, 0);
  }

  // 2. FIFO Deduction Logic
  static async deductCredits(
  tenantId: string, 
  amountToDeduct: number, 
  serviceName: string, 
  session?: mongoose.ClientSession // <--- Allow passing external session
) {
  // Use the provided session or create a new one if not provided
  const internalSession = session || await mongoose.startSession();
  
  // Only start a transaction if we are managing the session internally
  if (!session) internalSession.startTransaction();

  try {
    const lots = await CreditLot.find({
      tenantId,
      remaining: { $gt: 0 },
      expiryDate: { $gt: new Date() }
    }).sort({ expiryDate: 1 }).session(internalSession);

    const totalAvailable = lots.reduce((acc, lot) => acc + lot.remaining, 0);
    console.log(`Total available credits for tenant ${tenantId}: ${totalAvailable}`);

    if (totalAvailable < amountToDeduct) {
      throw new Error('Insufficient credits');
    }

    let remainingToDeduct = amountToDeduct;
    for (const lot of lots) {
      if (remainingToDeduct <= 0) break;
      const deduction = Math.min(lot.remaining, remainingToDeduct);
      lot.remaining -= deduction;
      remainingToDeduct -= deduction;
      
      await lot.save({ session: internalSession });
    }

    const finalBalance = totalAvailable - amountToDeduct;

    await Ledger.create([{
      tenantId,
      amount: -amountToDeduct,
      type: 'DEBIT',
      balanceAfter: finalBalance,
      serviceName,
      statusCode: 200
    }], { session: internalSession });

    // Only commit if we started the transaction here
    if (!session) await internalSession.commitTransaction();

    return { success: true, remainingBalance: finalBalance };
  } catch (error) {
    // Only abort if we started the transaction here
    if (!session) await internalSession.abortTransaction();
    throw error;
  } finally {
    // Only end if we created it
    if (!session) internalSession.endSession();
  }
}

  // 3. Add Credits
  static async addCredits(tenantId: string, amount: number, expiryDate: Date) {
    const currentBalance = await this.getBalance(tenantId);
    
    const lot = new CreditLot({
      tenantId,
      amount,
      remaining: amount,
      expiryDate
    });

    await lot.save();

    await Ledger.create({
      tenantId,
      amount,
      type: 'CREDIT',
      balanceAfter: currentBalance + amount
    });

    return lot;
  }
}
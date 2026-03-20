import { Request, Response } from 'express';
import { BillingService } from '../services/billingservice';
import mongoose from 'mongoose';

export const callPanService = async (req: Request, res: Response) => {
  // 1. Start a global session for the entire request
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tenantId } = req.body;
    const COST = 1;

    // 2. Deduct within the session (This locks the credit lots)
    const result = await BillingService.deductCredits(tenantId, COST, 'pan-basic', session);

    // 3. Simulate service logic
    const isServiceSuccess = Math.random() > 0.2; 

    if (!isServiceSuccess) {
      throw new Error('SERVICE_FAILED'); // Trigger the catch block to rollback
    }

    // 4. Everything worked! Commit the transaction
    await session.commitTransaction();
    
    res.status(200).json({
      status: 'success',
      remainingBalance: result.remainingBalance
    });

  } catch (error: any) {
    // 5. If service failed OR credits were insufficient, UNDO everything
    await session.abortTransaction();

    if (error.message === 'Insufficient credits') {
      return res.status(402).json({ error: 'Insufficient credits' });
    }
    if (error.message === 'SERVICE_FAILED') {
      return res.status(500).json({ status: 'failure', message: 'Service Error - Credit Refunded' });
    }
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
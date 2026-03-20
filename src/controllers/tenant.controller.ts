import { Request, Response } from 'express';
import { Tenant } from '../models/tenant';
import { CreditLot } from '../models/creditLot';
import { Ledger } from '../models/creditLedger';
import { BillingService } from '../services/billingservice';

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    // tenantId can be a simple timestamp-based string or UUID
    const tenantId = `ten_${Date.now()}`;
    
    const tenant = new Tenant({ tenantId, name });
    await tenant.save();

    res.status(201).json({
      tenantId: tenant.tenantId,
      apiKey: tenant.apiKey // Returned only once during creation
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addCredits = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { amount, expiry } = req.body;
    if (!amount || !expiry) {
      return res.status(400).json({ error: 'Amount and expiry date are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }
    if (new Date(expiry) <= new Date()) {
      return res.status(400).json({ error: 'Expiry date must be in the future' });
    }
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    await BillingService.addCredits(tenantId, amount, new Date(expiry));
    
    res.status(200).json({ message: 'Credits added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add credits' });
  }
};

export const getBalance = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
  

    const balance = await BillingService.getBalance(tenantId);
    res.status(200).json({ tenantId, totalBalance: balance });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching balance' });
  }
};

export const getLedger = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    const history = await Ledger.find({ tenantId }).sort({ timestamp: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching ledger' });
  }
};
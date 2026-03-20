import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../models/tenant';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const tenantId=req.headers['x-tenant-id'] as string;

    if (!apiKey) {
      return res.status(401).json({ error: 'API Key is missing' });
    }

    const tenant = await Tenant.findOne({ tenantId, apiKey });
    console.log('Authenticated Tenant:', tenant);

    if (!tenant) {
      return res.status(401).json({ error: 'Invalid API Key' });
    }

    // Attach tenantId to the request body so the controller knows who is calling
    req.body.tenantId = tenant.tenantId;
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};
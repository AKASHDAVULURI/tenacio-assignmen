import { Router } from 'express';
import * as TenantCtrl from '../controllers/tenant.controller';
import * as ServiceCtrl from '../controllers/service.controller';

import { authenticate } from '../middleware/auth';
const router = Router();

// Tenant Routes
router.post('/tenants', TenantCtrl.createTenant);
router.post('/tenants/:tenantId/api-key', TenantCtrl.generateApiKey);
router.post('/tenants/:tenantId/credits', TenantCtrl.addCredits);
router.get('/tenants/:tenantId/balance', TenantCtrl.getBalance);
router.get('/tenants/:tenantId/ledger', TenantCtrl.getLedger);

// Service Routes
router.post('/services/pan-basic', authenticate, ServiceCtrl.callPanService);

export default router;
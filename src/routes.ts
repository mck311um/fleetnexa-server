import { Application } from 'express';

import bookingRoutes from './modules/booking/booking.routes';
import emailRoutes from './modules/email/email.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import userRoutes from './modules/user/user.routes';
import tenantRoutes from './modules/tenant/tenant.routes';
import roleRoutes from './modules/user/modules/user-role/user-role.routes';
import storageRoutes from './modules/storage/storage.routes';
import customerRoutes from './modules/customer/customer.routes';
import authRoutes from './modules/auth/auth.routes';
import tenantExtraRoutes from './modules/tenant/modules/tenant-extras/tenant-extra.routes';
import tenantLocationRoutes from './modules/tenant/modules/tenant-location/tenant-location.routes';
import tenantViolationRoutes from './modules/tenant/modules/tenant-violation/tenant-violation.routes';
import currencyRatesRoutes from './modules/tenant/modules/currency-rates/currency-rates.routes';
import vehicleRoutes from './modules/vehicle/vehicle.routes';
import vehicleDamageRoutes from './modules/vehicle/modules/vehicle-damage/damage.routes';
import adminRoutes from './modules/admin/admin.routes';
import tenantVendorRoutes from './modules/tenant/modules/tenant-vendor/tenant-vendor.routes';
import paymentRoutes from './modules/transaction/modules/payment/payment.routes';
import vehicleMaintenanceRoutes from './modules/vehicle/modules/vehicle-maintanance/vehicle-maintenance.routes';
import expenseRoutes from './modules/transaction/modules/expense/expense.routes';
import tenantActivityRoutes from './modules/tenant/modules/tenant-activity/tenant-activity.routes';
import refundRoutes from './modules/transaction/modules/refund/refund.routes';
import storefrontRoutes from './modules/storefront/storefront.routes';

export const registerRoutes = (app: Application) => {
  app.use('/api/booking', bookingRoutes);

  app.use('/api/admin', adminRoutes);

  app.use('/api/storefront', storefrontRoutes);

  app.use('/api/email', emailRoutes);
  app.use('/api/storage', storageRoutes);
  app.use('/api/auth', authRoutes);

  app.use('/api/transaction', transactionRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/expense', expenseRoutes);
  app.use('/api/refund', refundRoutes);

  app.use('/api/user', userRoutes);
  app.use('/api/user-role', roleRoutes);

  app.use('/api/customer', customerRoutes);

  app.use('/api/tenant', tenantRoutes);
  app.use('/api/tenant-activity', tenantActivityRoutes);
  app.use('/api/tenant-extra', tenantExtraRoutes);
  app.use('/api/tenant-location', tenantLocationRoutes);
  app.use('/api/tenant-violation', tenantViolationRoutes);
  app.use('/api/tenant-vendor', tenantVendorRoutes);
  app.use('/api/currency-rate', currencyRatesRoutes);

  app.use('/api/vehicle', vehicleRoutes);
  app.use('/api/vehicle-damage', vehicleDamageRoutes);
  app.use('/api/vehicle-maintenance', vehicleMaintenanceRoutes);
};

import { Application } from 'express';

import bookingRoutes from './modules/booking/booking.routes';
import emailRoutes from './modules/email/email.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import userRoutes from './modules/user/user.routes';
import tenantRoutes from './modules/tenant/tenant.routes';
import roleRoutes from './modules/role/role.routes';
import storageRoutes from './modules/storage/storage.routes';
import customerRoutes from './modules/customer/customer.routes';
import authRoutes from './modules/auth/auth.routes';
import tenantExtraRoutes from './modules/tenant/modules/tenant-extras/tenant-extra.routes';
import tenantLocationRoutes from './modules/tenant/modules/tenant-location/tenant-location.routes';
import vehicleRoutes from './routes/vehicle.routes';

export const registerRoutes = (app: Application) => {
  app.use('/api/booking', bookingRoutes);
  app.use('/api/email', emailRoutes);
  app.use('/api/transaction', transactionRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/tenant', tenantRoutes);
  app.use('/api/role', roleRoutes);
  app.use('/api/storage', storageRoutes);
  app.use('/api/customer', customerRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/tenant-extras', tenantExtraRoutes);
  app.use('/api/tenant-location', tenantLocationRoutes);
  app.use('/api/vehicles', vehicleRoutes);
};

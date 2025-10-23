"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_repository_1 = require("./transaction.repository");
const logger_1 = require("../../config/logger");
const getTransactions = async (req, res) => {
    const tenantId = req.params.tenantId;
    const tenantCode = req.params.tenantCode;
    try {
        const transactions = await transaction_repository_1.transactionRepo.getTransactions(tenantId);
        res.status(200).json(transactions);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get transactions', { tenantId, tenantCode });
    }
};
// const createPayment = async (req: Request, res: Response) => {
//   const { tenant, user } = req.context!;
//   const data = req.body;
//   if (!data) {
//     logger.w('User data is missing', {
//       tenantId: tenant.id,
//       tenantCode: tenant.tenantCode,
//     });
//     return res.status(400).json({ error: 'User data is required' });
//   }
//   const parseResult = PaymentSchema.safeParse(data);
//   if (!parseResult.success) {
//     return res.status(400).json({
//       error: 'Invalid transaction data',
//       details: parseResult.error.issues,
//     });
//   }
//   const paymentDto = parseResult.data;
//   try {
//     await transactionService.createPayment(paymentDto, tenant, user);
//     const updatedBooking = await rentalRepo.getRentalById(
//       data.bookingId,
//       tenant.id,
//     );
//     const bookings = await rentalRepo.getRentals(tenant.id);
//     res.status(201).json({
//       updatedBooking,
//       bookings,
//       message: 'Transaction created successfully',
//     });
//   } catch (error) {
//     logger.e(error, 'Failed to create payment', {
//       tenantId: tenant.id,
//       tenantCode: tenant.tenantCode,
//       bookingId: data.bookingId,
//     });
//   }
// };
// const updatePayment = async (req: Request, res: Response) => {
//   const { tenant, user } = req.context!;
//   const data = req.body;
//   if (!data) {
//     logger.w('User data is missing', {
//       tenantId: tenant.id,
//       tenantCode: tenant.tenantCode,
//     });
//     return res.status(400).json({ error: 'User data is required' });
//   }
//   const parseResult = PaymentSchema.safeParse(data);
//   if (!parseResult.success) {
//     return res.status(400).json({
//       error: 'Invalid transaction data',
//       details: parseResult.error.issues,
//     });
//   }
//   const paymentDto = parseResult.data;
//   try {
//     await transactionService.updatePayment(paymentDto, tenant, user);
//     const updatedBooking = await rentalRepo.getRentalById(
//       data.bookingId,
//       tenant.id,
//     );
//     const bookings = await rentalRepo.getRentals(tenant.id);
//     res.status(200).json({
//       updatedBooking,
//       bookings,
//       message: 'Transaction updated successfully',
//     });
//   } catch (error) {
//     logger.e(error, 'Failed to update payment', {
//       tenantId: tenant.id,
//       tenantCode: tenant.tenantCode,
//       bookingId: data.bookingId,
//     });
//   }
// };
// const deletePayment = async (req: Request, res: Response) => {
//   const { tenant, user } = req.context!;
//   const { id } = req.params;
//   if (!id) {
//     logger.w('Payment ID is missing', {
//       tenantId: tenant.id,
//       tenantCode: tenant.tenantCode,
//     });
//     return res.status(400).json({ error: 'Payment ID is required' });
//   }
//   try {
//     await transactionService.deletePayment(id, tenant, user);
//     res.status(200).json({ message: 'Payment deleted successfully' });
//   } catch (error) {
//     logger.e(error, 'Failed to delete payment', {
//       tenantId: tenant.id,
//       tenantCode: tenant.tenantCode,
//       id,
//     });
//   }
// };
exports.default = {
    getTransactions,
};

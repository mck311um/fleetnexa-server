-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('MINOR', 'MODERATE', 'SEVERE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Agent" AS ENUM ('MANUAL', 'RENTNEXA', 'PARTNER', 'SYSTEM', 'STOREFRONT');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "DamageLocation" AS ENUM ('INTERIOR', 'EXTERIOR');

-- CreateEnum
CREATE TYPE "ExtraType" AS ENUM ('INSURANCE', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "PricePolicy" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE', 'DAILY_PRICE', 'FLAT_RATE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESERVED', 'ACTIVE', 'COMPLETED', 'DECLINED', 'CANCELED', 'NO_SHOW', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "RentalAction" AS ENUM ('BOOKED', 'CANCELED', 'RETURNED', 'EXTENDED', 'PICKED_UP');

-- CreateEnum
CREATE TYPE "StatItem" AS ENUM ('TOTAL_REVENUE', 'NEW_RENTALS', 'RENTED_VEHICLES', 'AVAILABLE_VEHICLES', 'TOTAL_CUSTOMERS', 'AVERAGE_RENTAL', 'MONTHLY_EARNINGS', 'MONTHLY_RENTALS', 'MONTHLY_RENTAL_STATUS', 'YEARLY_REVENUE', 'YEARLY_RENTALS', 'YEARLY_CUSTOMERS', 'AVERAGE_RENTAL_DURATION', 'YEARLY_EXPENSES', 'YEARLY_VEHICLES');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RENTAL', 'REFUND', 'PAYMENT', 'EXPENSE');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING', 'UPCOMING', 'RETURN', 'UNCONFIRMED', 'PAYMENT', 'REFUND', 'GENERAL');

-- CreateEnum
CREATE TYPE "PortType" AS ENUM ('SEA', 'AIR');

-- CreateEnum
CREATE TYPE "DirectionType" AS ENUM ('ARRIVAL', 'DEPARTURE');

-- CreateEnum
CREATE TYPE "VesselType" AS ENUM ('SHIP', 'PLANE', 'OTHER');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('TENANT', 'STOREFRONT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGED', 'PASSWORD_RESET', 'ACCOUNT_LOCKED');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'TWO_FACTOR');

-- CreateEnum
CREATE TYPE "VehicleEventType" AS ENUM ('MAINTENANCE', 'ACCIDENT', 'INSPECTION', 'BOOKING', 'SWAPPED_IN', 'SWAPPED_OUT', 'CHECKED_OUT', 'RETURNED', 'DELIVERED', 'PICKED_UP', 'RELOCATED', 'TOWED', 'MAINTENANCE_SCHEDULED', 'MAINTENANCE_STARTED', 'MAINTENANCE_COMPLETED', 'OUT_OF_SERVICE', 'BACK_IN_SERVICE', 'REGISTRATION_RENEWED', 'INSURANCE_RENEWED', 'ROAD_TAX_RENEWED', 'INSPECTION_FAILED', 'INSPECTION_PASSED', 'BREAKDOWN', 'DAMAGE_REPORTED', 'DAMAGE_REPAIRED', 'THEFT_REPORTED', 'RECOVERED', 'ASSIGNED_TO_BOOKING', 'UNASSIGNED_FROM_BOOKING', 'EXTENDED_BOOKING');

-- CreateEnum
CREATE TYPE "SecurityDepositStatus" AS ENUM ('PENDING', 'WAIVED', 'COLLECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SecurityDepositTransactionType" AS ENUM ('COLLECTED', 'REFUNDED', 'FORFEITED', 'WAIVED');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'CONFIRM', 'DECLINE', 'CANCEL', 'APPROVE', 'REJECT', 'PAYMENT', 'REFUND', 'SIGN', 'SEND', 'EXPORT', 'STATUS_CHANGE', 'ASSIGN', 'UNASSIGN');

-- CreateEnum
CREATE TYPE "ActivityModule" AS ENUM ('AUTH', 'USER', 'ROLE', 'VEHICLE', 'CUSTOMER', 'BOOKING', 'PAYMENT', 'REFUND', 'EXPENSE', 'MAINTENANCE', 'DAMAGE', 'INVOICE', 'AGREEMENT', 'REPORT', 'ADMINISTRATION');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('customer_info', 'driver_registration', 'vehicle_inspection');

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "service" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChargeType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "chargeType" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "ChargeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBrand" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "brand" TEXT NOT NULL,

    CONSTRAINT "VehicleBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleModel" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "model" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "typeId" TEXT,

    CONSTRAINT "VehicleModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBodyType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bodyType" TEXT NOT NULL,

    CONSTRAINT "VehicleBodyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleStatus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "status" TEXT NOT NULL,

    CONSTRAINT "VehicleStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "fuel" TEXT NOT NULL,

    CONSTRAINT "FuelType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transmission" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "transmission" TEXT NOT NULL,
    "transmissionCode" TEXT,

    CONSTRAINT "Transmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleFeature" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "feature" TEXT NOT NULL,

    CONSTRAINT "VehicleFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WheelDrive" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "drive" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "WheelDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceSequence" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "prefix" TEXT NOT NULL,
    "example" TEXT NOT NULL,

    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "cscId" TEXT,
    "currency" TEXT,
    "iso3" TEXT,
    "phoneCode" TEXT,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "countryId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cscId" TEXT,
    "iso2" TEXT,
    "type" TEXT,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "stateId" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "cscId" TEXT,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceService" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "service" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "MaintenanceService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetLocation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "location" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "PresetLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseClass" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "class" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "LicenseClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessengerApp" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "app" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "MessengerApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "equipment" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,

    CONSTRAINT "ContactType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PaymentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,

    CONSTRAINT "VendorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Port" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "port" TEXT NOT NULL,
    "type" "PortType" NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "company" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Values" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "numberOfDays" INTEGER NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "collectionFee" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION,
    "totalExtras" DOUBLE PRECISION NOT NULL,
    "totalCharges" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "subTotal" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "netTotal" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "rentalId" TEXT NOT NULL,
    "additionalDriverFees" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cancellationFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lateFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discountPolicy" TEXT,
    "customBasePrice" BOOLEAN NOT NULL DEFAULT false,
    "customCollectionFee" BOOLEAN NOT NULL DEFAULT false,
    "customDeliveryFee" BOOLEAN NOT NULL DEFAULT false,
    "customDiscount" BOOLEAN NOT NULL DEFAULT false,
    "customTotalCost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityDeposit" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountCollected" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "amountForfeited" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "amountRefunded" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "SecurityDepositStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "SecurityDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityDepositTransaction" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "securityDepositId" TEXT NOT NULL,
    "type" "SecurityDepositTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethodId" TEXT,
    "currencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "SecurityDepositTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "profileImage" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "experience" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "storefrontId" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerMessengerApp" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "customerId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerMessengerApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "street" TEXT,
    "countryId" TEXT,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "stateId" TEXT,
    "villageId" TEXT,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDocument" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "documentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "documents" TEXT[],
    "notes" TEXT,

    CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverLicense" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "classId" TEXT,
    "countryId" TEXT,
    "customerId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "licenseIssued" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "DriverLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerViolation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "violationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "notes" TEXT,
    "violationDate" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalAgreement" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "number" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "agreementUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "signableUrl" TEXT,

    CONSTRAINT "RentalAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "invoiceNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rentalId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceipt" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "receiptNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "paymentId" TEXT NOT NULL,
    "bookingId" TEXT,

    CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaribbeanCountry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "countryId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CaribbeanCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopDMMerchant" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "merchant_handle" TEXT NOT NULL,
    "merchant_secret" TEXT NOT NULL,

    CONSTRAINT "ShopDMMerchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "currency" TEXT,
    "symbol" TEXT,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantCurrencyRate" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "fromRate" DOUBLE PRECISION DEFAULT 0.0,
    "toRate" DOUBLE PRECISION DEFAULT 0.0,

    CONSTRAINT "TenantCurrencyRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "base" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "type" "FormType" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "formId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalActivity" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "customerId" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "action" "RentalAction" NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "RentalActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantNotification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL,
    "message" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TenantNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationReadStatus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppPermission" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "categoryId" TEXT,

    CONSTRAINT "AppPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionCategory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PermissionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "rentalNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pickupLocationId" TEXT NOT NULL,
    "returnLocationId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "agent" "Agent" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "chargeTypeId" TEXT,
    "bookingCode" TEXT,
    "deletedAt" TIMESTAMP(3),
    "originalVehicleId" TEXT,
    "vehicleSwapped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontBooking" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "rentalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "StorefrontBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalDriver" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "rentalId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RentalDriver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalExtra" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "extraId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "valuesId" TEXT NOT NULL,
    "customAmount" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RentalExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalCharge" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "charge" TEXT NOT NULL,
    "reason" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valueId" TEXT NOT NULL,

    CONSTRAINT "RentalCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VesselInfo" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" TEXT NOT NULL,
    "portId" TEXT NOT NULL,
    "direction" "DirectionType" NOT NULL,
    "type" "VesselType" NOT NULL,
    "carrier" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "arrival" TIMESTAMP(3),
    "departure" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "VesselInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "module" "ActivityModule" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "description" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantWeeklyStats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "stat" "StatItem" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantWeeklyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantYearlyStats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "stat" "StatItem" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantYearlyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMonthlyStats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "stat" "StatItem" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantMonthlyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMonthlyRentalStats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "stat" "StatItem" NOT NULL,
    "status" "RentalStatus" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantMonthlyRentalStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantRatings" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "TenantRatings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteRatings" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteRatings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT,
    "name" TEXT NOT NULL,
    "planCode" TEXT,
    "planId" TEXT,
    "period" "BillingPeriod" NOT NULL DEFAULT 'MONTHLY',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tier" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeatures" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "planId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,

    CONSTRAINT "PlanFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanDetails" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "planId" TEXT NOT NULL,
    "users" INTEGER NOT NULL,
    "vehicles" INTEGER NOT NULL,

    CONSTRAINT "PlanDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantLocation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "location" TEXT NOT NULL,
    "pickupEnabled" BOOLEAN NOT NULL,
    "returnEnabled" BOOLEAN NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "collectionFee" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,
    "minimumRentalPeriod" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "storefrontEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "street" TEXT,
    "villageId" TEXT,
    "stateId" TEXT,
    "countryId" TEXT,

    CONSTRAINT "TenantLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancellationPolicy" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "minimumDays" INTEGER NOT NULL,
    "policy" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,
    "updatedBy" TEXT,
    "bookingMinimumDays" INTEGER NOT NULL,

    CONSTRAINT "CancellationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LatePolicy" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL,
    "maxHours" INTEGER NOT NULL,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "LatePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantCode" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "currencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "logo" TEXT,
    "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
    "financialYearStart" TEXT NOT NULL DEFAULT 'January',
    "invoiceSequenceId" TEXT,
    "invoiceFootNotes" TEXT NOT NULL DEFAULT '',
    "storefrontEnabled" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionId" TEXT,
    "securityDeposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT DEFAULT '',
    "cancellationPolicyId" TEXT,
    "latePolicyId" TEXT,
    "additionalDriverFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysInMonth" INTEGER NOT NULL DEFAULT 28,
    "slug" TEXT,
    "merchantId" TEXT,
    "businessVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "endTime" TEXT DEFAULT '11:30 PM',
    "startTime" TEXT DEFAULT '12:00 AM',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "whatsappNotifications" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT,
    "firmaWorkspaceId" TEXT,
    "firmaApiKey" TEXT,
    "firmaApiKeyAt" TIMESTAMP(3),
    "subdomain" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "method" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "street" TEXT,
    "countryId" TEXT,
    "tenantId" TEXT NOT NULL,
    "stateId" TEXT,
    "villageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscription" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "planId" TEXT,

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantContact" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TenantContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantReminders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "reminder" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "TenantReminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantViolation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "violation" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TenantViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantVendor" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vendor" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "contactName" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "TenantVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "idType" TEXT NOT NULL,
    "idUrl" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantInsurance" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "insurance" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePolicy" "PricePolicy" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "TenantInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantEquipment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "equipmentId" TEXT NOT NULL,
    "pricePolicy" "PricePolicy" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "TenantEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantService" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "serviceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "pricePolicy" "PricePolicy" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "TenantService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "paymentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "rentalId" TEXT,
    "details" TEXT,
    "refundId" TEXT,
    "expenseId" TEXT,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "number" TEXT,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "paymentTypeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "customerId" TEXT,
    "currencyId" TEXT,
    "payer" TEXT,
    "payment" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rentalId" TEXT,
    "reason" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "refundDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "customerId" TEXT,
    "payee" TEXT,
    "refund" TEXT,
    "payment" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vendorId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "maintenanceId" TEXT,
    "expense" TEXT,
    "payee" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "action" "AuthAction" NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "metaData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordHistory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "roleId" TEXT NOT NULL,
    "lastChanged" TIMESTAMP(3),
    "email" TEXT,
    "profilePicture" TEXT NOT NULL DEFAULT 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/fallback.png',
    "show" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "requirePasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "driverLicenseNumber" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "street" TEXT,
    "villageId" TEXT,
    "stateId" TEXT,
    "countryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "profilePicture" TEXT DEFAULT 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/fallback.png',
    "licenseIssued" TIMESTAMP(3) NOT NULL,
    "license" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StorefrontUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "username" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "show" BOOLEAN DEFAULT true,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRolePermission" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "engineVolume" INTEGER NOT NULL,
    "vehicleStatusId" TEXT NOT NULL,
    "fuelTypeId" TEXT NOT NULL,
    "transmissionId" TEXT NOT NULL,
    "wheelDriveId" TEXT NOT NULL,
    "fuelLevel" INTEGER NOT NULL,
    "odometer" INTEGER NOT NULL,
    "steering" TEXT NOT NULL DEFAULT 'left',
    "featuredImage" TEXT NOT NULL,
    "images" TEXT[],
    "numberOfSeats" INTEGER NOT NULL,
    "numberOfDoors" INTEGER NOT NULL,
    "vin" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "tenantId" TEXT,
    "locationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "drivingExperience" INTEGER NOT NULL DEFAULT 1,
    "fuelPolicyId" TEXT,
    "minimumAge" INTEGER NOT NULL,
    "minimumRental" INTEGER NOT NULL,
    "refundAmount" INTEGER NOT NULL DEFAULT 100,
    "timeBetweenRentals" INTEGER NOT NULL,
    "dayPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storefrontEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleDiscount" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DECIMAL(10,2) NOT NULL,
    "discountPolicy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "vehicleId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "period" INTEGER NOT NULL DEFAULT 1,
    "periodPolicy" TEXT NOT NULL DEFAULT 'greater_than',

    CONSTRAINT "VehicleDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleDamage" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT,
    "title" TEXT NOT NULL,
    "isRepaired" BOOLEAN NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MINOR',
    "location" "DamageLocation" NOT NULL DEFAULT 'EXTERIOR',
    "estimatedRepairCost" DOUBLE PRECISION,
    "images" TEXT[],
    "partId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "repairedAt" TIMESTAMP(3),
    "customerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "VehicleDamage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclePart" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "partName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "VehiclePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelPolicy" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "policy" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "FuelPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleServiceLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "servicedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "contactId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "scheduledServiceId" TEXT,
    "damageId" TEXT,
    "cost" DOUBLE PRECISION,
    "documents" TEXT[],

    CONSTRAINT "VehicleServiceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleMaintenance" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "vendorId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "tenantId" TEXT,

    CONSTRAINT "VehicleMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleServiceSchedule" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VehicleServiceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingVehicleHistory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" TEXT NOT NULL,
    "fromVehicleId" TEXT NOT NULL,
    "toVehicleId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "swappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "swappedBy" TEXT NOT NULL,

    CONSTRAINT "BookingVehicleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleEvent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "type" "VehicleEventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "VehicleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInsuranceHistory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "insuranceCompanyId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "VehicleInsuranceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleRegistrationHistory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "VehicleRegistrationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MaintenanceToServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MaintenanceToServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PlanPermissionCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlanPermissionCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PaymentMethodToTenant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PaymentMethodToTenant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_VehicleToVehicleFeature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VehicleToVehicleFeature_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBrand_brand_key" ON "VehicleBrand"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_model_brandId_typeId_key" ON "VehicleModel"("model", "brandId", "typeId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBodyType_bodyType_key" ON "VehicleBodyType"("bodyType");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleStatus_status_key" ON "VehicleStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_country_key" ON "Country"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso3_key" ON "Country"("iso3");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_code_key" ON "InsuranceCompany"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Values_rentalId_key" ON "Values"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityDeposit_bookingId_key" ON "SecurityDeposit"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_storefrontId_key" ON "Customer"("tenantId", "storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAddress_customerId_key" ON "CustomerAddress"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDocument_customerId_key" ON "CustomerDocument"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverLicense_customerId_key" ON "DriverLicense"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverLicense_licenseNumber_key" ON "DriverLicense"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RentalAgreement_rentalId_key" ON "RentalAgreement"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_rentalId_key" ON "Invoice"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_paymentId_key" ON "PaymentReceipt"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_receiptNumber_tenantId_key" ON "PaymentReceipt"("receiptNumber", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CaribbeanCountry_countryId_key" ON "CaribbeanCountry"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopDMMerchant_tenantId_key" ON "ShopDMMerchant"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TenantCurrencyRate_tenantId_currencyId_key" ON "TenantCurrencyRate"("tenantId", "currencyId");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_base_target_key" ON "ExchangeRate"("base", "target");

-- CreateIndex
CREATE UNIQUE INDEX "FormResponse_formId_key" ON "FormResponse"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationReadStatus_notificationId_userId_key" ON "NotificationReadStatus"("notificationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppPermission_name_key" ON "AppPermission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionCategory_name_key" ON "PermissionCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_bookingCode_key" ON "Rental"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontBooking_rentalId_key" ON "StorefrontBooking"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalDriver_rentalId_driverId_key" ON "RentalDriver"("rentalId", "driverId");

-- CreateIndex
CREATE INDEX "Activity_tenantId_createdAt_idx" ON "Activity"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_tenantId_userId_createdAt_idx" ON "Activity"("tenantId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_tenantId_entityType_entityId_idx" ON "Activity"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Activity_tenantId_action_createdAt_idx" ON "Activity"("tenantId", "action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TenantWeeklyStats_tenantId_week_year_stat_key" ON "TenantWeeklyStats"("tenantId", "week", "year", "stat");

-- CreateIndex
CREATE UNIQUE INDEX "TenantYearlyStats_tenantId_year_stat_key" ON "TenantYearlyStats"("tenantId", "year", "stat");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMonthlyStats_tenantId_month_year_stat_key" ON "TenantMonthlyStats"("tenantId", "month", "year", "stat");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMonthlyRentalStats_tenantId_status_month_year_stat_key" ON "TenantMonthlyRentalStats"("tenantId", "status", "month", "year", "stat");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_planCode_key" ON "SubscriptionPlan"("planCode");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_planId_key" ON "SubscriptionPlan"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanDetails_planId_key" ON "PlanDetails"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "CancellationPolicy_tenantId_key" ON "CancellationPolicy"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LatePolicy_tenantId_key" ON "LatePolicy"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_tenantCode_key" ON "Tenant"("tenantCode");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_email_key" ON "Tenant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_number_key" ON "Tenant"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_cancellationPolicyId_key" ON "Tenant"("cancellationPolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_latePolicyId_key" ON "Tenant"("latePolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_whatsappNumber_key" ON "Tenant"("whatsappNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_firmaWorkspaceId_key" ON "Tenant"("firmaWorkspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Address_tenantId_key" ON "Address"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_tenantId_key" ON "TenantSubscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantViolation_violation_key" ON "TenantViolation"("violation");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_tenantId_key" ON "VerificationRequest"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_paymentId_key" ON "Transactions"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_refundId_key" ON "Transactions"("refundId");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_expenseId_key" ON "Transactions"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_number_key" ON "Transactions"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_number_tenantId_key" ON "Transactions"("number", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_tenantId_key" ON "User"("username", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontUser_email_key" ON "StorefrontUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontUser_phone_key" ON "StorefrontUser"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontUser_driverLicenseNumber_key" ON "StorefrontUser"("driverLicenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserRolePermission_roleId_permissionId_key" ON "UserRolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "_MaintenanceToServices_B_index" ON "_MaintenanceToServices"("B");

-- CreateIndex
CREATE INDEX "_PlanPermissionCategories_B_index" ON "_PlanPermissionCategories"("B");

-- CreateIndex
CREATE INDEX "_PaymentMethodToTenant_B_index" ON "_PaymentMethodToTenant"("B");

-- CreateIndex
CREATE INDEX "_VehicleToVehicleFeature_B_index" ON "_VehicleToVehicleFeature"("B");

-- AddForeignKey
ALTER TABLE "VehicleModel" ADD CONSTRAINT "VehicleModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleModel" ADD CONSTRAINT "VehicleModel_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "VehicleBodyType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "AdminUser"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetLocation" ADD CONSTRAINT "PresetLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetLocation" ADD CONSTRAINT "PresetLocation_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetLocation" ADD CONSTRAINT "PresetLocation_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseClass" ADD CONSTRAINT "LicenseClass_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Port" ADD CONSTRAINT "Port_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Values" ADD CONSTRAINT "Values_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDepositTransaction" ADD CONSTRAINT "SecurityDepositTransaction_securityDepositId_fkey" FOREIGN KEY ("securityDepositId") REFERENCES "SecurityDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDepositTransaction" ADD CONSTRAINT "SecurityDepositTransaction_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "StorefrontUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMessengerApp" ADD CONSTRAINT "CustomerMessengerApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "MessengerApp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMessengerApp" ADD CONSTRAINT "CustomerMessengerApp_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLicense" ADD CONSTRAINT "DriverLicense_classId_fkey" FOREIGN KEY ("classId") REFERENCES "LicenseClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLicense" ADD CONSTRAINT "DriverLicense_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLicense" ADD CONSTRAINT "DriverLicense_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerViolation" ADD CONSTRAINT "CustomerViolation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerViolation" ADD CONSTRAINT "CustomerViolation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerViolation" ADD CONSTRAINT "CustomerViolation_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "TenantViolation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAgreement" ADD CONSTRAINT "RentalAgreement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAgreement" ADD CONSTRAINT "RentalAgreement_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAgreement" ADD CONSTRAINT "RentalAgreement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaribbeanCountry" ADD CONSTRAINT "CaribbeanCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopDMMerchant" ADD CONSTRAINT "ShopDMMerchant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantCurrencyRate" ADD CONSTRAINT "TenantCurrencyRate_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantCurrencyRate" ADD CONSTRAINT "TenantCurrencyRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_base_fkey" FOREIGN KEY ("base") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_target_fkey" FOREIGN KEY ("target") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalActivity" ADD CONSTRAINT "RentalActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalActivity" ADD CONSTRAINT "RentalActivity_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalActivity" ADD CONSTRAINT "RentalActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalActivity" ADD CONSTRAINT "RentalActivity_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantNotification" ADD CONSTRAINT "TenantNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationReadStatus" ADD CONSTRAINT "NotificationReadStatus_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "TenantNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationReadStatus" ADD CONSTRAINT "NotificationReadStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppPermission" ADD CONSTRAINT "AppPermission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PermissionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_chargeTypeId_fkey" FOREIGN KEY ("chargeTypeId") REFERENCES "ChargeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "TenantLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_returnLocationId_fkey" FOREIGN KEY ("returnLocationId") REFERENCES "TenantLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontBooking" ADD CONSTRAINT "StorefrontBooking_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontBooking" ADD CONSTRAINT "StorefrontBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "StorefrontUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalDriver" ADD CONSTRAINT "RentalDriver_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalDriver" ADD CONSTRAINT "RentalDriver_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalExtra" ADD CONSTRAINT "RentalExtra_valuesId_fkey" FOREIGN KEY ("valuesId") REFERENCES "Values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalCharge" ADD CONSTRAINT "RentalCharge_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalCharge" ADD CONSTRAINT "RentalCharge_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "Values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VesselInfo" ADD CONSTRAINT "VesselInfo_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VesselInfo" ADD CONSTRAINT "VesselInfo_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantWeeklyStats" ADD CONSTRAINT "TenantWeeklyStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantYearlyStats" ADD CONSTRAINT "TenantYearlyStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMonthlyStats" ADD CONSTRAINT "TenantMonthlyStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMonthlyRentalStats" ADD CONSTRAINT "TenantMonthlyRentalStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRatings" ADD CONSTRAINT "TenantRatings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeatures" ADD CONSTRAINT "PlanFeatures_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanDetails" ADD CONSTRAINT "PlanDetails_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocation" ADD CONSTRAINT "TenantLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocation" ADD CONSTRAINT "TenantLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocation" ADD CONSTRAINT "TenantLocation_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocation" ADD CONSTRAINT "TenantLocation_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_cancellationPolicyId_fkey" FOREIGN KEY ("cancellationPolicyId") REFERENCES "CancellationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_invoiceSequenceId_fkey" FOREIGN KEY ("invoiceSequenceId") REFERENCES "InvoiceSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_latePolicyId_fkey" FOREIGN KEY ("latePolicyId") REFERENCES "LatePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantContact" ADD CONSTRAINT "TenantContact_contactTypeId_fkey" FOREIGN KEY ("contactTypeId") REFERENCES "ContactType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantContact" ADD CONSTRAINT "TenantContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantReminders" ADD CONSTRAINT "TenantReminders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantViolation" ADD CONSTRAINT "TenantViolation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantVendor" ADD CONSTRAINT "TenantVendor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantInsurance" ADD CONSTRAINT "TenantInsurance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantEquipment" ADD CONSTRAINT "TenantEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantEquipment" ADD CONSTRAINT "TenantEquipment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantService" ADD CONSTRAINT "TenantService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantService" ADD CONSTRAINT "TenantService_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "PaymentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "VehicleMaintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "TenantVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "AppPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fuelPolicyId_fkey" FOREIGN KEY ("fuelPolicyId") REFERENCES "FuelPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "TenantLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_transmissionId_fkey" FOREIGN KEY ("transmissionId") REFERENCES "Transmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehicleStatusId_fkey" FOREIGN KEY ("vehicleStatusId") REFERENCES "VehicleStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_wheelDriveId_fkey" FOREIGN KEY ("wheelDriveId") REFERENCES "WheelDrive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDiscount" ADD CONSTRAINT "VehicleDiscount_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDamage" ADD CONSTRAINT "VehicleDamage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDamage" ADD CONSTRAINT "VehicleDamage_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "TenantContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_damageId_fkey" FOREIGN KEY ("damageId") REFERENCES "VehicleDamage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_scheduledServiceId_fkey" FOREIGN KEY ("scheduledServiceId") REFERENCES "VehicleServiceSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MaintenanceService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "TenantVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceSchedule" ADD CONSTRAINT "VehicleServiceSchedule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MaintenanceService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceSchedule" ADD CONSTRAINT "VehicleServiceSchedule_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVehicleHistory" ADD CONSTRAINT "BookingVehicleHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVehicleHistory" ADD CONSTRAINT "BookingVehicleHistory_fromVehicleId_fkey" FOREIGN KEY ("fromVehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVehicleHistory" ADD CONSTRAINT "BookingVehicleHistory_swappedBy_fkey" FOREIGN KEY ("swappedBy") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVehicleHistory" ADD CONSTRAINT "BookingVehicleHistory_toVehicleId_fkey" FOREIGN KEY ("toVehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleEvent" ADD CONSTRAINT "VehicleEvent_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInsuranceHistory" ADD CONSTRAINT "VehicleInsuranceHistory_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInsuranceHistory" ADD CONSTRAINT "VehicleInsuranceHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleRegistrationHistory" ADD CONSTRAINT "VehicleRegistrationHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaintenanceToServices" ADD CONSTRAINT "_MaintenanceToServices_A_fkey" FOREIGN KEY ("A") REFERENCES "MaintenanceService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaintenanceToServices" ADD CONSTRAINT "_MaintenanceToServices_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleMaintenance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanPermissionCategories" ADD CONSTRAINT "_PlanPermissionCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "PermissionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanPermissionCategories" ADD CONSTRAINT "_PlanPermissionCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentMethodToTenant" ADD CONSTRAINT "_PaymentMethodToTenant_A_fkey" FOREIGN KEY ("A") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentMethodToTenant" ADD CONSTRAINT "_PaymentMethodToTenant_B_fkey" FOREIGN KEY ("B") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VehicleToVehicleFeature" ADD CONSTRAINT "_VehicleToVehicleFeature_A_fkey" FOREIGN KEY ("A") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VehicleToVehicleFeature" ADD CONSTRAINT "_VehicleToVehicleFeature_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

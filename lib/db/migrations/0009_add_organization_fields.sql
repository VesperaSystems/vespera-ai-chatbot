-- Add organization fields to User table
ALTER TABLE "User" ADD COLUMN "organizationName" varchar(255);
ALTER TABLE "User" ADD COLUMN "tenantType" varchar(50) DEFAULT 'finance'; -- 'finance' or 'legal'
ALTER TABLE "User" ADD COLUMN "organizationDomain" varchar(255);

-- Add index for tenant type lookups
CREATE INDEX "idx_user_tenant_type" ON "User" ("tenantType");
CREATE INDEX "idx_user_organization" ON "User" ("organizationName"); 
CREATE TABLE IF NOT EXISTS "Files" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"size" varchar(50),
	"blobUrl" text,
	"folder" varchar(255) DEFAULT '/' NOT NULL,
	"thumbnailUrl" text,
	"videoUrl" text,
	"pdfUrl" text,
	"itemCount" varchar(50),
	"userId" uuid NOT NULL,
	"tenantId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Files" ADD CONSTRAINT "Files_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Files" ADD CONSTRAINT "Files_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

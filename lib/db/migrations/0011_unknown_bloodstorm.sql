CREATE TABLE IF NOT EXISTS "FileAccessLogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileId" integer NOT NULL,
	"userId" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"accessedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" varchar(45),
	"userAgent" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FileShares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileId" integer NOT NULL,
	"sharedByUserId" uuid NOT NULL,
	"sharedWithUserId" uuid NOT NULL,
	"permission" varchar(20) DEFAULT 'read' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FileAccessLogs" ADD CONSTRAINT "FileAccessLogs_fileId_Files_id_fk" FOREIGN KEY ("fileId") REFERENCES "public"."Files"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FileAccessLogs" ADD CONSTRAINT "FileAccessLogs_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FileShares" ADD CONSTRAINT "FileShares_fileId_Files_id_fk" FOREIGN KEY ("fileId") REFERENCES "public"."Files"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FileShares" ADD CONSTRAINT "FileShares_sharedByUserId_User_id_fk" FOREIGN KEY ("sharedByUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FileShares" ADD CONSTRAINT "FileShares_sharedWithUserId_User_id_fk" FOREIGN KEY ("sharedWithUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

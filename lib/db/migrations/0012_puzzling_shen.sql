ALTER TABLE "Files" ADD COLUMN "isDeleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Files" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "Files" ADD COLUMN "originalFolder" varchar(255);
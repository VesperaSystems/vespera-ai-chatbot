ALTER TABLE "Vote_v2" ADD COLUMN "userId" uuid;--> statement-breakpoint
-- All rows have been deleted, so no need to backfill userId
ALTER TABLE "Vote_v2" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Vote_v2" DROP CONSTRAINT "Vote_v2_chatId_messageId_pk";--> statement-breakpoint
ALTER TABLE "Vote_v2" ADD CONSTRAINT "Vote_v2_chatId_messageId_userId_pk" PRIMARY KEY("chatId","messageId","userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Vote_v2" ADD CONSTRAINT "Vote_v2_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

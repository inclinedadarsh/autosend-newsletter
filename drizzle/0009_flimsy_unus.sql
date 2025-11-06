ALTER TABLE "issues" ADD COLUMN "sent_to_subscribers" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "sent_at" timestamp;
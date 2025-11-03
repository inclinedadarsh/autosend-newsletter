ALTER TABLE "subscribers" ADD COLUMN "token" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "token_expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "verified_at" timestamp;
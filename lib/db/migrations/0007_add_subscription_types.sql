CREATE TABLE IF NOT EXISTS "subscription_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"price" integer NOT NULL,
	"max_messages_per_day" integer NOT NULL,
	"available_models" json NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Insert the current subscription types based on entitlements
INSERT INTO "subscription_types" ("name", "price", "max_messages_per_day", "available_models", "description") VALUES
('Core', 15000, 200, '["chat-model"]', 'Small Businesses - 200 messages per day'),
('Professional', 35000, 1000, '["chat-model", "gpt-3.5", "gpt-4"]', 'Medium Businesses - 1000 messages per day'),
('Enterprise', 75000, -1, '["chat-model", "gpt-3.5", "gpt-4", "chat-model-reasoning"]', 'Large Businesses - Unlimited messages'); 
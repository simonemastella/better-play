CREATE TABLE "events" (
	"tx_id" text NOT NULL,
	"log_index" integer NOT NULL,
	"event_name" text NOT NULL,
	"block_number" bigint NOT NULL,
	"decoded" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_tx_id_log_index_pk" PRIMARY KEY("tx_id","log_index")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"address" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"round_id" integer PRIMARY KEY NOT NULL,
	"ticket_price" bigint NOT NULL,
	"prizes" jsonb NOT NULL,
	"next_ticket_id" bigint DEFAULT 0 NOT NULL,
	"end_block" bigint,
	"revealed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"ticket_id" bigint NOT NULL,
	"round_id" integer NOT NULL,
	"buyer" text NOT NULL,
	"event_tx_id" text NOT NULL,
	"event_log_index" integer NOT NULL,
	CONSTRAINT "tickets_ticket_id_round_id_pk" PRIMARY KEY("ticket_id","round_id")
);
--> statement-breakpoint
CREATE TABLE "winners" (
	"round_id" integer NOT NULL,
	"position" integer NOT NULL,
	"winner" text NOT NULL,
	"prize_won" bigint NOT NULL,
	CONSTRAINT "winners_round_id_position_pk" PRIMARY KEY("round_id","position")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_address" text NOT NULL,
	"role" text NOT NULL,
	"event_tx_id" text NOT NULL,
	"event_log_index" integer NOT NULL,
	CONSTRAINT "user_roles_user_address_role_pk" PRIMARY KEY("user_address","role")
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_round_id_rounds_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("round_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_buyer_users_address_fk" FOREIGN KEY ("buyer") REFERENCES "public"."users"("address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_round_id_rounds_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("round_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_winner_users_address_fk" FOREIGN KEY ("winner") REFERENCES "public"."users"("address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_address_users_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tickets_round_idx" ON "tickets" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX "tickets_buyer_idx" ON "tickets" USING btree ("buyer");
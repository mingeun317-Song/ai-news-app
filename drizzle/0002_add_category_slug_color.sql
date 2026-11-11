ALTER TABLE "categories" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "categories" SET "slug" = 'category-' || "id" WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE("slug");

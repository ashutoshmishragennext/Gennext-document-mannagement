ALTER TABLE "students" DROP CONSTRAINT "students_user_users_id_fk";
--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "user" DROP NOT NULL;
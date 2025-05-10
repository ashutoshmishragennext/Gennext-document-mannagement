DROP INDEX "students_org_roll_key";--> statement-breakpoint
DROP INDEX "students_father_name_idx";--> statement-breakpoint
DROP INDEX "students_roll_number_idx";--> statement-breakpoint
DROP INDEX "students_national_id_idx";--> statement-breakpoint
DROP INDEX "students_passport_number_idx";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "father_name";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "roll_number";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "date_of_birth";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "national_id";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "passport_number";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "session_year";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "address";
-- AlterTable
ALTER TABLE "lectures" ADD COLUMN     "classId" TEXT;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

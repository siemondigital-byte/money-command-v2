/*
  Warnings:

  - Added the required column `passiveYield` to the `investments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "passiveYield" DECIMAL(5,2) NOT NULL;

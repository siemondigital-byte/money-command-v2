/*
  Warnings:

  - You are about to drop the column `currentValue` on the `investments` table. All the data in the column will be lost.
  - You are about to drop the column `expectedReturn` on the `investments` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyContribution` on the `investments` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `investments` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `investments` table. All the data in the column will be lost.
  - Added the required column `capital` to the `investments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `investments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "investments" DROP COLUMN "currentValue",
DROP COLUMN "expectedReturn",
DROP COLUMN "monthlyContribution",
DROP COLUMN "name",
DROP COLUMN "type",
ADD COLUMN     "capital" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "label" TEXT;

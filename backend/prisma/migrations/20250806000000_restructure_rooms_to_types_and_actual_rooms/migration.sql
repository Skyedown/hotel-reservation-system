-- CreateTable
CREATE TABLE "room_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "amenities" TEXT[],
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actual_rooms" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isUnderMaintenance" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actual_rooms_pkey" PRIMARY KEY ("id")
);

-- Migrate existing room types to room_types table
INSERT INTO "room_types" ("id", "name", "description", "price", "capacity", "amenities", "images", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    CASE 
        WHEN "type" = 'STANDARD' THEN 'Standard Room'
        WHEN "type" = 'DELUXE' THEN 'Deluxe Room'
        WHEN "type" = 'SUITE' THEN 'Suite'
        WHEN "type" = 'PRESIDENTIAL' THEN 'Presidential Suite'
        ELSE "type"::TEXT
    END,
    -- Use the first room's description for each type
    (SELECT "description" FROM "rooms" r2 WHERE r2."type" = r1."type" LIMIT 1),
    -- Use the first room's price for each type
    (SELECT "price" FROM "rooms" r2 WHERE r2."type" = r1."type" LIMIT 1),
    -- Use the first room's capacity for each type
    (SELECT "capacity" FROM "rooms" r2 WHERE r2."type" = r1."type" LIMIT 1),
    -- Use the first room's amenities for each type
    (SELECT "amenities" FROM "rooms" r2 WHERE r2."type" = r1."type" LIMIT 1),
    -- Use the first room's images for each type
    (SELECT "images" FROM "rooms" r2 WHERE r2."type" = r1."type" LIMIT 1),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "rooms" r1
GROUP BY r1."type";

-- Migrate existing rooms to actual_rooms table
INSERT INTO "actual_rooms" ("id", "roomNumber", "roomTypeId", "isAvailable", "createdAt", "updatedAt")
SELECT 
    r."id",
    r."roomNumber",
    rt."id",
    r."isAvailable",
    r."createdAt",
    r."updatedAt"
FROM "rooms" r
JOIN "room_types" rt ON (
    (r."type" = 'STANDARD' AND rt."name" = 'Standard Room') OR
    (r."type" = 'DELUXE' AND rt."name" = 'Deluxe Room') OR
    (r."type" = 'SUITE' AND rt."name" = 'Suite') OR
    (r."type" = 'PRESIDENTIAL' AND rt."name" = 'Presidential Suite')
);

-- Add new columns to reservations table
ALTER TABLE "reservations" ADD COLUMN "roomTypeId" TEXT;
ALTER TABLE "reservations" ADD COLUMN "actualRoomId" TEXT;

-- Migrate existing reservations
UPDATE "reservations" 
SET "roomTypeId" = rt."id",
    "actualRoomId" = ar."id"
FROM "rooms" r
JOIN "room_types" rt ON (
    (r."type" = 'STANDARD' AND rt."name" = 'Standard Room') OR
    (r."type" = 'DELUXE' AND rt."name" = 'Deluxe Room') OR
    (r."type" = 'SUITE' AND rt."name" = 'Suite') OR
    (r."type" = 'PRESIDENTIAL' AND rt."name" = 'Presidential Suite')
)
JOIN "actual_rooms" ar ON ar."roomNumber" = r."roomNumber" AND ar."roomTypeId" = rt."id"
WHERE "reservations"."roomId" = r."id";

-- Make roomTypeId NOT NULL after migration
ALTER TABLE "reservations" ALTER COLUMN "roomTypeId" SET NOT NULL;

-- Drop old foreign key constraint
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_roomId_fkey";

-- Drop old roomId column
ALTER TABLE "reservations" DROP COLUMN "roomId";

-- Add new foreign key constraints
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_actualRoomId_fkey" FOREIGN KEY ("actualRoomId") REFERENCES "actual_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key constraint for actual_rooms
ALTER TABLE "actual_rooms" ADD CONSTRAINT "actual_rooms_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old rooms table
DROP TABLE "rooms";

-- Drop the old RoomType enum
DROP TYPE "RoomType";

-- Create unique indexes
CREATE UNIQUE INDEX "room_types_name_key" ON "room_types"("name");
CREATE UNIQUE INDEX "actual_rooms_roomNumber_key" ON "actual_rooms"("roomNumber");
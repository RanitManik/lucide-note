-- CreateTable
CREATE TABLE "shared_notes" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "include_css" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shared_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_notes_note_id_key" ON "shared_notes"("note_id");

-- CreateIndex
CREATE UNIQUE INDEX "shared_notes_token_key" ON "shared_notes"("token");

-- AddForeignKey
ALTER TABLE "shared_notes" ADD CONSTRAINT "shared_notes_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

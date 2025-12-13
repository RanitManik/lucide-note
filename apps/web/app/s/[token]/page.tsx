import React from "react";
import { prisma } from "@/lib/db";
import { jsonToHtml } from "@/lib/export-utils";
import { notFound } from "next/navigation";

interface PageProps {
  params: { token: string };
}

export default async function SharedNotePage({ params }: PageProps) {
  const { token } = params;

  const sharedNote = await prisma.sharedNote.findUnique({
    where: { token },
    include: { note: { include: { author: { select: { email: true } } } } },
  });

  if (!sharedNote) {
    notFound();
  }

  if (!sharedNote.is_public) {
    notFound();
  }

  if (sharedNote.expires_at && new Date(sharedNote.expires_at) < new Date()) {
    notFound();
  }

  // Render content as HTML fragment.
  const contentHtml = jsonToHtml(
    sharedNote.note.content,
    sharedNote.note.title,
    false
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-4 text-3xl font-semibold">{sharedNote.note.title}</h1>
        <div className="text-muted-foreground mb-6 text-xs">
          By {sharedNote.note.author?.email || "Unknown"} •{" "}
          {new Date(sharedNote.note.updated_at).toLocaleString()}
        </div>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const sanitizedQuery = query.trim().toLowerCase();

    // Get all notes for the tenant and filter client-side
    const notes = await prisma.note.findMany({
      where: {
        tenant_id: session.user.tenantId,
      },
      include: {
        author: { select: { email: true } },
      },
      orderBy: { created_at: "desc" },
    });

    // Filter notes by title and content
    const filteredNotes = notes
      .filter(note => {
        const titleMatch = note.title.toLowerCase().includes(sanitizedQuery);
        const contentMatch =
          typeof note.content === "object" &&
          JSON.stringify(note.content).toLowerCase().includes(sanitizedQuery);
        return titleMatch || contentMatch;
      })
      // Sort by relevance: title matches first, then by creation date
      .sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(sanitizedQuery);
        const bTitle = b.title.toLowerCase().includes(sanitizedQuery);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      })
      .slice(0, 20);

    return NextResponse.json(filteredNotes);
  } catch (error) {
    console.error("Search notes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

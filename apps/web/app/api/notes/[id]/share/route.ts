import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Check share status for a note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // First verify the note belongs to the user's tenant
    const note = await prisma.note.findFirst({
      where: {
        id,
        tenant_id: session.user.tenantId,
      },
      include: {
        shared_note: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!note.shared_note) {
      return NextResponse.json(
        { error: "Note is not shared" },
        { status: 404 }
      );
    }

    return NextResponse.json(note.shared_note);
  } catch (error) {
    console.error("Get share status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a share link for a note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { include_css = true, expires_in } = body;

    // First verify the note belongs to the user's tenant
    const note = await prisma.note.findFirst({
      where: {
        id,
        tenant_id: session.user.tenantId,
      },
      include: {
        shared_note: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // If already shared, return existing share
    if (note.shared_note) {
      return NextResponse.json(note.shared_note);
    }

    // Calculate expiry date if provided
    let expires_at: Date | null = null;
    if (expires_in) {
      const now = new Date();
      switch (expires_in) {
        case "1h":
          expires_at = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case "24h":
          expires_at = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "7d":
          expires_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Create the share
    const sharedNote = await prisma.sharedNote.create({
      data: {
        note_id: id,
        is_public: true,
        include_css,
        expires_at,
      },
    });

    return NextResponse.json(sharedNote, { status: 201 });
  } catch (error) {
    console.error("Create share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update share settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { is_public, include_css, expires_in } = body;

    // First verify the note belongs to the user's tenant
    const note = await prisma.note.findFirst({
      where: {
        id,
        tenant_id: session.user.tenantId,
      },
      include: {
        shared_note: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!note.shared_note) {
      return NextResponse.json(
        { error: "Note is not shared" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (typeof is_public === "boolean") updateData.is_public = is_public;
    if (typeof include_css === "boolean") updateData.include_css = include_css;

    // Handle expiry update
    if (expires_in !== undefined) {
      if (expires_in === "never" || expires_in === null) {
        updateData.expires_at = null;
      } else {
        const now = new Date();
        switch (expires_in) {
          case "1h":
            updateData.expires_at = new Date(now.getTime() + 60 * 60 * 1000);
            break;
          case "24h":
            updateData.expires_at = new Date(
              now.getTime() + 24 * 60 * 60 * 1000
            );
            break;
          case "7d":
            updateData.expires_at = new Date(
              now.getTime() + 7 * 24 * 60 * 60 * 1000
            );
            break;
          case "30d":
            updateData.expires_at = new Date(
              now.getTime() + 30 * 24 * 60 * 60 * 1000
            );
            break;
        }
      }
    }

    const updatedShare = await prisma.sharedNote.update({
      where: { id: note.shared_note.id },
      data: updateData,
    });

    return NextResponse.json(updatedShare);
  } catch (error) {
    console.error("Update share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove share link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // First verify the note belongs to the user's tenant
    const note = await prisma.note.findFirst({
      where: {
        id,
        tenant_id: session.user.tenantId,
      },
      include: {
        shared_note: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!note.shared_note) {
      return NextResponse.json(
        { error: "Note is not shared" },
        { status: 404 }
      );
    }

    await prisma.sharedNote.delete({
      where: { id: note.shared_note.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

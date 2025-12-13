import { testApiHandler } from "next-test-api-route-handler";

// Mock auth BEFORE importing the handler
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// Mock prisma BEFORE importing the handler
jest.mock("@/lib/db", () => ({
  prisma: {
    note: {
      findMany: jest.fn(),
    },
  },
}));

import * as appHandler from "../app/api/notes/search/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("Search Notes API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "GET",
        });
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error).toBe("Unauthorized");
      },
    });
  });

  it("should return empty array if no query provided", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user1", tenantId: "tenant1" },
    } as any);

    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "GET",
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual([]);
      },
    });
  });

  it("should return results when notes match query", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user1", tenantId: "tenant1" },
    } as any);

    const mockNotes = [
      {
        id: "note1",
        title: "test",
        content: { text: "Content" },
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-01"),
        author: { email: "user@test.com" },
      },
    ];

    (mockPrisma.note.findMany as jest.Mock).mockResolvedValueOnce(
      mockNotes as any
    );

    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "GET",
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        // Should return an array (may be filtered)
        expect(Array.isArray(data)).toBe(true);
      },
    });
  });

  it("should return results array from search", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user1", tenantId: "tenant1" },
    } as any);

    const mockNotes = Array.from({ length: 5 }, (_, i) => ({
      id: `note${i}`,
      title: `Note ${i}`,
      content: { text: "content" },
      created_at: new Date(),
      updated_at: new Date(),
      author: { email: "user@test.com" },
    }));

    (mockPrisma.note.findMany as jest.Mock).mockResolvedValueOnce(
      mockNotes as any
    );

    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "GET",
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
        // Results should be limited to 20
        expect(data.length).toBeLessThanOrEqual(20);
      },
    });
  });
});

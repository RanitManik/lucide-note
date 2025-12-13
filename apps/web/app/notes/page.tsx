"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@workspace/ui/components/tooltip";
import { SheetContent } from "@workspace/ui/components/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { EasterEgg } from "@workspace/ui/components/easter-egg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { SidebarContent } from "../../components/sidebar-content";
import { Topbar } from "../../components/topbar";

// defaultDoc removed: editor should initialize empty and be populated from
// the fetched note to avoid creating an initial undo state that contains
// the placeholder text.
import { Loader2, AlertTriangle, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
const Confetti = React.lazy(() => import("react-confetti"));

// TanStack Query imports
import {
  useNotes,
  useTenant,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useUpgradeTenant,
  useInviteUser,
  type Note,
  type User as UserType,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { NoteEditorContainer } from "@/components/note-editor-container";
import { ExportModal } from "@/components/export-modal";
import { ShareModal } from "@/components/share-modal";
import {
  createNoteSchema,
  updateNoteSchema,
  inviteUserSchema,
} from "@/lib/validations";

// Utility functions
function generateRandomPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}

// --- Utility Hook ---
// A simple React hook to get the current window dimensions for the confetti effect.
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
}

// --- Main Dashboard Component ---
export default function NotesDashboard() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <NotesDashboardContent />
    </React.Suspense>
  );
}

function NotesDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // NextAuth session
  const { data: session, status } = useSession();

  // User state - derived from session
  const user = session?.user as UserType | null;

  // TanStack Query hooks
  const {
    data: notesData,
    isLoading: notesLoading,
    error: notesError,
  } = useNotes();
  const { data: tenantData, isLoading: tenantLoading } = useTenant();

  // TanStack Query mutations
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const upgradeTenantMutation = useUpgradeTenant();
  const inviteUserMutation = useInviteUser();

  // Get query client for manual invalidation
  const queryClient = useQueryClient();

  // Derived data
  const notes = notesData || [];
  const tenant = tenantData || {
    slug: "tenant",
    plan: "FREE",
    noteCount: 0,
    limit: 3,
  };

  // State for managing the currently selected note
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // State set by NoteEditorContainer to indicate whether there are unsaved changes
  const [isEditorDirty, setIsEditorDirty] = useState(false);
  // Ref to a save function registered by NoteEditorContainer so parent can trigger a save
  const saveCurrentNoteRef = useRef<(() => Promise<void>) | null>(null);
  // Pending selection when user attempts to switch while having unsaved changes
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // State for delete confirmation
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // State for create forms and invite
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [invitePassword, setInvitePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [createNoteError, setCreateNoteError] = useState("");

  // State for export and share modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [exportNote, setExportNoteState] = useState<Note | null>(null);
  const [shareNote, setShareNoteState] = useState<Note | null>(null);

  // Function to update a note in the local notes array
  const updateNoteInList = (noteId: string, updates: Partial<Note>) => {
    // TanStack Query handles cache invalidation automatically
  };

  // State for the confetti and mobile sheet
  const [showConfetti, setShowConfetti] = useState(false);
  // Controls fade transition for confetti overlay (so it doesn't disappear abruptly)
  const [confettiFading, setConfettiFading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { width, height } = useWindowSize();
  // Refs to hold confetti timers so we can clear them if needed
  const confettiTimers = useRef<{ fade: number | null; hide: number | null }>({
    fade: null,
    hide: null,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Automatically select note based on search params or first note
  useEffect(() => {
    if (notes.length === 0) return;

    const noteParam = searchParams.get("note");

    if (noteParam) {
      // Check if the note from search params exists
      const noteExists = notes.some(note => note.id === noteParam);
      if (noteExists) {
        setSelectedId(noteParam);
        return;
      }
    }

    // If no valid search param or note doesn't exist, select first note and update URL
    if (!selectedId) {
      const firstNoteId = notes[0]!.id;
      setSelectedId(firstNoteId);

      // Update URL with the first note ID
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("note", firstNoteId);
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [notes, router, searchParams, selectedId]);

  // Derived state to determine if the user has hit their note limit.
  const limitReached = useMemo(() => {
    if (tenantLoading || tenant.plan === "PRO" || tenant.limit === null)
      return false;
    return tenant.noteCount >= tenant.limit;
  }, [tenant, tenantLoading]);

  // Check if user can upgrade (admin and free plan and at limit)
  const canUpgrade = useMemo(() => {
    return (
      user?.role === "admin" && user?.tenantPlan === "free" && limitReached
    );
  }, [user, limitReached]);

  // Handlers for creating, deleting, and selecting notes.
  const handleSelectNote = useCallback(
    (id: string) => {
      // Use the 'isEditorDirty' state variable here
      if (isEditorDirty && id !== selectedId) {
        setPendingSelectId(id);
        setShowUnsavedDialog(true);
        return;
      }

      // Proceed with selection
      setSelectedId(id);
      setIsSheetOpen(false); // Close mobile sheet on selection.

      // Update URL with the selected note
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("note", id);
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    },
    // Add 'isEditorDirty' to the dependency array
    [isEditorDirty, selectedId, searchParams, router]
  );

  // Helper to actually proceed with selection (bypassing the unsaved check)
  const handleSelectNoteProceed = useCallback(
    (id: string) => {
      setPendingSelectId(null);
      setSelectedId(id);
      setIsSheetOpen(false);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("note", id);
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleCreateNote = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (limitReached) {
        toast.error("Upgrade to Pro to create more notes.");
        return;
      }

      // Validate form data
      const validationResult = createNoteSchema.safeParse({
        title: newTitle,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Start writing your note here...",
                },
              ],
            },
          ],
        },
      });

      if (!validationResult.success) {
        setCreateNoteError(
          validationResult.error.issues?.[0]?.message || "Validation failed"
        );
        return;
      }

      const validatedData = validationResult.data;
      const noteData = {
        title: validatedData.title!,
        content: validatedData.content,
      };

      // Close dialog and clear form immediately for optimistic UX
      setShowCreateForm(false);
      setNewTitle("");
      setCreateNoteError("");

      try {
        await toast.promise(createNoteMutation.mutateAsync(noteData), {
          loading: "Creating note...",
          success: result => {
            // Show additional toast with action to open the created note (only if we have the ID)
            if (result?.id) {
              setTimeout(() => {
                toast.success(
                  `"${result.title || "Untitled"}" is ready to edit`,
                  {
                    action: {
                      label: "Open",
                      onClick: () => handleSelectNote(result.id),
                    },
                  }
                );
              }, 500); // Small delay to show after the main success toast
            }
            return "Note created successfully";
          },
          error: "Failed to create note",
        });

        setIsSheetOpen(false);
      } catch (err) {
        toast.error("Failed to create note");
      }
    },
    [
      limitReached,
      newTitle,
      createNoteMutation,
      handleSelectNote,
      setShowCreateForm,
      setNewTitle,
      setCreateNoteError,
      setIsSheetOpen,
    ]
  );

  const handleDeleteNote = useCallback((id: string) => {
    setDeleteNoteId(id);
  }, []);

  const confirmDeleteNote = useCallback(async () => {
    if (!deleteNoteId) return;
    try {
      await toast.promise(deleteNoteMutation.mutateAsync(deleteNoteId), {
        loading: "Deleting note...",
        success: "Note deleted successfully",
        error: "Failed to delete note",
      });
      const remaining = (notes || []).filter(
        (n: Note) => n.id !== deleteNoteId
      );
      setSelectedId(remaining[0]?.id || null);

      // Update URL with the new selected note or remove param if none
      const newSearchParams = new URLSearchParams(searchParams);
      if (remaining[0]?.id) {
        newSearchParams.set("note", remaining[0].id);
      } else {
        newSearchParams.delete("note");
      }
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    } catch (err) {
      //
    }
    setDeleteNoteId(null);
  }, [deleteNoteId, deleteNoteMutation, notes, searchParams, router]);

  // Handler for export modal - need to fetch full note content
  const handleExportNote = useCallback(async (note: Note) => {
    // If we already have content, use it directly
    if (note.content) {
      setExportNoteState(note);
      setShowExportModal(true);
      return;
    }

    // Otherwise fetch the note content
    try {
      const response = await fetch(`/api/notes/${note.id}`);
      if (!response.ok) throw new Error("Failed to fetch note");
      const fullNote = await response.json();
      setExportNoteState(fullNote);
      setShowExportModal(true);
    } catch (error) {
      toast.error("Failed to load note for export");
    }
  }, []);

  // Handler for share modal - need to fetch full note content
  const handleShareNote = useCallback(async (note: Note) => {
    // If we already have content, use it directly
    if (note.content) {
      setShareNoteState(note);
      setShowShareModal(true);
      return;
    }

    // Otherwise fetch the note content
    try {
      const response = await fetch(`/api/notes/${note.id}`);
      if (!response.ok) throw new Error("Failed to fetch note");
      const fullNote = await response.json();
      setShareNoteState(fullNote);
      setShowShareModal(true);
    } catch (error) {
      toast.error("Failed to load note for sharing");
    }
  }, []);

  const handleInviteUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setInviteError(""); // Clear any previous error

      // Validate form data
      const validationResult = inviteUserSchema.safeParse({
        email: inviteEmail,
        role: inviteRole,
      });

      if (!validationResult.success) {
        setInviteError(
          validationResult.error.issues?.[0]?.message || "Validation failed"
        );
        return;
      }

      const validatedData = validationResult.data;

      try {
        const result = await inviteUserMutation.mutateAsync({
          email: validatedData.email,
          role: validatedData.role as "admin" | "member",
          password: invitePassword || undefined,
        });

        toast.success(`User ${inviteEmail} invited successfully!`);

        // Copy password to clipboard if it was generated or provided
        if (result.password) {
          copyToClipboard(result.password);
          toast.success("Password copied to clipboard!");
        }

        setShowInviteForm(false);
        setInviteEmail("");
        setInviteRole("member");
        setInvitePassword("");
        setShowPassword(false);
        setInviteError("");
      } catch (err: any) {
        // Try to extract the error message from the API response
        let errorMessage = "Failed to invite user";
        if (err && typeof err.json === "function") {
          try {
            const errorData = await err.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If we can't parse the error response, use the default message
          }
        }
        setInviteError(errorMessage);
      }
    },
    [
      inviteEmail,
      inviteRole,
      invitePassword,
      inviteUserMutation,
      setInviteError,
      setShowInviteForm,
      setInviteEmail,
      setInviteRole,
      setInvitePassword,
      setShowPassword,
    ]
  );

  const handleLogout = useCallback(async () => {
    // Clear all cached data to prevent showing previous user's data
    queryClient.clear();
    // Sign out from NextAuth
    await toast.promise(signOut({ callbackUrl: "/auth/login" }), {
      loading: "Signing out...",
      success: "Signed out successfully",
      error: "Failed to sign out",
    });
  }, [queryClient]);

  // Handler for the upgrade process.
  const upgradingRef = useRef(false);
  const onUpgrade = useCallback(async () => {
    if (upgradingRef.current) return;
    upgradingRef.current = true;
    // Clear any existing confetti
    setShowConfetti(false);
    setConfettiFading(false);
    try {
      await toast.promise(upgradeTenantMutation.mutateAsync(tenant.slug), {
        loading: "Upgrading to Pro...",
        success: result => {
          // Note: Session should be updated to reflect pro plan, or page may need refresh

          // 🎊 Show confetti and fade it out smoothly before hiding.
          const DURATION = 6000; // total confetti duration
          const FADE_MS = 1000; // fade duration at the end
          // Clear any existing timers
          if (confettiTimers.current.fade)
            clearTimeout(confettiTimers.current.fade);
          if (confettiTimers.current.hide)
            clearTimeout(confettiTimers.current.hide);

          setConfettiFading(false);
          setShowConfetti(true);
          // Schedule fade to start shortly before the end
          confettiTimers.current.fade = setTimeout(
            () => setConfettiFading(true),
            DURATION - FADE_MS
          ) as unknown as number;
          // Hide after the full duration
          confettiTimers.current.hide = setTimeout(() => {
            setShowConfetti(false);
            setConfettiFading(false);
          }, DURATION) as unknown as number;

          return "Upgraded to Pro successfully!";
        },
        error: async err => {
          if (err?.json) {
            try {
              const data = await err.json();
              return data.error || "Upgrade failed to process.";
            } catch {
              return "Upgrade failed to process.";
            }
          }
          return "Upgrade failed to process.";
        },
      });
    } catch (err) {
      //
    }
    upgradingRef.current = false;
  }, [
    upgradeTenantMutation,
    tenant.slug,
    setConfettiFading,
    setShowConfetti,
    confettiTimers,
  ]);

  // Clear errors when dialogs close
  useEffect(() => {
    if (!showCreateForm) {
      setCreateNoteError("");
    }
  }, [showCreateForm]);

  useEffect(() => {
    if (!showInviteForm) {
      setInviteError("");
    }
  }, [showInviteForm]);

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {/* Confetti overlay with smooth fade-out transition */}
      {showConfetti && (
        <div
          className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-700 ${
            confettiFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <React.Suspense fallback={null}>
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={400}
              gravity={0.15}
              colors={[
                "#10b981",
                "#3b82f6",
                "#8b5cf6",
                "#f59e0b",
                "#ef4444",
                "#ec4899",
              ]}
              tweenDuration={3000}
            />
          </React.Suspense>
        </div>
      )}

      <div style={{ display: "none" }}>
        <EasterEgg />
      </div>

      {/* Create Note Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a new note to your collection.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter note title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            {createNoteError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{createNoteError}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={createNoteMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Note"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      {user?.role === "admin" && (
        <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Add a new user to your tenant organization.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="Enter user email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="inviteRole">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={value =>
                    setInviteRole(value as "admin" | "member")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="invitePassword">Password (Optional)</Label>
                  <button
                    type="button"
                    className="text-primary h-auto cursor-pointer p-0 text-sm font-bold"
                    onClick={() => setInvitePassword(generateRandomPassword())}
                  >
                    Generate
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="invitePassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave empty to generate random password"
                      value={invitePassword}
                      onChange={e => setInvitePassword(e.target.value)}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Toggle password visibility
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!invitePassword}
                        onClick={() => {
                          copyToClipboard(invitePassword);
                          toast.success("Password copied to clipboard!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy password</TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-muted-foreground text-xs">
                  If no password is provided, a secure random password will be
                  generated and copied to your clipboard.
                </p>
              </div>
              {inviteError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{inviteError}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail("");
                    setInviteRole("member");
                    setInvitePassword("");
                    setShowPassword(false);
                    setInviteError("");
                  }}
                  disabled={inviteUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteUserMutation.isPending}>
                  {inviteUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    "Invite User"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onOpenChange={open => {
          setShowExportModal(open);
          if (!open) setExportNoteState(null);
        }}
        note={
          exportNote && exportNote.content
            ? (exportNote as { id: string; title: string; content: any })
            : null
        }
      />
      {/* Share Modal */}
      <ShareModal
        open={showShareModal}
        onOpenChange={open => {
          setShowShareModal(open);
          if (!open) setShareNoteState(null);
        }}
        note={
          shareNote && shareNote.content
            ? (shareNote as { id: string; title: string; content: any })
            : null
        }
      />

      <div className="flex h-svh w-full overflow-hidden">
        {/* Permanent Sidebar for medium screens and up (desktops) */}
        <aside className="bg-card hidden w-72 shrink-0 flex-col border-r md:flex">
          <SidebarContent
            notes={notes}
            notesLoading={notesLoading}
            notesError={notesError}
            tenant={tenant}
            user={user}
            tenantLoading={tenantLoading}
            limitReached={limitReached}
            selectedId={selectedId}
            onSelectNote={handleSelectNote}
            onCreateNote={() => setShowCreateForm(true)}
            onDeleteNote={handleDeleteNote}
            onConfirmDelete={confirmDeleteNote}
            onInviteUser={() => setShowInviteForm(true)}
            onUpgrade={onUpgrade}
            onLogout={handleLogout}
            deleteNoteId={deleteNoteId}
            setDeleteNoteId={setDeleteNoteId}
            deleteNotePending={deleteNoteMutation.isPending}
            onExportNote={handleExportNote}
            onShareNote={handleShareNote}
          />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <Topbar
            limitReached={limitReached}
            canUpgrade={canUpgrade}
            onUpgrade={onUpgrade}
            tenant={tenant}
            user={user}
            tenantLoading={tenantLoading}
            onOpenSheet={() => setIsSheetOpen(!isSheetOpen)}
            isSheetOpen={isSheetOpen}
            onLogout={handleLogout}
          >
            {/* Mobile Sheet (Drawer) that contains the sidebar content */}
            <SheetContent side="left" className="w-72 gap-0 p-0">
              <SidebarContent
                notes={notes}
                notesLoading={notesLoading}
                notesError={notesError}
                tenant={tenant}
                user={user}
                tenantLoading={tenantLoading}
                limitReached={limitReached}
                selectedId={selectedId}
                onSelectNote={handleSelectNote}
                onCreateNote={() => setShowCreateForm(true)}
                onDeleteNote={handleDeleteNote}
                onConfirmDelete={confirmDeleteNote}
                onInviteUser={() => setShowInviteForm(true)}
                onUpgrade={onUpgrade}
                onLogout={handleLogout}
                deleteNoteId={deleteNoteId}
                setDeleteNoteId={setDeleteNoteId}
                deleteNotePending={deleteNoteMutation.isPending}
                onExportNote={handleExportNote}
                onShareNote={handleShareNote}
              />
            </SheetContent>
          </Topbar>
          <div className="min-w-0 flex-1">
            {notesLoading || tenantLoading || status === "loading" ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 px-4 pb-2 pt-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex-1 space-y-4 px-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : selectedId ? (
              <>
                <NoteEditorContainer
                  noteId={selectedId}
                  onNoteUpdate={updateNoteInList}
                  isDirty={isEditorDirty}
                  onDirtyChange={setIsEditorDirty}
                  registerSaveFn={(fn: () => Promise<void>) =>
                    (saveCurrentNoteRef.current = fn)
                  }
                />

                {/* Unsaved changes dialog (shadcn AlertDialog style) */}
                <AlertDialog
                  open={showUnsavedDialog}
                  onOpenChange={open => {
                    if (!open) setPendingSelectId(null);
                    setShowUnsavedDialog(open);
                  }}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have unsaved changes. What would you like to do?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 text-white"
                        onClick={async () => {
                          // Discard changes and proceed
                          setShowUnsavedDialog(false);
                          setIsEditorDirty(false);
                          if (pendingSelectId)
                            handleSelectNoteProceed(pendingSelectId);
                        }}
                      >
                        Discard & Proceed
                      </AlertDialogAction>
                      <AlertDialogAction
                        onClick={async () => {
                          // Save then proceed
                          if (saveCurrentNoteRef.current) {
                            try {
                              await saveCurrentNoteRef.current();
                            } catch (err) {
                              // If save failed, keep the dialog open
                              return;
                            }
                          }
                          setShowUnsavedDialog(false);
                          if (pendingSelectId)
                            handleSelectNoteProceed(pendingSelectId);
                        }}
                      >
                        Save & Proceed
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div className="grid h-full place-items-center">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Select or create a note
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </React.Suspense>
  );
}

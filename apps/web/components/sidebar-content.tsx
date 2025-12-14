"use client";

import React from "react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import { useTheme } from "next-themes";
import {
  Trash2,
  Plus,
  Sparkles,
  UserPlus,
  Loader2,
  MoreHorizontal,
  User,
  ChevronsUpDown,
  Moon,
  Sun,
  LogOut,
  Monitor,
  Share2,
  Download,
  ExternalLink,
  Copy as CopyIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Note, Tenant, User as UserType } from "@/lib/api";
import Image from "next/image";
import { SearchBar } from "./search-bar";

interface SidebarContentProps {
  notes: Note[];
  notesLoading: boolean;
  notesError: Error | null;
  tenant: Tenant;
  user: UserType | null;
  tenantLoading: boolean;
  limitReached: boolean;
  selectedId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;

  onDeleteNote: (id: string) => void;
  onConfirmDelete: () => void;
  onInviteUser: () => void;
  onUpgrade: () => void;
  onLogout: () => void;
  deleteNoteId: string | null;
  setDeleteNoteId: (id: string | null) => void;
  deleteNotePending: boolean;
  onExportNote?: (note: Note) => void;
  onShareNote?: (note: Note) => void;
}

// --- Upgrade Banner Component ---
// A small banner shown in the sidebar when the user hits their note limit.
function UpgradeBanner({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="bg-muted mx-3 mb-3 rounded-md border p-3">
      <p className="text-xs">
        You've reached the Free plan limit. Upgrade to Pro for unlimited notes.
      </p>
      <div className="mt-2">
        <Button size="sm" onClick={onUpgrade} className="w-full">
          <Sparkles className="mr-1.5 size-4" />
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}

// --- User Menu Component ---
function UserMenu({ user, tenant, onLogout, onUpgrade }: any) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-accent h-auto w-full justify-start p-2"
        >
          <div className="flex w-full items-center gap-2">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
              {user?.image ? (
                <Image
                  width={32}
                  height={32}
                  src={user.image}
                  alt=""
                  className="rounded-lg object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              {user?.role === "admin" ? "Admin" : "Member"}
              {" • "}
              {tenant?.slug || "Tenant"}
              <span className="truncate text-xs font-medium">
                {user?.email || "User"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
              {user?.image ? (
                <Image
                  width={32}
                  height={32}
                  src={user.image}
                  alt=""
                  className="rounded-lg object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.email || "User"}
              </span>
              <span className="truncate text-xs">
                {user?.role === "admin" ? "Admin" : "Member"} •{" "}
                {user?.tenantPlan === "pro" ? "Pro" : "Free"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.tenantPlan !== "pro" && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onUpgrade}>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="mr-2 h-4 w-4" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- Upgrade Footer Component ---
function UpgradeFooter({ tenant, onUpgrade, user, onLogout }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <UserMenu
          user={user}
          tenant={tenant}
          onLogout={onLogout}
          onUpgrade={onUpgrade}
        />
      </div>
    </div>
  );
}

// --- Reusable Sidebar Component ---
// This component contains the entire sidebar UI, so it can be used in both
// the permanent desktop sidebar and the mobile slide-out sheet.
export const SidebarContent = React.memo(function SidebarContent({
  notes,
  notesLoading,
  notesError,
  tenant,
  user,
  tenantLoading,
  limitReached,
  selectedId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onConfirmDelete,
  onInviteUser,
  onUpgrade,
  onLogout,
  deleteNoteId,
  setDeleteNoteId,
  deleteNotePending,
  onExportNote,
  onShareNote,
}: SidebarContentProps) {
  // Show skeleton loading when either tenant or notes are loading
  const isLoading = tenantLoading || notesLoading;

  if (isLoading) {
    return (
      <>
        <div className="min-w-0 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="mb-4 px-2">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="space-y-2 px-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Separator className="my-4" />
        <div className="flex-1 space-y-2 px-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="border-t p-3">
          <Skeleton className="h-10 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-w-0 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex h-8 items-center gap-2">
              <img src="/logo.svg" alt="lucide note Logo" className="h-6 w-6" />
              <span className="text-lg font-semibold">lucide note</span>
              <Badge
                variant="secondary"
                className="px-1.5 py-0.5 text-xs font-medium"
              >
                {tenant?.plan?.toLowerCase() === "free" ? "Free" : "Pro"}
              </Badge>
            </div>
            {/* <div className="flex items-center gap-2">
              <span className="truncate text-pretty text-xl font-medium">
                {tenant?.slug}
              </span>
              
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {tenant?.plan === "FREE" && tenant?.limit !== null
                ? `${tenant?.noteCount} / ${tenant?.limit} Notes`
                : `${tenant?.noteCount || 0} Notes`}
            </p> */}
          </div>
        </div>
      </div>

      <Separator className="mb-4" />
      <div className="mb-4 px-2">
        <SearchBar onSelectNote={onSelectNote} />
      </div>
      <div className="flex flex-col gap-2 px-2">
        <Button
          size="sm"
          onClick={onCreateNote}
          disabled={limitReached}
          variant="default"
          className="w-full"
        >
          <Plus className="mr-1.5 size-4" />
          New Note
        </Button>
        {user?.role === "admin" && (
          <Button
            size="sm"
            onClick={onInviteUser}
            variant="outline"
            className="w-full"
          >
            <UserPlus className="mr-1.5 size-4" />
            Invite User
          </Button>
        )}
      </div>
      <Separator className="my-4" />

      <div className="mb-2 px-3">
        <p className="text-muted-foreground text-xs font-semibold">NOTES</p>
      </div>

      <ScrollArea type="always" className="min-h-0 flex-1">
        <nav className="space-y-1 px-2 pb-2">
          {notesError && (
            <p className="text-destructive px-2 py-1.5 text-xs">
              Failed to load notes
            </p>
          )}
          {(notes || []).map((note: Note) => (
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              className={cn(
                "hover:bg-accent/70 group w-full cursor-pointer select-none rounded-md px-2 py-0.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2",
                selectedId === note.id && "bg-accent"
              )}
              onClick={() => onSelectNote(note.id)}
              onKeyDown={e => {
                // Activate on Enter or Space for accessibility
                if (
                  e.key === "Enter" ||
                  e.key === " " ||
                  e.key === "Spacebar"
                ) {
                  e.preventDefault();
                  onSelectNote(note.id);
                }
              }}
              aria-current={selectedId === note.id ? "page" : undefined}
            >
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <span className="truncate">{note.title || "Untitled"}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground opacity-0 transition-all focus:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="right"
                    className="w-64"
                  >
                    <DropdownMenuLabel className="text-muted-foreground font-normal">
                      Note <strong>{note.title || "Untitled"}</strong>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        window.open(`/notes?note=${note.id}`, "_blank");
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in new tab
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        const url = `${window.location.origin}/notes?note=${note.id}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied to clipboard");
                      }}
                    >
                      <CopyIcon className="mr-2 h-4 w-4" />
                      Copy link
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {onShareNote && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onShareNote(note);
                        }}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                    )}
                    {onExportNote && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onExportNote(note);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1.5">
                      <div className="text-muted-foreground text-xs">
                        Last edited by{" "}
                        <strong>{note.author?.email || "Unknown"}</strong>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {note.updated_at
                          ? new Date(note.updated_at).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
      {/* Sidebar footer - upgrade widget shown at the bottom of the sidebar */}
      {limitReached && user?.role === "admin" && (
        <UpgradeBanner onUpgrade={onUpgrade} />
      )}
      <div className="border-t p-3">
        <UpgradeFooter
          tenant={tenant}
          onUpgrade={onUpgrade}
          user={user}
          onLogout={onLogout}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteNoteId}
        onOpenChange={() => setDeleteNoteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {notes?.find((n: Note) => n.id === deleteNoteId)?.title ||
                "Untitled"}
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteNotePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={onConfirmDelete}
              disabled={deleteNotePending}
            >
              {deleteNotePending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

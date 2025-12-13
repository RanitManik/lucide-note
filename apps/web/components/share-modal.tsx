"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Globe,
  Link as LinkIcon,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: {
    id: string;
    title: string;
    content: any;
  } | null;
}

interface SharedNoteData {
  id: string;
  note_id: string;
  token: string;
  is_public: boolean;
  include_css: boolean;
  expires_at: string | null;
  created_at: string;
  view_count: number;
}

// API functions for sharing
const shareApi = {
  getShareStatus: async (noteId: string): Promise<SharedNoteData | null> => {
    const response = await fetch(`/api/notes/${noteId}/share`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch share status");
    return response.json();
  },

  createShare: async (
    noteId: string,
    options: { include_css?: boolean; expires_in?: string }
  ): Promise<SharedNoteData> => {
    const response = await fetch(`/api/notes/${noteId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    if (!response.ok) throw new Error("Failed to create share link");
    return response.json();
  },

  updateShare: async (
    noteId: string,
    options: { is_public?: boolean; include_css?: boolean; expires_in?: string }
  ): Promise<SharedNoteData> => {
    const response = await fetch(`/api/notes/${noteId}/share`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    if (!response.ok) throw new Error("Failed to update share settings");
    return response.json();
  },

  deleteShare: async (noteId: string): Promise<void> => {
    const response = await fetch(`/api/notes/${noteId}/share`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to remove share");
  },
};

const expiryOptions = [
  { value: "never", label: "Never expires" },
  { value: "1h", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

export function ShareModal({ open, onOpenChange, note }: ShareModalProps) {
  const [includeCss, setIncludeCss] = useState(true);
  const [expiresIn, setExpiresIn] = useState("never");
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current share status
  const {
    data: shareData,
    isLoading: isLoadingShare,
    refetch,
  } = useQuery({
    queryKey: ["share", note?.id],
    queryFn: () => (note?.id ? shareApi.getShareStatus(note.id) : null),
    enabled: open && !!note?.id,
  });

  // Create share mutation
  const createShareMutation = useMutation({
    mutationFn: () =>
      shareApi.createShare(note!.id, {
        include_css: includeCss,
        expires_in: expiresIn === "never" ? undefined : expiresIn,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["share", note?.id] });
      toast.success("Share link created!");
    },
    onError: () => {
      toast.error("Failed to create share link");
    },
  });

  // Update share mutation
  const updateShareMutation = useMutation({
    mutationFn: (options: {
      is_public?: boolean;
      include_css?: boolean;
      expires_in?: string;
    }) => shareApi.updateShare(note!.id, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["share", note?.id] });
      toast.success("Share settings updated!");
    },
    onError: () => {
      toast.error("Failed to update share settings");
    },
  });

  // Delete share mutation
  const deleteShareMutation = useMutation({
    mutationFn: () => shareApi.deleteShare(note!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["share", note?.id] });
      toast.success("Share link removed");
    },
    onError: () => {
      toast.error("Failed to remove share link");
    },
  });

  // Update local state when share data changes
  useEffect(() => {
    if (shareData) {
      setIncludeCss(shareData.include_css);
    }
  }, [shareData]);

  const shareUrl = shareData
    ? `${window.location.origin}/s/${shareData.token}`
    : null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleCreateShare = () => {
    createShareMutation.mutate();
  };

  const handleUpdateShare = (options: { include_css?: boolean }) => {
    updateShareMutation.mutate(options);
  };

  const handleDeleteShare = () => {
    deleteShareMutation.mutate();
  };

  const isAnyLoading =
    isLoadingShare ||
    createShareMutation.isPending ||
    updateShareMutation.isPending ||
    deleteShareMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Share Note
          </DialogTitle>
          <DialogDescription>
            Create a public link to share &quot;{note?.title || "Untitled"}
            &quot; with anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingShare ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : shareData ? (
            <>
              {/* Share Link Section */}
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex items-center gap-2">
                  <div className="bg-muted flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3 py-2">
                    <LinkIcon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <div className="line-clamp-1 max-w-full break-all text-sm">
                      {shareUrl}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(shareUrl!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{shareData.view_count} views</span>
                </div>
                {shareData.expires_at && (
                  <Badge variant="secondary">
                    Expires{" "}
                    {new Date(shareData.expires_at).toLocaleDateString()}
                  </Badge>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCss"
                    checked={includeCss}
                    onCheckedChange={checked => {
                      setIncludeCss(checked as boolean);
                      handleUpdateShare({ include_css: checked as boolean });
                    }}
                    disabled={updateShareMutation.isPending}
                  />
                  <Label
                    htmlFor="includeCss"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Include styling (fonts, colors, layout)
                  </Label>
                </div>
              </div>

              {/* Remove Share */}
              <div className="border-t pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteShare}
                  disabled={deleteShareMutation.isPending}
                  className="w-full"
                >
                  {deleteShareMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove Share Link
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Create Share Section */}
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Globe className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                  <p className="text-sm font-medium">
                    This note is not shared yet
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Create a share link to let anyone view this note
                  </p>
                </div>

                {/* Options before creating */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCssNew"
                      checked={includeCss}
                      onCheckedChange={checked =>
                        setIncludeCss(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="includeCssNew"
                      className="cursor-pointer text-sm font-normal"
                    >
                      Include styling (fonts, colors, layout)
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiresIn">Link Expiration</Label>
                    <Select value={expiresIn} onValueChange={setExpiresIn}>
                      <SelectTrigger id="expiresIn" className="w-full">
                        <SelectValue placeholder="Select expiration" />
                      </SelectTrigger>
                      <SelectContent>
                        {expiryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!isLoadingShare && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className={shareData ? "w-full" : ""}
              onClick={() => onOpenChange(false)}
              disabled={isAnyLoading}
            >
              {shareData ? "Close" : "Cancel"}
            </Button>
            {!shareData && (
              <Button
                onClick={handleCreateShare}
                disabled={createShareMutation.isPending}
              >
                {createShareMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Create Share Link
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

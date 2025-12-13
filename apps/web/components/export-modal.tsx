"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FileText, FileCode, FileType, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportNote, type ExportFormat } from "@/lib/export-utils";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: {
    id: string;
    title: string;
    content: any;
  } | null;
}

const formatOptions: {
  value: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "pdf",
    label: "PDF",
    icon: <FileText className="h-4 w-4" />,
    description: "Best for printing and sharing",
  },
  {
    value: "markdown",
    label: "Markdown",
    icon: <FileCode className="h-4 w-4" />,
    description: "Plain text with formatting syntax",
  },
  {
    value: "html",
    label: "HTML",
    icon: <FileType className="h-4 w-4" />,
    description: "Web page format with styling",
  },
];

export function ExportModal({ open, onOpenChange, note }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [includeStyles, setIncludeStyles] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!note) return;

    setIsExporting(true);
    try {
      await exportNote(note.content, note.title, {
        format,
        includeStyles,
      });
      toast.success(`Note exported as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to export note");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormat = formatOptions.find(f => f.value === format);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Note</DialogTitle>
          <DialogDescription>
            Export &quot;{note?.title || "Untitled"}&quot; to your preferred
            format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={format}
              onValueChange={value => setFormat(value as ExportFormat)}
            >
              <SelectTrigger id="format" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFormat && (
              <p className="text-muted-foreground text-xs">
                {selectedFormat.description}
              </p>
            )}
          </div>

          {/* Style Options - Only for HTML and PDF */}
          {(format === "html" || format === "pdf") && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeStyles"
                checked={includeStyles}
                onCheckedChange={checked =>
                  setIncludeStyles(checked as boolean)
                }
              />
              <Label
                htmlFor="includeStyles"
                className="cursor-pointer text-sm font-normal"
              >
                Include styling (fonts, colors, layout)
              </Label>
            </div>
          )}

          {/* Format-specific info */}
          <div className="bg-muted rounded-lg p-3">
            <p className="text-muted-foreground text-xs">
              {format === "pdf" && (
                <>
                  PDF export will open a print dialog. Select &quot;Save as
                  PDF&quot; as your printer destination to save the file.
                </>
              )}
              {format === "markdown" && (
                <>
                  Markdown files can be opened in any text editor and are
                  commonly used with documentation tools like GitHub, Notion,
                  and Obsidian.
                </>
              )}
              {format === "html" && (
                <>
                  HTML files can be opened in any web browser.{" "}
                  {includeStyles
                    ? "Styling is included."
                    : "No styling will be applied."}
                </>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>Export</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useRef } from "react";
import {
  DocumentSettings,
  PaperSize,
  Orientation,
  MarginSize,
  DocumentTemplateId,
  DocumentThemeColor,
  DocumentFontFamily,
  DocumentColumns,
  FormPeriod,
} from "@/types/document";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Printer, SlidersHorizontal, Upload, X, Palette, Type, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentSettingsPanelProps {
  settings: DocumentSettings;
  onChange: (settings: DocumentSettings) => void;
  onPrint: () => void;
}

const THEME_OPTIONS: { id: DocumentThemeColor; label: string; dotClass: string }[] = [
  { id: "monochrome", label: "Onyx", dotClass: "bg-neutral-900 border-neutral-700" },
  { id: "indigo", label: "Indigo", dotClass: "bg-indigo-600 border-indigo-400" },
  { id: "slate", label: "Slate", dotClass: "bg-slate-700 border-slate-500" },
  { id: "emerald", label: "Emerald", dotClass: "bg-emerald-600 border-emerald-400" },
  { id: "amber", label: "Amber", dotClass: "bg-amber-600 border-amber-400" },
  {
    id: "category",
    label: "Dynamic",
    dotClass: "bg-gradient-to-tr from-blue-500 via-emerald-500 to-amber-500 border-transparent",
  },
];

export function DocumentSettingsPanel({
  settings,
  onChange,
  onPrint,
}: DocumentSettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<DocumentSettings>) => {
    onChange({ ...settings, ...partial });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload a logo image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update({ logoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="bg-card/70 border border-border/50 rounded-lg p-3.5 shadow-2xs space-y-3.5 no-print">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>Print & Export Setup</span>
        </div>
        <Button size="xs" onClick={onPrint} className="h-7 text-xs px-2.5 gap-1 font-medium">
          <Printer className="h-3 w-3" />
          <span>Print</span>
        </Button>
      </div>

      <div className="space-y-3 text-xs">
        {/* Document Template Selection */}
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-muted-foreground">Template Style</Label>
          <Select
            value={settings.template}
            onValueChange={(val) => update({ template: val as DocumentTemplateId })}
          >
            <SelectTrigger className="h-7.5 text-xs rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="professional">Professional Form (Polished)</SelectItem>
              <SelectItem value="modern">Executive Modern (Progress & Accent)</SelectItem>
              <SelectItem value="tabular">Accounting Ledger (Audit Table)</SelectItem>
              <SelectItem value="board">Kanban Board Matrix (Status Lanes)</SelectItem>
              <SelectItem value="simple">Simple Checklist (Minimalist B&W)</SelectItem>
              <SelectItem value="compact">Compact Grid (Dense Multi-column)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Theme Color Palette */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Palette className="h-3 w-3 text-primary" />
            <span>Theme Accent Palette</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = settings.themeColor === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => update({ themeColor: theme.id })}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer min-w-0",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/40 font-semibold shadow-2xs"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={`${theme.label} accent theme`}
                >
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0 border",
                      theme.dotClass
                    )}
                  />
                  <span className="truncate">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography & Layout Format */}
        <div className="grid grid-cols-2 gap-2">
          {/* Font Family */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Type className="h-3 w-3" />
              <span>Typography</span>
            </div>
            <Select
              value={settings.fontFamily}
              onValueChange={(val) => update({ fontFamily: val as DocumentFontFamily })}
            >
              <SelectTrigger className="h-7.5 text-xs rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="sans">Modern Sans (Clean)</SelectItem>
                <SelectItem value="serif">Editorial Serif (Classic)</SelectItem>
                <SelectItem value="mono">Technical Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Column Layout */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <LayoutGrid className="h-3 w-3" />
              <span>Columns</span>
            </div>
            <Select
              value={settings.columnsLayout}
              onValueChange={(val) => update({ columnsLayout: val as DocumentColumns })}
            >
              <SelectTrigger className="h-7.5 text-xs rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="single">Single Column</SelectItem>
                <SelectItem value="two_column">2 Columns (Grid)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Paper Size & Orientation */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Paper Size</Label>
            <Select
              value={settings.paperSize}
              onValueChange={(val) => update({ paperSize: val as PaperSize })}
            >
              <SelectTrigger className="h-7.5 text-xs rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="a4">A4 (210 × 297mm)</SelectItem>
                <SelectItem value="letter">US Letter (8.5 × 11in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Orientation</Label>
            <Select
              value={settings.orientation}
              onValueChange={(val) => update({ orientation: val as Orientation })}
            >
              <SelectTrigger className="h-7.5 text-xs rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Margins & Period */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Margins</Label>
            <Select
              value={settings.margin}
              onValueChange={(val) => update({ margin: val as MarginSize })}
            >
              <SelectTrigger className="h-7.5 text-xs rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="compact">Compact (10mm)</SelectItem>
                <SelectItem value="normal">Normal (20mm)</SelectItem>
                <SelectItem value="wide">Wide (30mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Period</Label>
            <Select
              value={settings.formPeriod}
              onValueChange={(val) => update({ formPeriod: val as FormPeriod })}
            >
              <SelectTrigger className="h-7.5 text-xs rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Header & Branding Section */}
        <div className="pt-2 border-t border-border/40 space-y-2.5">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Header & Branding
          </Label>

          {/* Logo Upload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Document Logo
              </Label>
              {settings.logoUrl && (
                <button
                  type="button"
                  onClick={() => update({ logoUrl: null })}
                  className="text-destructive hover:underline text-[10px] flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                  Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {settings.logoUrl ? (
              <div className="flex items-center gap-2 p-1.5 bg-background rounded-md border border-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logoUrl}
                  alt="Uploaded logo"
                  className="h-8 max-w-[80px] object-contain rounded"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-6 text-[10px] px-2 ml-auto"
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground justify-center border-dashed"
              >
                <Upload className="h-3 w-3" />
                <span>Upload Logo (PNG, SVG, JPG)</span>
              </Button>
            )}
          </div>

          {/* Organization Name */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Organization / Company
            </Label>
            <Input
              value={settings.organizationName || ""}
              onChange={(e) => update({ organizationName: e.target.value })}
              placeholder="e.g. Acme Corporation"
              className="h-7.5 text-xs rounded-md"
            />
          </div>

          {/* Form Title */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Form Title</Label>
            <Input
              value={settings.customTitle}
              onChange={(e) => update({ customTitle: e.target.value })}
              placeholder="TASK MANAGEMENT FORM"
              className="h-7.5 text-xs rounded-md"
            />
          </div>

          {/* Header Subtitle */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Header Subtitle / Tagline
            </Label>
            <Input
              value={settings.headerSubtitle || ""}
              onChange={(e) => update({ headerSubtitle: e.target.value })}
              placeholder="e.g. Operations & Delivery Division"
              className="h-7.5 text-xs rounded-md"
            />
          </div>
        </div>

        {/* Section Toggles */}
        <div className="pt-2 border-t border-border/40 space-y-2">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Included Elements
          </Label>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={settings.includeSummary}
                onCheckedChange={(c) => update({ includeSummary: !!c })}
                className="h-3.5 w-3.5"
              />
              <span>Summary Box</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={settings.includePriority}
                onCheckedChange={(c) => update({ includePriority: !!c })}
                className="h-3.5 w-3.5"
              />
              <span>Priority Tags</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={settings.includeDueDates}
                onCheckedChange={(c) => update({ includeDueDates: !!c })}
                className="h-3.5 w-3.5"
              />
              <span>Due Dates</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={settings.includeStatus}
                onCheckedChange={(c) => update({ includeStatus: !!c })}
                className="h-3.5 w-3.5"
              />
              <span>Status</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={settings.includeSubtasks}
                onCheckedChange={(c) => update({ includeSubtasks: !!c })}
                className="h-3.5 w-3.5"
              />
              <span>Subtasks</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={settings.includeNotes}
                onCheckedChange={(c) => update({ includeNotes: !!c })}
                className="h-3.5 w-3.5"
              />
              <span>Notes Box</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={settings.includeSignature}
                onCheckedChange={(c) => update({ includeSignature: !!c })}
                className="h-3.5 w-3.5"
              />
              <span>Signature Line</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={settings.includeCompleted}
                onCheckedChange={(c) => update({ includeCompleted: !!c })}
                className="h-3.5 w-3.5"
              />
              <span>Completed</span>
            </label>
          </div>
        </div>

        {/* Empty fill-in lines */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <Label className="text-[11px] text-muted-foreground">Empty task lines:</Label>
          <div className="flex items-center gap-1">
            {[0, 3, 5].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => update({ emptyRowsCount: count })}
                className={`h-6 w-6 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                  settings.emptyRowsCount === count
                    ? "bg-primary text-primary-foreground font-semibold border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

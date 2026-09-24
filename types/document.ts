export type PaperSize = "a4" | "letter";
export type Orientation = "portrait" | "landscape";
export type MarginSize = "normal" | "compact" | "wide";
export type FormPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "custom";
export type DocumentTemplateId =
  | "professional"
  | "modern"
  | "tabular"
  | "board"
  | "simple"
  | "compact";

export type DocumentThemeColor =
  | "monochrome"
  | "indigo"
  | "slate"
  | "emerald"
  | "amber"
  | "category";

export type DocumentFontFamily = "sans" | "serif" | "mono";

export type DocumentColumns = "single" | "two_column";

export interface DocumentSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  margin: MarginSize;
  template: DocumentTemplateId;
  themeColor: DocumentThemeColor;
  fontFamily: DocumentFontFamily;
  columnsLayout: DocumentColumns;
  includeSummary: boolean;
  includeNotes: boolean;
  includePriority: boolean;
  includeDueDates: boolean;
  includeStatus: boolean;
  includeSubtasks: boolean;
  includeCompleted: boolean;
  includeSignature: boolean;
  emptyRowsCount: number;
  formName: string;
  formPeriod: FormPeriod;
  customPeriod?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  hideWorkspace?: boolean;
  customTitle: string;
  logoUrl?: string | null;
  organizationName?: string;
  headerSubtitle?: string;
}

export const defaultDocumentSettings: DocumentSettings = {
  paperSize: "a4",
  orientation: "portrait",
  margin: "normal",
  template: "professional",
  themeColor: "monochrome",
  fontFamily: "sans",
  columnsLayout: "single",
  includeSummary: true,
  includeNotes: true,
  includePriority: true,
  includeDueDates: true,
  includeStatus: true,
  includeSubtasks: true,
  includeCompleted: true,
  includeSignature: true,
  emptyRowsCount: 0,
  formName: "",
  formPeriod: "weekly",
  customPeriod: "",
  periodStartDate: "",
  periodEndDate: "",
  hideWorkspace: false,
  customTitle: "TASK MANAGEMENT FORM",
  logoUrl: null,
  organizationName: "",
  headerSubtitle: "",
};

export function formatPeriodDisplay(settings: DocumentSettings): string {
  if (settings.formPeriod === "custom") {
    const hasStart = !!settings.periodStartDate;
    const hasEnd = !!settings.periodEndDate;
    const customLabel = settings.customPeriod?.trim();

    let dateRangeStr = "";
    if (hasStart && hasEnd) {
      const start = new Date(settings.periodStartDate + "T00:00:00");
      const end = new Date(settings.periodEndDate + "T00:00:00");
      const startFmt = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const endFmt = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      dateRangeStr = startFmt === endFmt ? startFmt : `${startFmt} – ${endFmt}`;
    } else if (hasStart) {
      const start = new Date(settings.periodStartDate + "T00:00:00");
      dateRangeStr = `From ${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else if (hasEnd) {
      const end = new Date(settings.periodEndDate + "T00:00:00");
      dateRangeStr = `Until ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    if (customLabel && dateRangeStr) {
      return `${customLabel} (${dateRangeStr})`;
    }
    if (customLabel) {
      return customLabel;
    }
    if (dateRangeStr) {
      return dateRangeStr;
    }
    return "Custom Period";
  }

  const periodBase = settings.formPeriod.toUpperCase();
  if (settings.customPeriod?.trim()) {
    return `${periodBase} (${settings.customPeriod.trim()})`;
  }
  return periodBase;
}

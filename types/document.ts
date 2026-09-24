export type PaperSize = "a4" | "letter";
export type Orientation = "portrait" | "landscape";
export type MarginSize = "normal" | "compact" | "wide";
export type FormPeriod = "daily" | "weekly" | "monthly";
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
  customTitle: "TASK MANAGEMENT FORM",
  logoUrl: null,
  organizationName: "",
  headerSubtitle: "",
};

export type PaperSize = "a4" | "letter";
export type Orientation = "portrait" | "landscape";
export type MarginSize = "normal" | "compact" | "wide";
export type DocumentTemplateId = "professional" | "simple" | "compact";
export type FormPeriod = "daily" | "weekly" | "monthly" | "custom";

export interface DocumentSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  margin: MarginSize;
  template: DocumentTemplateId;
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

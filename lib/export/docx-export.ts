"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
} from "docx";
import { WorkspaceWithDetails } from "@/types/database";
import { DocumentSettings } from "@/types/document";
import { formatDate } from "@/lib/utils";
import { downloadBlob } from "@/lib/export/download";

export async function exportToDocx(
  workspace: WorkspaceWithDetails,
  settings: DocumentSettings
): Promise<void> {
  // Collect tasks
  const allTasks = workspace.categories.flatMap((c) =>
    c.subcategories.flatMap((s) => s.tasks)
  );
  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === "completed").length;
  const pending = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const children: (Paragraph | Table)[] = [];

  // Organization Header
  if (settings.organizationName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: settings.organizationName.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            color: "374151",
          }),
        ],
      })
    );
  }

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: settings.headerSubtitle ? 60 : 120 },
      children: [
        new TextRun({
          text: settings.customTitle || "TASK MANAGEMENT FORM",
          bold: true,
          size: 32, // 16pt
          color: "111827",
        }),
      ],
    })
  );

  // Subtitle / Tagline
  if (settings.headerSubtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: settings.headerSubtitle,
            size: 20, // 10pt
            color: "6B7280",
          }),
        ],
      })
    );
  }

  // Workspace & Date Metadata
  const wsPart = settings.hideWorkspace ? "" : `Workspace: ${workspace.name}  |  `;
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `${wsPart}Date: ${formatDate(new Date())}`,
          size: 20, // 10pt
          color: "4B5563",
          italics: true,
        }),
      ],
    })
  );

  // Metadata Fields Table (Name, Date, Period)
  const periodLabel =
    settings.formPeriod === "custom"
      ? `[X] ${settings.customPeriod || "Custom"}`
      : `[${settings.formPeriod === "daily" ? "X" : " "}] Daily  [${
          settings.formPeriod === "weekly" ? "X" : " "
        }] Weekly  [${settings.formPeriod === "monthly" ? "X" : " "}] Monthly${
          settings.customPeriod ? ` (${settings.customPeriod})` : ""
        }`;

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Name: ", bold: true, size: 20 }),
                    new TextRun({ text: settings.formName || "________________________", size: 20 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Date: ", bold: true, size: 20 }),
                    new TextRun({ text: formatDate(new Date()), size: 20 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Period: ", bold: true, size: 20 }),
                    new TextRun({
                      text: periodLabel,
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ spacing: { after: 200 } }));

  // Summary Table if enabled
  if (settings.includeSummary) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "F3F4F6" },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Total Tasks", bold: true, size: 20 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: String(total), bold: true, size: 24 })],
                  }),
                ],
              }),
              new TableCell({
                shading: { fill: "F3F4F6" },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Completed", bold: true, size: 20 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: String(completed), bold: true, size: 24 })],
                  }),
                ],
              }),
              new TableCell({
                shading: { fill: "F3F4F6" },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Pending", bold: true, size: 20 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: String(pending), bold: true, size: 24 })],
                  }),
                ],
              }),
              new TableCell({
                shading: { fill: "F3F4F6" },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Progress", bold: true, size: 20 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `${progress}%`, bold: true, size: 24 })],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
    children.push(new Paragraph({ spacing: { after: 240 } }));
  }

  // Categories & Tasks
  for (const category of workspace.categories) {
    const activeSubcategories = category.subcategories.filter((sub) =>
      settings.includeCompleted
        ? sub.tasks.length > 0 || settings.emptyRowsCount > 0
        : sub.tasks.some((t) => t.status !== "completed") || settings.emptyRowsCount > 0
    );

    if (activeSubcategories.length === 0) continue;

    // Category Banner
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: `CATEGORY: ${category.name.toUpperCase()}`,
            bold: true,
            size: 24, // 12pt
            color: "1F2937",
          }),
        ],
      })
    );

    for (const subcategory of activeSubcategories) {
      // Subcategory heading
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 140, after: 80 },
          children: [
            new TextRun({
              text: `> ${subcategory.name.toUpperCase()}`,
              bold: true,
              size: 22, // 11pt
              color: "374151",
            }),
          ],
        })
      );

      const tasksToRender = subcategory.tasks.filter((t) =>
        settings.includeCompleted ? true : t.status !== "completed"
      );

      for (const task of tasksToRender) {
        const isDone = task.status === "completed";
        const metaParts: string[] = [];
        if (settings.includePriority) metaParts.push(`Priority: ${task.priority.toUpperCase()}`);
        if (settings.includeDueDates && task.due_date)
          metaParts.push(`Due: ${formatDate(task.due_date)}`);
        if (settings.includeStatus) metaParts.push(`Status: ${task.status.replace("_", " ")}`);

        // Task line
        children.push(
          new Paragraph({
            spacing: { before: 60, after: 40 },
            indent: { left: 360 }, // 0.25 inch
            children: [
              new TextRun({
                text: isDone ? "☑ " : "☐ ",
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: task.title,
                bold: true,
                strike: isDone,
                size: 22,
              }),
              metaParts.length > 0
                ? new TextRun({
                    text: `   (${metaParts.join(" | ")})`,
                    size: 18,
                    color: "6B7280",
                  })
                : new TextRun({ text: "" }),
            ],
          })
        );

        if (task.description) {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              indent: { left: 720 },
              children: [
                new TextRun({
                  text: task.description,
                  italics: true,
                  size: 18,
                  color: "4B5563",
                }),
              ],
            })
          );
        }

        if (settings.includeNotes && task.notes) {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              indent: { left: 720 },
              children: [
                new TextRun({
                  text: `Note: ${task.notes}`,
                  italics: true,
                  size: 18,
                  color: "4B5563",
                }),
              ],
            })
          );
        }

        // Subtasks
        if (settings.includeSubtasks && task.subtasks && task.subtasks.length > 0) {
          for (const st of task.subtasks) {
            const stDone = st.status === "completed";
            children.push(
              new Paragraph({
                spacing: { before: 20, after: 20 },
                indent: { left: 720 },
                children: [
                  new TextRun({
                    text: stDone ? "☑ " : "☐ ",
                    bold: true,
                    size: 20,
                  }),
                  new TextRun({
                    text: st.title,
                    strike: stDone,
                    size: 20,
                    color: stDone ? "9CA3AF" : "374151",
                  }),
                ],
              })
            );
          }
        }
      }

      // Empty rows if requested
      for (let i = 0; i < settings.emptyRowsCount; i++) {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({
                text: "☐ ____________________________________________________  Due: __________",
                size: 20,
                color: "9CA3AF",
              }),
            ],
          })
        );
      }
    }
  }

  // Freeform notes if enabled
  if (settings.includeNotes) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: "ADDITIONAL NOTES", bold: true, size: 22 })],
      })
    );
    for (let i = 0; i < 3; i++) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "_________________________________________________________________________________",
              size: 20,
              color: "9CA3AF",
            }),
          ],
        })
      );
    }
  }

  // Signature Section if enabled
  if (settings.includeSignature) {
    children.push(new Paragraph({ spacing: { before: 240, after: 80 } }));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Completed by:", bold: true, size: 20 })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: "___________________________", size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Date:", bold: true, size: 20 })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: "___________________________", size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Signature:", bold: true, size: 20 })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: "___________________________", size: 20 })],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Generate Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = (workspace.name || "tasks").toLowerCase().replace(/[^a-z0-9]/g, "-");
  downloadBlob(blob, `${cleanName}-tasks.docx`);
}

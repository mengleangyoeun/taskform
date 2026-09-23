"use client";

import { TaskProvider } from "@/lib/task-store";
import { Navbar } from "@/components/navbar";
import { WorkspaceView } from "@/components/tasks/workspace-view";

export default function Home() {
  return (
    <TaskProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground print:bg-white print:text-black print:min-h-0 print:block">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 print:p-0 print:m-0 print:max-w-none print:w-full print:block">
          <WorkspaceView />
        </main>
      </div>
    </TaskProvider>
  );
}

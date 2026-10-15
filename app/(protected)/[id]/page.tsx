"use client";

import { useParams, useRouter } from "next/navigation";

import { ProgramAssignmentTable } from "@/app/(protected)/_components/program-assignment-table";
import { ProgramsPanel } from "@/app/(protected)/_components/programs-panel";
import { TeachersPanel } from "@/app/(protected)/_components/teachers-panel";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function AssignmentsPage() {
  const params = useParams();
  const programId = Number(params.id);
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleNavigate = (nextProgramId: number) => {
    router.push(`/${nextProgramId}`);
  };

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {isMobile && (
          <ProgramsPanel
            selectedProgramId={programId}
            onSelectProgram={handleNavigate}
          />
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <ProgramAssignmentTable programId={programId} />
          </div>
          <aside className="hidden md:flex w-full max-w-90 shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:min-h-0">
            <ProgramsPanel
              selectedProgramId={programId}
              onSelectProgram={handleNavigate}
            />
            <TeachersPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}

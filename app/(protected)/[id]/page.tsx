"use client";

import { useParams, useRouter } from "next/navigation";

import { ProgramAssignmentTable } from "@/app/(protected)/_components/program-assignment-table";
import { TeachersPanel } from "@/app/(protected)/_components/teachers-panel";

export default function AssignmentsPage() {
  const params = useParams();
  const programId = Number(params.id);
  const router = useRouter();

  const handleNavigate = (nextProgramId: number) => {
    router.push(`/${nextProgramId}`);
  };

  return (
    <div className="container">
      <div className="space-y-6">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <ProgramAssignmentTable
              programId={programId}
              onSelectProgram={handleNavigate}
            />
          </div>

          <aside className="hidden min-h-0 w-full flex-col md:flex lg:sticky lg:top-18 lg:h-[calc(100vh-5.5rem)]">
            <TeachersPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}

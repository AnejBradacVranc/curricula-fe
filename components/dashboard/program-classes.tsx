"use client";

import { BookOpen, Clock } from "lucide-react";
import { SubjectAssignmentSlot } from "@/components/dashboard/subject-assignment-slot";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  AssignmentWithRelations,
  ProgramWithRelations,
} from "@/types";

type ProgramClassesProps = {
  program: ProgramWithRelations;
  assignments: AssignmentWithRelations[];
  pendingSubjectId: number | null;
  onAssignTeacher: (input: {
    programId: number;
    subjectId: number;
    teacherId: number;
  }) => void;
  onRemoveAssignment: (input: {
    programId: number;
    subjectId: number;
    teacherId: number;
  }) => void;
};

function getTeacherForSubject(
  subjectId: number,
  assignments: AssignmentWithRelations[],
) {
  return assignments.find((assignment) => assignment.subjectId === subjectId)
    ?.teacher;
}

function getAssignmentForSubject(
  subjectId: number,
  assignments: AssignmentWithRelations[],
) {
  return assignments.find((assignment) => assignment.subjectId === subjectId);
}

export function ProgramClasses({
  program,
  assignments,
  pendingSubjectId,
  onAssignTeacher,
  onRemoveAssignment,
}: ProgramClassesProps) {
  const classes = program.programSubjects;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{program.name}</h2>
          <p className="text-sm text-muted-foreground">
            Povlecite učitelja z desne strani na predmet za dodelitev.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Clock className="size-3" />
          {program.availableHours}h na voljo
        </Badge>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Ta program še nima dodeljenih predmetov.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((programSubject) => {
            const assignment = getAssignmentForSubject(
              programSubject.subjectId,
              assignments,
            );
            const teacher = getTeacherForSubject(
              programSubject.subjectId,
              assignments,
            );
            const isPending = pendingSubjectId === programSubject.subjectId;

            return (
              <Card key={programSubject.subjectId} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      {programSubject.subject.name}
                    </CardTitle>
                    <Badge variant="outline">
                      {programSubject.requiredHours}h
                    </Badge>
                  </div>
                  <CardDescription>Potrebne ure na teden</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubjectAssignmentSlot
                    teacher={teacher}
                    isPending={isPending}
                    disabled={pendingSubjectId !== null && !isPending}
                    onAssign={(teacherId) =>
                      onAssignTeacher({
                        programId: program.id,
                        subjectId: programSubject.subjectId,
                        teacherId,
                      })
                    }
                    onRemove={() => {
                      if (!assignment) {
                        return;
                      }

                      onRemoveAssignment({
                        programId: program.id,
                        subjectId: programSubject.subjectId,
                        teacherId: assignment.teacherId,
                      });
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

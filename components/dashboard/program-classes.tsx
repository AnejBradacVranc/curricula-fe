import { BookOpen, Clock, UserRound } from "lucide-react";
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
};

function getTeacherForSubject(
  subjectId: number,
  assignments: AssignmentWithRelations[],
) {
  return assignments.find((assignment) => assignment.subjectId === subjectId)
    ?.teacher;
}

export function ProgramClasses({ program, assignments }: ProgramClassesProps) {
  const classes = program.programSubjects;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{program.name}</h2>
          <p className="text-sm text-muted-foreground">
            Predmeti in urniki za izbrani program.
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
            const teacher = getTeacherForSubject(
              programSubject.subjectId,
              assignments,
            );

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
                  {teacher ? (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                      <UserRound className="size-4 shrink-0 text-muted-foreground" />
                      <span>
                        {teacher.name} {teacher.surname}
                      </span>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                      Učitelj še ni dodeljen
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

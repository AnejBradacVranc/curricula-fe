import { Clock, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Teacher } from "@/types";

type TeachersPanelProps = {
  teachers: Teacher[];
};

export function TeachersPanel({ teachers }: TeachersPanelProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Učitelji
          </CardTitle>
          <Badge variant="secondary">{teachers.length}</Badge>
        </div>
        <CardDescription>
          Vsi učitelji vaše šole in njihove dodeljene učne ure.
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        {teachers.length === 0 ? (
          <p className="px-(--card-spacing) py-8 text-center text-sm text-muted-foreground">
            Ni registriranih učiteljev.
          </p>
        ) : (
          <ScrollArea className="h-full max-h-[min(70vh,640px)]">
            <ul className="divide-y divide-border">
              {teachers.map((teacher) => (
                <li key={teacher.id} className="px-(--card-spacing) py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium">
                        {teacher.name} {teacher.surname}
                      </p>
                      <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <Mail className="size-3 shrink-0" />
                        {teacher.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 gap-1">
                      <Clock className="size-3" />
                      {teacher.assignedHours}h
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>

      {teachers.length > 0 && (
        <>
          <Separator />
          <div className="px-(--card-spacing) py-3 text-xs text-muted-foreground">
            Skupaj dodeljenih ur:{" "}
            <span className="font-medium text-foreground">
              {teachers.reduce((sum, teacher) => sum + teacher.assignedHours, 0)}
              h
            </span>
          </div>
        </>
      )}
    </Card>
  );
}

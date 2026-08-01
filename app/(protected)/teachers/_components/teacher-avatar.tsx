import { User } from "lucide-react";

import { hasColor } from "@/lib/teacher-color";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "size-10",
  md: "size-12",
  lg: "size-24",
} as const;

const iconClass = {
  sm: "size-5",
  md: "size-6",
  lg: "size-10",
} as const;

type TeacherAvatarProps = {
  name: string;
  surname: string;
  profileImage?: string | null;
  color?: string | null;
  size?: keyof typeof sizeClass;
  className?: string;
};

export function TeacherAvatar({
  name,
  surname,
  profileImage,
  color,
  size = "sm",
  className,
}: TeacherAvatarProps) {
  const frameClass = cn(
    "shrink-0 overflow-hidden rounded-lg",
    sizeClass[size],
    className,
  );

  if (profileImage) {
    return (
      <div className={frameClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profileImage}
          alt={`${name} ${surname}`}
          className="size-full object-cover"
        />
      </div>
    );
  }

  if (hasColor(color)) {
    return (
      <div
        className={frameClass}
        style={{ backgroundColor: color }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        frameClass,
        "flex items-center justify-center bg-primary/10 text-primary",
      )}
    >
      <User className={iconClass[size]} />
    </div>
  );
}

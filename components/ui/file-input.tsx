"use client";

import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileInputProps = {
  id?: string;
  accept?: string;
  disabled?: boolean;
  file?: File | null;
  buttonLabel?: string;
  emptyLabel?: string;
  className?: string;
  onFileChange: (file: File | null) => void;
};

export function FileInput({
  id,
  accept,
  disabled = false,
  file = null,
  buttonLabel = "Izberi datoteko",
  emptyLabel = "Datoteka ni izbrana",
  className,
  onFileChange,
}: FileInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [file]);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onFileChange(event.target.files?.[0] ?? null);
        }}
      />
      <Button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {buttonLabel}
      </Button>
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        {file
          ? `${file.name} (${Math.round(file.size / 1024)} KB)`
          : emptyLabel}
      </span>
    </div>
  );
}

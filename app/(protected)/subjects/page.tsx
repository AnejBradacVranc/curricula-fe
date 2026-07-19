"use client";

import { getSubjects } from "@/lib/api";
import { Subject } from "@/types";
import React, { useEffect, useState } from "react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSubjects() {
      setIsLoading(true);
      setError(null);

      try {
        const subjectsData = await getSubjects();

        if (!cancelled) {
          setSubjects(subjectsData);
        }
      } catch {
        if (!cancelled) {
          setError("Podatkov ni bilo mogoče naložiti. Poskusite znova.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSubjects();

    return () => {
      cancelled = true;
    };
  }, []);
}

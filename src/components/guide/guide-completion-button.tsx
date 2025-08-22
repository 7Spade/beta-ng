"use client";

import { useProgress } from "@/hooks/use-progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GuideCompletionButtonProps {
  slug: string;
}

export function GuideCompletionButton({ slug }: GuideCompletionButtonProps) {
  const { isLoaded, isCompleted, toggleComplete } = useProgress();
  const completed = isCompleted(slug);

  if (!isLoaded) {
    return <Skeleton className="h-10 w-48" />;
  }

  return (
    <Button
      variant={completed ? "secondary" : "default"}
      size="lg"
      onClick={() => toggleComplete(slug)}
      className="transition-all duration-200"
    >
      {completed ? (
        <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
      ) : (
        <Circle className="mr-2 h-5 w-5" />
      )}
      {completed ? "Mark as Incomplete" : "Mark as Complete"}
    </Button>
  );
}

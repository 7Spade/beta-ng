"use client";

import Link from "next/link";
import type { Category, Guide } from "@/lib/data";
import { useProgress } from "@/hooks/use-progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, GitBranch, Layers3 } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  guides: Guide[];
}

const icons = {
    "Code": Code,
    "Layers3": Layers3,
    "GitBranch": GitBranch
}

export function CategoryCard({ category, guides }: CategoryCardProps) {
  const { progress, isLoaded } = useProgress();

  const completedCount = guides.filter((guide) =>
    progress.completedGuides.has(guide.slug)
  ).length;
  const totalCount = guides.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const firstGuideSlug = guides[0]?.slug;

  const Icon = icons[category.iconName];

  return (
    <Link
      href={firstGuideSlug ? `/guides/${firstGuideSlug}` : "#"}
      className="group block"
    >
      <Card className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 border-2 border-transparent hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <Icon className="h-10 w-10 text-primary mb-4" />
            {isLoaded && completionPercentage === 100 && (
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">Complete</Badge>
            )}
          </div>
          <CardTitle>{category.title}</CardTitle>
          <CardDescription>{category.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoaded && totalCount > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                <span>Progress</span>
                <span>
                  {completedCount} / {totalCount}
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          ) : (
             <div className="h-8"></div>
          )}
        </CardContent>
        <CardFooter>
            <div className="text-sm font-medium text-primary flex items-center gap-2">
                Start Learning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
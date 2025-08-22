import { guides } from "@/lib/data";
import { notFound } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GuideCompletionButton } from "@/components/guide/guide-completion-button";
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type GuidePageProps = {
  params: {
    slug: string;
  };
};

export default function GuidePage({ params }: GuidePageProps) {
  const guide = guides.find((g) => g.slug === params.slug);

  if (!guide) {
    notFound();
  }

  const currentIndex = guides.findIndex(g => g.slug === params.slug);
  const prevGuide = currentIndex > 0 ? guides[currentIndex - 1] : null;
  const nextGuide = currentIndex < guides.length - 1 ? guides[currentIndex + 1] : null;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {guide.title}
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          {guide.description}
        </p>
        <div className="mt-6">
          <GuideCompletionButton slug={guide.slug} />
        </div>
      </header>

      <main>
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {guide.steps.map((step, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Step {index + 1}: {step.title}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {step.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

      <footer className="mt-12 flex justify-between items-center">
        {prevGuide ? (
          <Button asChild variant="outline">
            <Link href={`/guides/${prevGuide.slug}`} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span>{prevGuide.title}</span>
            </Link>
          </Button>
        ) : <div />}
        {nextGuide ? (
           <Button asChild variant="outline">
            <Link href={`/guides/${nextGuide.slug}`} className="flex items-center gap-2">
              <span>{nextGuide.title}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : <div />}
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

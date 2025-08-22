"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateLearningPathAction } from "./actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2, ListOrdered } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  userInput: z
    .string()
    .min(10, {
      message: "Please enter at least 10 characters.",
    })
    .max(2000, {
      message: "Input cannot exceed 2000 characters.",
    }),
});

export default function LearnPathPage() {
  const [learningPath, setLearningPath] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userInput: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLearningPath(null);
    const result = await generateLearningPathAction(values);

    if (result.success && result.data) {
      setLearningPath(result.data.concepts);
    } else {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: result.error,
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-4xl font-bold">Generate Your Learning Path</h1>
        <p className="text-muted-foreground mt-2">
          Not sure what to learn next? Paste a code snippet you're struggling
          with, or describe your current skills, and our AI will suggest a
          prioritized list of concepts for you to master.
        </p>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="userInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Code or Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I know basic JavaScript but I'm confused by async/await...' or paste a code snippet."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more context you provide, the better the suggestions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                   <Lightbulb className="mr-2 h-4 w-4" />
                    Generate Path
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
        <div className="mt-8 md:mt-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered />
                Your Recommended Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                 <div className="space-y-3">
                    <div className="h-6 bg-muted rounded-md animate-pulse w-3/4"></div>
                    <div className="h-6 bg-muted rounded-md animate-pulse w-1/2"></div>
                    <div className="h-6 bg-muted rounded-md animate-pulse w-5/6"></div>
                 </div>
              )}
              {!isLoading && learningPath && (
                <ol className="list-decimal list-inside space-y-3">
                  {learningPath.map((concept, index) => (
                    <li key={index} className="text-lg text-foreground bg-primary/5 p-3 rounded-md border border-primary/10">
                      {concept}
                    </li>
                  ))}
                </ol>
              )}
               {!isLoading && !learningPath && (
                <div className="text-center text-muted-foreground py-10">
                    <p>Your generated learning path will appear here.</p>
                </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { KnowledgeBaseEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleDeleteKnowledgeBaseEntry } from '@/app/actions/knowledge.actions';
import { Trash2, Wand2, Loader2, Cpu } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { generateKnowledgeEntry } from '@/ai/flows/generate-knowledge-entry-flow';
import { Badge } from '@/components/ui/badge';


const entrySchema = z.object({
  title: z.string().min(3, '標題至少需要 3 個字元。'),
  category: z.string().min(2, '分類至少需要 2 個字元。'),
  content: z.string().min(10, '內容至少需要 10 個字元。'),
  tags: z.string().optional(),
});

type EntryFormValues = z.infer<typeof entrySchema>;

interface EntryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<KnowledgeBaseEntry, 'id' | 'createdAt' | 'updatedAt'>, entryId?: string) => Promise<boolean>;
  entry: KnowledgeBaseEntry | null;
}

export function EntryFormDialog({ isOpen, onOpenChange, onSave, entry }: EntryFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTokens, setGeneratedTokens] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: { title: '', category: '', content: '', tags: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        form.reset({
          ...entry,
          tags: entry.tags?.join(', '),
        });
      } else {
        form.reset({ title: '', category: '', content: '', tags: '' });
      }
      setGeneratedTokens(null);
    }
  }, [entry, isOpen, form]);

  const handleDialogChange = (open: boolean) => {
    if (isSaving || isDeleting || isGenerating) return;
    onOpenChange(open);
  };

  async function onSubmit(values: EntryFormValues) {
    setIsSaving(true);
    const dataToSave = {
        ...values,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    };
    const success = await onSave(dataToSave, entry?.id);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
    }
  }
  
  async function onDelete() {
      if (!entry?.id) return;
      setIsDeleting(true);
      const result = await handleDeleteKnowledgeBaseEntry(entry.id);
      if (result.error) {
          toast({ title: "錯誤", description: result.error, variant: "destructive" });
      } else {
          toast({ title: result.message });
          onOpenChange(false);
      }
      setIsDeleting(false);
  }

  async function handleAiGenerate() {
    const title = form.getValues('title');
    if (!title) {
        toast({ title: "缺少標題", description: "請先輸入工法標題以生成內容。", variant: "destructive" });
        return;
    }
    setIsGenerating(true);
    setGeneratedTokens(null);
    try {
        const result = await generateKnowledgeEntry({ title });
        form.setValue('category', result.category);
        form.setValue('content', result.content);
        form.setValue('tags', result.tags.join(', '));
        setGeneratedTokens(result.totalTokens);
        toast({ title: "AI 生成成功！" });
    } catch(err) {
        console.error(err);
        toast({ title: "AI 生成失敗", description: "無法生成內容，請稍後再試。", variant: "destructive" });
    } finally {
        setIsGenerating(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry ? '編輯工法' : '新增工法'}</DialogTitle>
          <DialogDescription>
            {entry ? '更新此工法的詳細資訊。' : '為您的知識庫建立一個新的工法或程序。'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>標題</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="例如：混凝土澆置標準作業程序" {...field} />
                      <Button type="button" variant="outline" onClick={handleAiGenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">{isGenerating ? '生成中...' : 'AI 生成內容'}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {generatedTokens !== null && (
              <div className="flex justify-end">
                  <Badge variant="secondary" className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      <span>{generatedTokens.toLocaleString()} tokens</span>
                  </Badge>
              </div>
            )}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分類</FormLabel>
                  <FormControl><Input placeholder="例如：結構工程" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>內容 (支援 Markdown)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="詳細描述工作方法、順序、注意事項..."
                      className="min-h-[250px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>標籤 (用逗號分隔)</FormLabel>
                  <FormControl><Input placeholder="例如：混凝土, 品質控制, 安全" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between pt-2">
                <div>
                {entry && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button type="button" variant="destructive" disabled={isSaving || isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting ? '刪除中...' : '刪除'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>確定要刪除「{entry.title}」嗎？</AlertDialogTitle>
                                <AlertDialogDescription>此操作無法復原，將永久刪除此筆工法資料。</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete}>繼續刪除</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)} disabled={isSaving}>取消</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? '儲存中...' : '儲存'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Skill } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const skillSchema = z.object({
  name: z.string().min(2, '技能名稱至少需要 2 個字元。'),
  description: z.string().optional(),
});

type SkillFormValues = z.infer<typeof skillSchema>;

interface SkillFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Skill, 'id'>, skillId?: string) => Promise<boolean>;
  skill: Skill | null;
}

export function SkillFormDialog({ isOpen, onOpenChange, onSave, skill }: SkillFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (skill) {
        form.reset(skill);
      } else {
        form.reset({ name: '', description: '' });
      }
    }
  }, [skill, isOpen, form]);
  
  const handleOpenChange = (open: boolean) => {
    if (isSaving) return;
    onOpenChange(open);
  }

  async function onSubmit(values: SkillFormValues) {
    setIsSaving(true);
    const success = await onSave(values, skill?.id);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{skill ? '編輯技能' : '新增技能'}</DialogTitle>
          <DialogDescription>
            {skill ? '更新此技能的詳細資訊。' : '為您的團隊資料庫建立一個新技能。'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>技能名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：水電工程" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述 (可選)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="簡要描述此技能的內容..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={isSaving}>取消</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? '儲存中...' : '儲存技能'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

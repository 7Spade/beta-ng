
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { TeamMember } from '@/lib/types';

const memberSchema = z.object({
  name: z.string().min(2, '姓名至少需要 2 個字元。'),
  role: z.string().min(2, '職位至少需要 2 個字元。'),
  email: z.string().email('請輸入有效的電子郵件地址。'),
  phone: z.string().min(8, '請輸入有效的電話號碼。'),
  avatarUrl: z.string().url('請輸入有效的網址。').optional().or(z.literal('')),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface CreateMemberDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (data: Omit<TeamMember, 'id'>) => Promise<boolean>;
}

export function CreateMemberDialog({ isOpen, onOpenChange, onSave }: CreateMemberDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
      avatarUrl: '',
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!isSaving) {
      onOpenChange(open);
      if (!open) {
        form.reset();
      }
    }
  }

  async function onSubmit(values: MemberFormValues) {
    setIsSaving(true);
    const memberData = {
      ...values,
      avatarUrl: values.avatarUrl || `https://placehold.co/128x128.png?text=${values.name.charAt(0)}`,
    };
    const success = await onSave(memberData);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新增團隊成員</DialogTitle>
          <DialogDescription>
            填寫以下資訊以將新成員加入您的團隊。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：陳大文" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>職位</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：專案經理" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電子郵件</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="member@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電話</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="0912-345-678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>頭像網址 (可選)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={isSaving}>取消</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? '儲存中...' : '新增成員'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

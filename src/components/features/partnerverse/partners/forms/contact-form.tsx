
'use client';

import * as React from 'react';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Contact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const contactSchema = z.object({
  name: z.string().min(2, { message: '姓名至少需要 2 個字元。' }),
  role: z.string().min(2, { message: '職位至少需要 2 個字元。' }),
  email: z.string().email({ message: '請輸入有效的電子郵件地址。' }),
  phone: z.string().min(8, { message: '請輸入有效的電話號碼。' }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (contact: Omit<Contact, 'id'>, contactId?: string) => Promise<boolean>;
  contact: Contact | null;
}

export const ContactForm: FC<ContactFormProps> = ({ isOpen, onOpenChange, onSave, contact }) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
    },
  });

  React.useEffect(() => {
    if (isOpen && contact) {
      form.reset(contact);
    } else if (isOpen && !contact) {
      form.reset({
        name: '',
        role: '',
        email: '',
        phone: '',
      });
    }
  }, [contact, isOpen, form]);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSaving(true);
    const success = await onSave(data, contact?.id);
    if(success) {
        onOpenChange(false);
    }
    setIsSaving(false);
  };
  
  const handleOpenChange = (open: boolean) => {
      if(isSaving) return;
      onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{contact ? '編輯聯絡人' : '新增聯絡人'}</DialogTitle>
          <DialogDescription>
            {contact ? '更新此聯絡人的詳細資訊。' : '輸入新聯絡人的詳細資訊。'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl><Input placeholder="例如：王大明" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="例如：專案經理" {...field} /></FormControl>
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
                  <FormControl><Input type="email" placeholder="example@company.com" {...field} /></FormControl>
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
                  <FormControl><Input type="tel" placeholder="0912-345-678" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>取消</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? "儲存中..." : "儲存"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

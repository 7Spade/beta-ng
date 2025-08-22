
'use client';

import * as React from 'react';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Partner, PartnerFlowType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const partnerSchema = z.object({
  name: z.string().min(2, { message: '合作夥伴名稱至少需要 2 個字元。' }),
  website: z.string().url({ message: '請輸入有效的網址。' }).or(z.literal('')).optional(),
  category: z.enum(['技術', '經銷商', '服務', '顧問', '下游承包商', '供應商', '設備']),
  status: z.enum(['啟用中', '停用中', '待審核']),
  overview: z.string().optional(),
  flowType: z.enum(['未配置', '純收款', '純付款', '收付款']),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (partner: Omit<Partner, 'id'>) => void;
  partner: Partner | null;
}

export const PartnerForm: FC<PartnerFormProps> = ({ isOpen, onOpenChange, onSave, partner }) => {
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      website: '',
      category: '下游承包商',
      status: '待審核',
      overview: '',
      flowType: '未配置',
    },
  });

  React.useEffect(() => {
    if (isOpen && partner) {
      form.reset({
        name: partner.name,
        website: partner.website,
        category: partner.category,
        status: partner.status,
        overview: partner.overview,
        flowType: partner.flowType || '未配置',
      });
    } else if (isOpen && !partner) {
      form.reset({
        name: '',
        website: '',
        category: '下游承包商',
        status: '待審核',
        overview: '',
        flowType: '未配置',
      });
    }
  }, [partner, isOpen, form]);

  const onSubmit = (data: PartnerFormValues) => {
    const partnerData: Omit<Partner, 'id'> = {
      ...data,
      website: data.website || '',
      overview: data.overview || '',
      logoUrl: partner?.logoUrl || `https://placehold.co/100x100.png?text=${data.name.charAt(0)}`,
      joinDate: partner?.joinDate || new Date().toISOString().split('T')[0],
      contacts: partner?.contacts || [],
      transactions: partner?.transactions || [],
      performanceReviews: partner?.performanceReviews || [],
      complianceDocuments: partner?.complianceDocuments || [],
      contracts: partner?.contracts || [],
      flowType: data.flowType,
      receivableWorkflow: partner?.receivableWorkflow || [],
      payableWorkflow: partner?.payableWorkflow || [],
    };
    onSave(partnerData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{partner ? '編輯合作夥伴' : '新增合作夥伴'}</DialogTitle>
          <DialogDescription>
            {partner ? '更新此合作夥伴的詳細資訊。' : '輸入新合作夥伴的詳細資訊。'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>廠商名稱</FormLabel>
                    <FormControl><Input placeholder="例如：xx工程" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>網站 (可選)</FormLabel>
                    <FormControl><Input placeholder="https://innovate.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>類別</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="選擇一個類別" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="下游承包商">下游承包商</SelectItem>
                        <SelectItem value="供應商">供應商</SelectItem>
                        <SelectItem value="設備">設備</SelectItem>
                        <SelectItem value="顧問">顧問</SelectItem>
                        <SelectItem value="服務">服務</SelectItem>
                        <SelectItem value="技術">技術</SelectItem>
                        <SelectItem value="經銷商">經銷商</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>狀態</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="選擇一個狀態" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="啟用中">啟用中</SelectItem>
                        <SelectItem value="停用中">停用中</SelectItem>
                        <SelectItem value="待審核">待審核</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="flowType"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>廠商類型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="選擇廠商類型" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="未配置">未配置</SelectItem>
                        <SelectItem value="純收款">純收款 (客戶)</SelectItem>
                        <SelectItem value="純付款">純付款 (供應商)</SelectItem>
                        <SelectItem value="收付款">收付款 (客戶兼供應商)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="overview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>概覽 (可選)</FormLabel>
                  <FormControl><Textarea placeholder="描述合作夥伴的業務和關係..." className="resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
              <Button type="submit">儲存合作夥伴</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

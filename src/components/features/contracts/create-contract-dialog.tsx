
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Contract } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const contractSchema = z.object({
  customId: z.string().optional(),
  name: z.string().min(3, '合約名稱至少需要 3 個字元。'),
  contractor: z.string().min(2, '承包商名稱至少需要 2 個字元。'),
  client: z.string().min(2, '客戶名稱至少需要 2 個字元。'),
  clientRepresentative: z.string().optional(),
  totalValue: z.coerce.number().min(1, '總價值至少需要為 1。'),
  scope: z.string().min(10, '工作範疇描述至少需要 10 個字元。'),
  status: z.enum(["啟用中", "已完成", "暫停中", "已終止"]),
  startDate: z.date({ required_error: '起始日期為必填項。' }),
  endDate: z.date({ required_error: '結束日期為必填項。' }),
}).refine((data) => data.endDate > data.startDate, {
  message: "結束日期不能早於起始日期。",
  path: ["endDate"],
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface CreateContractDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (data: Omit<Contract, 'id' | 'payments' | 'changeOrders' | 'versions'>) => Promise<boolean>;
}

export function CreateContractDialog({ isOpen, onOpenChange, onSave }: CreateContractDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      customId: '',
      name: '',
      contractor: '',
      client: '',
      clientRepresentative: '',
      totalValue: 0,
      scope: '',
      status: '啟用中',
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

  async function onSubmit(values: ContractFormValues) {
    setIsSaving(true);
    const success = await onSave(values);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>建立新合約</DialogTitle>
          <DialogDescription>
            請填寫以下詳細資訊以建立新的營造合約。
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
                        <FormLabel>合約名稱</FormLabel>
                        <FormControl>
                            <Input placeholder="例如：市中心辦公大樓 A 棟" {...field} />
                        </FormControl>
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
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="選擇合約狀態" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="啟用中">啟用中</SelectItem>
                                    <SelectItem value="已完成">已完成</SelectItem>
                                    <SelectItem value="暫停中">暫停中</SelectItem>
                                    <SelectItem value="已終止">已終止</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contractor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>承包商</FormLabel>
                        <FormControl>
                            <Input placeholder="您的公司名稱" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>客戶</FormLabel>
                        <FormControl>
                            <Input placeholder="客戶的公司名稱" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="clientRepresentative"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>客戶代表 (可選)</FormLabel>
                        <FormControl>
                            <Input placeholder="客戶方的聯絡人" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="totalValue"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>合約總價值</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="例如：5000000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>工作範疇</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="簡要描述合約包含的工作範疇與交付項目。"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>起始日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>選擇一個日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>結束日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>選擇一個日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={isSaving}>取消</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? '儲存中...' : '建立合約'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

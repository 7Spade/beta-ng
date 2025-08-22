'use client';

import { useState, type ChangeEvent, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2, FileUp, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeContract, type SummarizeContractInput } from '@/ai/flows/summarize-contract-flow';
import { Skeleton } from '../../ui/skeleton';

export function AiSummarizerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSummary('');
      setError('');
    }
  };

  const handleSummarize = async () => {
    if (!file) {
      setError('請先選擇一個檔案。');
      return;
    }
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const input: SummarizeContractInput = { contractDataUri: dataUri };
        const result = await summarizeContract(input);
        setSummary(result.summary);
        toast({
          title: "摘要完成",
          description: "合約已成功生成摘要。",
          action: <CheckCircle2 className="text-green-500" />,
        });
      };
      reader.onerror = () => {
        throw new Error('讀取檔案失敗。');
      };
    } catch (e: any) {
      const errorMessage = e.message || '發生未知錯誤。';
      setError(errorMessage);
       toast({
        variant: "destructive",
        title: "摘要生成失敗",
        description: errorMessage,
        action: <XCircle className="text-white" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setSummary('');
    setError('');
    setIsLoading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if(!open) {
        resetState();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Wand2 className="mr-2 h-4 w-4" />
        AI 摘要
      </Button>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI 驅動的合約摘要</DialogTitle>
          <DialogDescription>
            上傳一份合約文件，即可獲得其關鍵條款、義務和截止日期的簡潔摘要。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="contract-file">合約文件</Label>
            <div className="flex items-center gap-2">
                <Input id="contract-file" type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                {file && <span className="text-sm text-muted-foreground truncate">{file.name}</span>}
            </div>
          </div>
          {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {summary && (
            <div>
              <Label htmlFor="summary">生成的摘要</Label>
              <Textarea id="summary" value={summary} readOnly rows={10} className="mt-1 bg-secondary" />
            </div>
          )}
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              關閉
            </Button>
          </DialogClose>
          <Button onClick={handleSummarize} disabled={!file || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? '摘要中...' : '生成摘要'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

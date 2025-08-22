/**
 * @project NG-Beta Integrated Platform - 統一整合平台文檔處理頁面
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author NG-Beta Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 1.0.0
 * 
 * @fileoverview 文檔處理主頁面 - DocuParse 模組的核心功能頁面
 * @description 提供文檔上傳、AI 解析、數據提取和結果展示功能。整合了 Google Genkit AI 
 * 服務進行智能文檔分析，支援多種文檔格式的處理和工作項目提取。使用 Next.js 15 的 
 * Server Actions 和 useActionState 實現現代化的表單處理和狀態管理。
 * 
 * @tech-stack
 * - Runtime: Node.js 20+
 * - Framework: Next.js 15 (App Router)
 * - Language: TypeScript 5.0+
 * - UI: shadcn/ui + Tailwind CSS 4.0+
 * - Icons: Lucide React
 * - State: React 19 (useActionState, useTransition)
 * - AI: Google Genkit
 * - Validation: Zod
 * - Database: Firebase Firestore
 * 
 * @environment
 * - Node: >=20.0.0
 * - Package Manager: pnpm
 * - Build Tool: Turbopack
 * 
 * @features
 * - 文檔拖拽上傳功能
 * - AI 驅動的文檔解析
 * - 工作項目自動提取
 * - 實時處理狀態顯示
 * - 結果數據表格展示
 * - 支援 PDF、DOCX 等格式
 * 
 * @usage
 * 此頁面作為 DocuParse 模組的主要入口，用戶可以：
 * 1. 上傳文檔文件
 * 2. 查看 AI 解析進度
 * 3. 檢視提取的工作項目
 * 4. 編輯和管理解析結果
 */

"use client";

import { useActionState } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { UploadCloud, File, Loader2, Cpu } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { extractDataFromDocument } from "@/app/actions/documents.actions";
import { WorkItemsTable } from "@/components/documents/work-items-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const initialState = {
  data: undefined,
  error: undefined,
  fileName: undefined,
};

export default function Home() {
  const [state, formAction] = useActionState(extractDataFromDocument, initialState);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        startTransition(() => {
          formAction(formData);
        });
      }
    }
  };
  
  const handleUploadClick = () => {
    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };


  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-headline">DocuParse</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Automatically extract data from your contracts, quotes, and estimates.
          </p>
        </header>

        <Card className="w-full shadow-2xl bg-card">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Select a file to begin extraction.</CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef}>
              <div
                className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary transition-colors"
                onClick={handleUploadClick}
                onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
                role="button"
                tabIndex={0}
                aria-label="Upload document"
              >
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX, etc.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isPending}
                  accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {isPending && (
          <div className="flex flex-col items-center justify-center mt-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-foreground">Extracting data, please wait...</p>
            <p className="text-muted-foreground">This may take a few moments.</p>
          </div>
        )}

        {state.data && !isPending && (
          <div className="mt-8">
            <Card className="shadow-2xl bg-card">
              <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Extracted Work Items</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-2">
                        <File className="w-4 h-4" />
                        {state.fileName}
                        </CardDescription>
                    </div>
                    {state.data.totalTokens > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          <span>{state.data.totalTokens.toLocaleString()} tokens</span>
                      </Badge>
                    )}
                  </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="doc-id">編號</Label>
                      <Input id="doc-id" placeholder="Document ID" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-name">名稱</Label>
                      <Input id="doc-name" placeholder="Document Name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-name">客戶</Label>
                      <Input id="client-name" placeholder="Client Name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-rep">客戶代表</Label>
                      <Input id="client-rep" placeholder="Client Representative" />
                    </div>
                </div>
                <WorkItemsTable initialData={state.data.workItems} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

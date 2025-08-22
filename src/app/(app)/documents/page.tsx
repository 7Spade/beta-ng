/**
 * @project Beta-NG Integrated Platform - 統一整合平台文檔處理頁面
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author Beta-NG Development Team
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
import { useEffect, useRef, useState, useTransition, useMemo } from "react";
import { UploadCloud, File, Loader2, Cpu, FileCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Partner } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { extractDataFromDocument } from "@/app/actions/documents.actions";
import { createProjectAndContractFromDocument } from "@/app/actions/contracts.actions";
import { WorkItemsTable, type WorkItem } from "@/components/features/documents/work-items-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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
  const router = useRouter();

  // State for document details and partners
  const [partners, setPartners] = useState<Partner[]>([]);
  const [docDetails, setDocDetails] = useState({
      customId: '',
      name: '',
      client: '',
      clientRepresentative: '',
      selectedPartnerId: ''
  });
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
        try {
            const partnersCollection = collection(db, 'partners');
            const partnerSnapshot = await getDocs(partnersCollection);
            const partnerList = partnerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Partner[];
            setPartners(partnerList);
        } catch (error) {
            console.error("獲取合作夥伴時發生錯誤:", error);
            toast({ variant: 'destructive', title: '錯誤', description: '無法載入合作夥伴列表。' });
        }
    }
    fetchPartners();
  }, [toast]);
  
  const selectedPartner = useMemo(() => {
    return partners.find(p => p.id === docDetails.selectedPartnerId);
  }, [partners, docDetails.selectedPartnerId]);


  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "提取失敗",
        description: state.error,
      });
    }
    if (state.data) {
        setWorkItems(state.data.workItems);
        // Pre-fill fields
        const fileNameWithoutExt = state.fileName?.replace(/\.[^/.]+$/, "") || "";
        setDocDetails({
            customId: `DOC-${Date.now()}`,
            name: fileNameWithoutExt,
            client: '',
            clientRepresentative: '',
            selectedPartnerId: ''
        });
    }
  }, [state, toast]);

  const handleDetailChange = (key: keyof typeof docDetails, value: string) => {
      setDocDetails(prev => ({...prev, [key]: value}));
  }
  
  const handlePartnerChange = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    setDocDetails(prev => ({
        ...prev,
        selectedPartnerId: partnerId,
        client: partner?.name || '',
        // Reset representative when partner changes
        clientRepresentative: '',
    }));
  };

  const handleCreateProjectAndContract = async () => {
    if (!docDetails.name || !docDetails.client || workItems.length === 0) {
        toast({
            variant: "destructive",
            title: "缺少必要資訊",
            description: "請填寫「名稱」、「客戶」，並確保至少有一個工作項目。"
        });
        return;
    }
    setIsCreating(true);
    try {
        const result = await createProjectAndContractFromDocument({
            docDetails,
            workItems
        });
        if (result.error) {
             toast({ variant: "destructive", title: "建立失敗", description: result.error });
        } else {
             toast({ title: "成功！", description: `專案與合約 "${docDetails.name}" 已成功建立。` });
             router.push(`/projects/${result.projectId}`);
        }
    } catch (e) {
        const error = e instanceof Error ? e.message : "發生未知錯誤";
        toast({ variant: "destructive", title: "建立失敗", description: error });
    } finally {
        setIsCreating(false);
    }
  }

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
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <Card className="w-full shadow-2xl bg-card">
        <CardHeader>
          <CardTitle>上傳文件</CardTitle>
          <CardDescription>選擇一個文件以開始提取。</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef}>
            <div
              className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary transition-colors"
              onClick={handleUploadClick}
              onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
              role="button"
              tabIndex={0}
              aria-label="上傳文件"
            >
              <UploadCloud className="w-12 h-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">點擊上傳</span> 或拖放文件
              </p>
              <p className="text-xs text-muted-foreground">支援格式：PDF、DOCX 等。</p>
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
          <p className="text-lg font-medium text-foreground">正在提取資料，請稍候...</p>
          <p className="text-muted-foreground">這可能需要一些時間。</p>
        </div>
      )}

      {state.data && !isPending && (
        <div className="mt-8">
          <Card className="shadow-2xl bg-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                      <CardTitle className="text-2xl">提取的工作項目</CardTitle>
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
                    <Label htmlFor="customId">編號</Label>
                    <Input id="customId" placeholder="文件 ID" value={docDetails.customId} onChange={(e) => handleDetailChange('customId', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">名稱</Label>
                    <Input id="name" placeholder="文件名稱" value={docDetails.name} onChange={(e) => handleDetailChange('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">客戶</Label>
                    <Select value={docDetails.selectedPartnerId} onValueChange={handlePartnerChange}>
                        <SelectTrigger id="client">
                            <SelectValue placeholder="選擇一個合作夥伴" />
                        </SelectTrigger>
                        <SelectContent>
                            {partners.map(partner => (
                                <SelectItem key={partner.id} value={partner.id!}>
                                    {partner.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientRepresentative">客戶代表</Label>
                    <Select
                        value={docDetails.clientRepresentative}
                        onValueChange={(value) => handleDetailChange('clientRepresentative', value)}
                        disabled={!selectedPartner || selectedPartner.contacts.length === 0}
                    >
                        <SelectTrigger id="clientRepresentative">
                            <SelectValue placeholder={!selectedPartner ? "請先選擇客戶" : "選擇一位聯絡人"} />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedPartner?.contacts.map(contact => (
                                <SelectItem key={contact.id} value={contact.name}>
                                    {contact.name} ({contact.role})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
              </div>
              <WorkItemsTable initialData={workItems} onDataChange={setWorkItems} />
            </CardContent>
            <CardContent>
                 <Button onClick={handleCreateProjectAndContract} disabled={isCreating} className="w-full">
                     <FileCog className="mr-2 h-4 w-4" />
                     {isCreating ? "建立中..." : "建立專案與合約"}
                 </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

    
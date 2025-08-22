
'use client';

import { useState, type FC, useEffect } from 'react';
import Image from 'next/image';
import type { Partner, Contact, Contract } from '@/lib/types';
import type { Role } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Edit, Users, DollarSign, Calendar, Star, FileText, ShieldCheck, FileWarning, FileX, Briefcase, Plus, Trash2, Save, GripVertical, MoreVertical, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';


interface PartnerProfileProps {
  partner: Partner;
  onBack: () => void;
  userRole: Role;
  onEdit: (partner: Partner) => void;
  onUpdateWorkflows: (partnerId: string, receivable: string[], payable: string[]) => Promise<void>;
  onOpenContactForm: (contact: Contact | null) => void;
  onDeleteContact: (partnerId: string, contactId: string) => Promise<void>;
}

const RatingStars: FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
);

const ComplianceStatusIcon: FC<{ status: '有效' | '即將到期' | '已過期' }> = ({ status }) => {
    switch (status) {
        case '有效': return <ShieldCheck className="h-5 w-5 text-green-600" />;
        case '即將到期': return <FileWarning className="h-5 w-5 text-yellow-600" />;
        case '已過期': return <FileX className="h-5 w-5 text-red-600" />;
    }
}

const WorkflowEditor: FC<{ title: string; steps: string[]; setSteps: (steps: string[]) => void; }> = ({ title, steps, setSteps }) => {
    const handleStepChange = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
    };

    const handleAddStep = () => {
        setSteps([...steps, '新步驟']);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>定義此流程的線性步驟。您可以拖曳來重新排序。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                            <Input
                                value={step}
                                onChange={(e) => handleStepChange(index, e.target.value)}
                                placeholder={`步驟 ${index + 1}`}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveStep(index)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleAddStep}>
                    <Plus className="mr-2 h-4 w-4" />
                    新增步驟
                </Button>
            </CardContent>
        </Card>
    );
};


export const PartnerProfile: FC<PartnerProfileProps> = ({ partner, userRole, onEdit, onUpdateWorkflows, onOpenContactForm, onDeleteContact }) => {
    const [receivableWorkflow, setReceivableWorkflow] = useState(partner.receivableWorkflow || []);
    const [payableWorkflow, setPayableWorkflow] = useState(partner.payableWorkflow || []);
    const [isSaving, setIsSaving] = useState(false);
    const [relatedContracts, setRelatedContracts] = useState<Contract[]>([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            if (!partner.name) return;
            setIsLoadingContracts(true);
            try {
                const contractsRef = collection(db, "contracts");
                const q = query(contractsRef, where("client", "==", partner.name));
                const querySnapshot = await getDocs(q);
                const contractsList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        startDate: (data.startDate as Timestamp).toDate(),
                        endDate: (data.endDate as Timestamp).toDate(),
                    } as Contract;
                });
                setRelatedContracts(contractsList);
            } catch (error) {
                console.error("獲取相關合約時發生錯誤：", error);
            } finally {
                setIsLoadingContracts(false);
            }
        };

        fetchContracts();
    }, [partner.name]);


    const handleSaveChanges = async () => {
        if (!partner.id) return;
        setIsSaving(true);
        await onUpdateWorkflows(partner.id, receivableWorkflow, payableWorkflow);
        setIsSaving(false);
    };

    const statusBadgeVariant = (status: Partner['status']) => {
        switch (status) {
        case '啟用中': return 'default';
        case '停用中': return 'secondary';
        case '待審核': return 'outline';
        default: return 'default';
        }
    };
    
    const transactionStatusColor = (status: '已完成' | '待處理' | '失敗') => {
        switch (status) {
            case '已完成': return 'text-green-600';
            case '待處理': return 'text-yellow-600';
            case '失敗': return 'text-red-600';
        }
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row gap-6 items-start">
            <Image src={partner.logoUrl} alt={`${partner.name} logo`} width={80} height={80} className="rounded-lg border" data-ai-hint="logo company" />
            <div className='flex-1'>
                <div className='flex justify-between items-start'>
                    <CardTitle className="text-3xl font-bold">{partner.name}</CardTitle>
                    {userRole !== 'Viewer' && <Button variant="outline" onClick={() => onEdit(partner)}><Edit className="mr-2 h-4 w-4" /> 編輯合作夥伴</Button>}
                </div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-muted-foreground text-sm">
                    <Badge variant={statusBadgeVariant(partner.status)} className="text-sm">{partner.status}</Badge>
                    <span className="hidden md:inline">|</span>
                    <span>{partner.category}</span>
                     <span className="hidden md:inline">|</span>
                    <a href={`https://${partner.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        <Globe className="h-4 w-4" /> {partner.website}
                    </a>
                     <span className="hidden md:inline">|</span>
                     <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> 加入於 {new Date(partner.joinDate).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="mr-2 h-4 w-4" />聯絡人</TabsTrigger>
          <TabsTrigger value="financial-workflows">財務流程</TabsTrigger>
          <TabsTrigger value="performance"><Star className="mr-2 h-4 w-4" />績效</TabsTrigger>
          <TabsTrigger value="compliance"><FileText className="mr-2 h-4 w-4" />合規性</TabsTrigger>
          <TabsTrigger value="contracts"><Briefcase className="mr-2 h-4 w-4" />合約</TabsTrigger>
          <TabsTrigger value="transactions"><DollarSign className="mr-2 h-4 w-4" />交易紀錄</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6">
                <p className='text-foreground'>{partner.overview}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contacts">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>相關聯絡人</CardTitle>
                        <CardDescription>{partner.name} 的主要聯絡窗口。</CardDescription>
                    </div>
                    <Button onClick={() => onOpenContactForm(null)}>
                        <Plus className="mr-2 h-4 w-4" /> 新增聯絡人
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>姓名</TableHead>
                                <TableHead>職位</TableHead>
                                <TableHead>電子郵件</TableHead>
                                <TableHead>電話</TableHead>
                                <TableHead><span className="sr-only">操作</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partner.contacts.length > 0 ? partner.contacts.map(contact => (
                                <TableRow key={contact.id}>
                                    <TableCell className="font-medium">{contact.name}</TableCell>
                                    <TableCell>{contact.role}</TableCell>
                                    <TableCell><a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a></TableCell>
                                    <TableCell>{contact.phone}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onOpenContactForm(contact)}>
                                                    <Edit className="mr-2 h-4 w-4" /> 編輯
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                            <span className="text-destructive">刪除</span>
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>確定要刪除嗎？</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                此操作無法復原。這將永久刪除聯絡人 {contact.name}。
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>取消</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => onDeleteContact(partner.id!, contact.id)}>繼續</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                               <TableRow>
                                 <TableCell colSpan={5} className="text-center h-24">找不到聯絡人。</TableCell>
                               </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="financial-workflows">
            <div className="space-y-6">
                {(partner.flowType === '純收款' || partner.flowType === '收付款') && (
                    <WorkflowEditor title="應收款流程 (您向此廠商收款)" steps={receivableWorkflow} setSteps={setReceivableWorkflow} />
                )}
                {(partner.flowType === '純付款' || partner.flowType === '收付款') && (
                    <WorkflowEditor title="應付款流程 (您付錢給此廠商)" steps={payableWorkflow} setSteps={setPayableWorkflow} />
                )}
                {partner.flowType === '未配置' && (
                    <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                        <p>此合作夥伴尚未配置財務流程類型。</p>
                        <p className="text-sm">請先編輯此合作夥伴，並設定其廠商類型。</p>
                    </div>
                )}
                {partner.flowType !== '未配置' && (
                     <div className="flex justify-end">
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? '儲存中...' : '儲存流程'}
                        </Button>
                    </div>
                )}
            </div>
        </TabsContent>
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>績效評估</CardTitle>
              <CardDescription>{partner.name} 的績效歷史與備註。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {partner.performanceReviews.length > 0 ? partner.performanceReviews.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <RatingStars rating={review.rating} />
                    <span className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()} 由 {review.reviewer} 評分</span>
                  </div>
                  <p className="text-muted-foreground">{review.notes}</p>
                </div>
              )) : (
                 <div className="text-center text-muted-foreground py-8">找不到績效評估。</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>合規文件</CardTitle>
              <CardDescription>追蹤 {partner.name} 所需的許可證和證書。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文件</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>到期日</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partner.complianceDocuments.length > 0 ? partner.complianceDocuments.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell className="flex items-center gap-2">
                          <ComplianceStatusIcon status={doc.status} /> {doc.status}
                      </TableCell>
                      <TableCell>{new Date(doc.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                          <Button variant="link" size="sm" asChild><a href={doc.fileUrl} target="_blank">檢視</a></Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">找不到合規文件。</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>合約</CardTitle>
              <CardDescription>與 {partner.name} 相關的合約。</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingContracts ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="ml-2">正在載入合約...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>合約名稱</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>開始日期</TableHead>
                      <TableHead>結束日期</TableHead>
                      <TableHead className="text-right">總價值</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedContracts.length > 0 ? (
                      relatedContracts.map(contract => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">
                            <Link href={`/contracts`} className="hover:underline text-primary">
                                {contract.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant={contract.status === '啟用中' ? 'default' : 'secondary'}>{contract.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(contract.startDate)}</TableCell>
                          <TableCell>{formatDate(contract.endDate)}</TableCell>
                          <TableCell className="text-right">${contract.totalValue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">找不到與此夥伴相關的合約。</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
           <Card>
            <CardHeader>
              <CardTitle>交易歷史</CardTitle>
              <CardDescription>與 {partner.name} 相關的財務記錄。</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>日期</TableHead>
                            <TableHead>描述</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">金額</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partner.transactions.length > 0 ? partner.transactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{tx.description}</TableCell>
                                <TableCell className={transactionStatusColor(tx.status)}>{tx.status}</TableCell>
                                <TableCell className="text-right">${tx.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">找不到交易紀錄。</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

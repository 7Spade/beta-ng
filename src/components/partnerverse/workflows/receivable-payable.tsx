
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, Timestamp, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import type { Partner, FinancialDocument, ReceivablePayableType, Contract, Transaction } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, FileText, DollarSign, Calendar, CheckCircle, Clock, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// 流程進度組件
const WorkflowProgress: React.FC<{ document: FinancialDocument; partner: Partner | undefined }> = ({ document, partner }) => {
    const workflowSteps = document.type === 'receivable'
      ? partner?.receivableWorkflow || []
      : partner?.payableWorkflow || [];
  
    const currentStepIndex = workflowSteps.indexOf(document.currentStep);
  
    if (workflowSteps.length === 0) {
      return <p className="text-xs text-muted-foreground">此夥伴未定義流程步驟。</p>;
    }
  
    return (
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {workflowSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
  
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                  isCurrent ? 'bg-primary/20 border-primary animate-pulse' : 
                  'bg-muted border-border'
                }`}>
                  <CheckCircle className={`w-4 h-4 transition-opacity ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className={`mt-1 text-xs font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
              </div>
              {index < workflowSteps.length - 1 && (
                <div className={`mt-[-1rem] flex-1 h-0.5 transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
};

interface CreateDocumentState {
    partnerId: string;
    type: ReceivablePayableType;
    amount: string;
    description: string;
    dueDate: string;
    contractId: string;
}

export const ReceivablePayableSystem: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [documents, setDocuments] = useState<FinancialDocument[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    
    const { toast } = useToast();

    const [newDocument, setNewDocument] = useState<CreateDocumentState>({
        partnerId: '',
        type: 'receivable',
        amount: '',
        description: '',
        dueDate: '',
        contractId: '',
    });

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const partnersQuery = query(collection(db, 'partners'));
                const partnersSnapshot = await getDocs(partnersQuery);
                const partnersList = partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Partner[];
                setPartners(partnersList);
            } catch (error) {
                 console.error("獲取夥伴時發生錯誤：", error);
                 toast({ variant: 'destructive', title: '錯誤', description: '無法載入夥伴列表。' });
            }
        };

        const unsubscribeDocs = onSnapshot(query(collection(db, 'financial_documents')), (snapshot) => {
            const docsList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createDate: (data.createDate as Timestamp)?.toDate(),
                    dueDate: (data.dueDate as Timestamp)?.toDate(),
                } as FinancialDocument;
            });
            setDocuments(docsList);
            setIsLoading(false);
        }, (error) => {
            console.error("獲取財務單據時發生錯誤:", error);
            toast({ variant: 'destructive', title: '錯誤', description: '無法載入應收應付資料。' });
            setIsLoading(false);
        });

        fetchPartners();
        return () => unsubscribeDocs();
    }, [toast]);
    
     const fetchContractsForPartner = useCallback(async (partnerName: string) => {
        if (!partnerName) {
            setContracts([]);
            return;
        }
        try {
            const contractsRef = collection(db, "contracts");
            const q = query(contractsRef, where("client", "==", partnerName));
            const querySnapshot = await getDocs(q);
            const contractsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Contract[];
            setContracts(contractsList);
        } catch (error) {
            console.error("為夥伴獲取合約時發生錯誤:", error);
            setContracts([]);
        }
    }, []);

    useEffect(() => {
        const selectedPartner = partners.find(p => p.id === newDocument.partnerId);
        if (selectedPartner) {
            fetchContractsForPartner(selectedPartner.name);
        } else {
            setContracts([]);
        }
    }, [newDocument.partnerId, partners, fetchContractsForPartner]);


    const handleCreateDocument = async () => {
        if (!newDocument.partnerId || !newDocument.amount || !newDocument.dueDate || !newDocument.contractId) {
            toast({ variant: 'destructive', title: '錯誤', description: '請填寫所有必要欄位，包括關聯合約。' });
            return;
        }

        const partner = partners.find(p => p.id === newDocument.partnerId);
        if (!partner) {
            toast({ variant: 'destructive', title: '錯誤', description: '找不到選定的合作夥伴。' });
            return;
        }
        
        const contract = contracts.find(c => c.id === newDocument.contractId);
        if (!contract) {
             toast({ variant: 'destructive', title: '錯誤', description: '找不到選定的合約。' });
            return;
        }

        const workflow = newDocument.type === 'receivable' ? partner.receivableWorkflow : partner.payableWorkflow;
        if (!workflow || workflow.length === 0) {
            toast({ variant: 'destructive', title: '錯誤', description: `此夥伴尚未配置${newDocument.type === 'receivable' ? '應收款' : '應付款'}流程。` });
            return;
        }
        
        setIsCreating(true);
        try {
            const docData = {
                partnerId: newDocument.partnerId,
                partnerName: partner.name,
                contractId: newDocument.contractId,
                contractName: contract.name,
                type: newDocument.type,
                amount: parseFloat(newDocument.amount),
                description: newDocument.description,
                currentStep: workflow[0], // Start with the first step
                createDate: Timestamp.now(),
                dueDate: Timestamp.fromDate(new Date(newDocument.dueDate)),
                history: [{ step: workflow[0], date: Timestamp.now(), user: "system" }]
            };

            await addDoc(collection(db, 'financial_documents'), docData);

            toast({ title: '成功', description: '單據已成功建立。' });
            setShowCreateDialog(false);
            setNewDocument({ partnerId: '', type: 'receivable', amount: '', description: '', dueDate: '', contractId: '' });
        } catch (error) {
            console.error("建立單據時發生錯誤：", error);
            toast({ variant: 'destructive', title: '錯誤', description: '建立單據失敗。' });
        } finally {
            setIsCreating(false);
        }
    };
    
    const handleNextStep = async (docId: string) => {
        const documentData = documents.find(d => d.id === docId);
        if (!documentData) return;
    
        const partner = partners.find(p => p.id === documentData.partnerId);
        if (!partner || !partner.id) return;
    
        const workflow = documentData.type === 'receivable' ? partner.receivableWorkflow : partner.payableWorkflow;
        if (!workflow || workflow.length === 0) return;
    
        const currentStepIndex = workflow.indexOf(documentData.currentStep);
    
        if (currentStepIndex >= workflow.length - 1) {
            toast({ variant: 'default', title: '流程完成', description: `單據 #${documentData.id.substring(0,5)} 已在最終步驟。`});
            return;
        }
    
        const nextStep = workflow[currentStepIndex + 1];
        const docRef = doc(db, 'financial_documents', docId);
    
        const newHistoryEntry = { step: nextStep, date: Timestamp.now(), user: "system" };
        const updatedHistory = [...(documentData.history || []), newHistoryEntry];
    
        try {
            // Check if it's the final step to create a transaction
            if (currentStepIndex + 1 === workflow.length - 1) {
                const partnerRef = doc(db, 'partners', partner.id);
                
                // Atomically update partner's transactions
                const partnerSnap = await getDoc(partnerRef);
                if (!partnerSnap.exists()) throw new Error("找不到合作夥伴資料。");

                const currentPartnerData = partnerSnap.data() as Partner;
                const newTransaction: Transaction = {
                    id: `txn-${Date.now()}`,
                    date: new Date().toISOString(),
                    amount: documentData.amount,
                    status: '已完成',
                    description: `${documentData.type === 'receivable' ? '應收款' : '應付款'}單據 #${documentData.id.substring(0, 5)} - ${documentData.description}`
                };
    
                const updatedTransactions = [...(currentPartnerData.transactions || []), newTransaction];
    
                await updateDoc(partnerRef, {
                    transactions: updatedTransactions
                });
    
                toast({ title: "交易已記錄", description: `一筆新的交易已新增至 ${partner.name} 的紀錄中。` });
            }

            // Update the document step regardless
             await updateDoc(docRef, {
                currentStep: nextStep,
                history: updatedHistory,
            });

            if (currentStepIndex + 1 < workflow.length - 1) {
                toast({ title: "流程更新", description: `單據 #${documentData.id.substring(0,5)} 已移至下一步驟: ${nextStep}` });
            }

        } catch (error) {
            console.error("更新單據或交易時發生錯誤:", error);
            toast({ variant: 'destructive', title: '錯誤', description: '更新流程失敗。' });
        }
    };

    const getPartnerName = (partnerId: string) => partners.find(p => p.id === partnerId)?.name || '未知夥伴';
    
    const LoadingState = () => (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">應收應付系統</h1>
                    <p className="text-muted-foreground">管理、追蹤並推進您的所有財務單據。</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} disabled={isLoading}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    新增單據
                </Button>
            </div>

            {isLoading ? <LoadingState /> : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {documents.map(doc => {
                        const partner = partners.find(p => p.id === doc.partnerId);
                        const isFinalStep = partner && (doc.type === 'receivable' ? partner.receivableWorkflow : partner.payableWorkflow).slice(-1)[0] === doc.currentStep;
                        return (
                            <Card key={doc.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{doc.partnerName}</CardTitle>
                                            <CardDescription>單據 #{doc.id.substring(0,5)}...</CardDescription>
                                        </div>
                                        <Badge variant={doc.type === 'receivable' ? 'default' : 'secondary'}>
                                            {doc.type === 'receivable' ? '應收' : '應付'}
                                        </Badge>
                                    </div>
                                     <div className="flex items-center text-2xl font-bold pt-2">
                                        <DollarSign className="h-6 w-6 mr-2 text-muted-foreground" />
                                        {doc.amount.toLocaleString()}
                                    </div>
                                    {doc.contractName && (
                                       <Link href={`/contracts`} className="text-sm text-primary hover:underline flex items-center gap-1">
                                          <Briefcase className="h-4 w-4" /> {doc.contractName}
                                       </Link>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                     <WorkflowProgress document={doc} partner={partner} />
                                     <div className="text-xs text-muted-foreground space-y-1">
                                        <p>建立日期: {formatDate(doc.createDate)}</p>
                                        <p>到期日期: {formatDate(doc.dueDate)}</p>
                                        {doc.description && <p>備註: {doc.description}</p>}
                                     </div>
                                </CardContent>
                                <CardContent>
                                     <Button className="w-full" onClick={() => handleNextStep(doc.id)} disabled={isFinalStep}>
                                        {isFinalStep ? '流程已完成' : '推進至下一步'}
                                     </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                     {documents.length === 0 && (
                        <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">尚無單據</h3>
                            <p className="mt-1 text-sm text-muted-foreground">點擊「新增單據」以開始。</p>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>建立新單據</DialogTitle>
                        <DialogDescription>填寫以下資訊以建立新的應收或應付單據。</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">合作夥伴</label>
                            <Select value={newDocument.partnerId} onValueChange={(value) => setNewDocument({...newDocument, partnerId: value, contractId: ''})}>
                                <SelectTrigger><SelectValue placeholder="選擇一個合作夥伴" /></SelectTrigger>
                                <SelectContent>
                                    {partners.map(p => (
                                        <SelectItem key={p.id} value={p.id!}>{p.name} ({p.flowType})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                             <label className="text-sm font-medium">關聯合約</label>
                             <Select value={newDocument.contractId} onValueChange={(value) => setNewDocument({...newDocument, contractId: value})} disabled={!newDocument.partnerId || contracts.length === 0}>
                                <SelectTrigger><SelectValue placeholder={!newDocument.partnerId ? "請先選擇合作夥伴" : "選擇一份合約"} /></SelectTrigger>
                                <SelectContent>
                                    {contracts.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {newDocument.partnerId && contracts.length === 0 && <p className="text-xs text-muted-foreground mt-1">這位夥伴沒有關聯合約。</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium">單據類型</label>
                            <Select value={newDocument.type} onValueChange={(value) => setNewDocument({...newDocument, type: value as ReceivablePayableType})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="receivable">應收款</SelectItem>
                                    <SelectItem value="payable">應付款</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <label className="text-sm font-medium">金額</label>
                            <Input type="number" placeholder="輸入金額" value={newDocument.amount} onChange={(e) => setNewDocument({...newDocument, amount: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">到期日</label>
                            <Input type="date" value={newDocument.dueDate} onChange={(e) => setNewDocument({...newDocument, dueDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">備註 (可選)</label>
                            <Textarea placeholder="輸入單據相關備註..." value={newDocument.description} onChange={(e) => setNewDocument({...newDocument, description: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
                        <Button onClick={handleCreateDocument} disabled={isCreating}>{isCreating ? '建立中...' : '建立單據'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

    
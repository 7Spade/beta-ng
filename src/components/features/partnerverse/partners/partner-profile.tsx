
'use client';

import { useState, type FC } from 'react';
import Image from 'next/image';
import type { Partner, Contact } from '@/lib/types';
import type { Role } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Edit, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ContactsTab } from './profile-tabs/contacts-tab';
import { FinancialWorkflowsTab } from './profile-tabs/financial-workflows-tab';
import { PerformanceTab } from './profile-tabs/performance-tab';
import { ComplianceTab } from './profile-tabs/compliance-tab';
import { ContractsTab } from './profile-tabs/contracts-tab';
import { TransactionsTab } from './profile-tabs/transactions-tab';

interface PartnerProfileProps {
  partner: Partner;
  onBack: () => void;
  userRole: Role;
  onEdit: (partner: Partner) => void;
  onUpdateWorkflows: (partnerId: string, receivable: string[], payable: string[]) => Promise<void>;
  onOpenContactForm: (contact: Contact | null) => void;
  onDeleteContact: (partnerId: string, contactId: string) => Promise<void>;
}

export const PartnerProfile: FC<PartnerProfileProps> = ({ 
    partner, 
    userRole, 
    onBack, 
    onEdit, 
    onUpdateWorkflows, 
    onOpenContactForm, 
    onDeleteContact 
}) => {
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSaveChanges = async (receivableWorkflow: string[], payableWorkflow: string[]) => {
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

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回夥伴列表
        </Button>
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
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="contacts">聯絡人</TabsTrigger>
          <TabsTrigger value="financial-workflows">財務流程</TabsTrigger>
          <TabsTrigger value="performance">績效</TabsTrigger>
          <TabsTrigger value="compliance">合規性</TabsTrigger>
          <TabsTrigger value="contracts">合約</TabsTrigger>
          <TabsTrigger value="transactions">交易紀錄</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6">
                <p className='text-foreground'>{partner.overview}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contacts">
            <ContactsTab 
                partner={partner} 
                onOpenContactForm={onOpenContactForm}
                onDeleteContact={onDeleteContact}
            />
        </TabsContent>
         <TabsContent value="financial-workflows">
            <FinancialWorkflowsTab 
                partner={partner}
                isSaving={isSaving}
                onSaveChanges={handleSaveChanges}
            />
        </TabsContent>
        <TabsContent value="performance">
            <PerformanceTab partner={partner} />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceTab partner={partner} />
        </TabsContent>
         <TabsContent value="contracts">
          <ContractsTab partnerName={partner.name} />
        </TabsContent>
        <TabsContent value="transactions">
           <TransactionsTab partner={partner} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

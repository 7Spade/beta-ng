
'use client';

import type { FC } from 'react';
import React, { useState } from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';


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


interface FinancialWorkflowsTabProps {
    partner: Partner;
    isSaving: boolean;
    onSaveChanges: (receivableWorkflow: string[], payableWorkflow: string[]) => void;
}

export const FinancialWorkflowsTab: FC<FinancialWorkflowsTabProps> = ({ partner, isSaving, onSaveChanges }) => {
    const [receivableWorkflow, setReceivableWorkflow] = useState(partner.receivableWorkflow || []);
    const [payableWorkflow, setPayableWorkflow] = useState(partner.payableWorkflow || []);

    const handleSave = () => {
        onSaveChanges(receivableWorkflow, payableWorkflow);
    }
    
    return (
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
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? '儲存中...' : '儲存流程'}
                    </Button>
                </div>
            )}
        </div>
    );
};

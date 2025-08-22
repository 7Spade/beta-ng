'use client';

import { useState, type FC } from 'react';
import { suggestWorkflowOptimizations, type SuggestWorkflowOptimizationsInput, type SuggestWorkflowOptimizationsOutput } from '@/ai/flows/workflow-optimization-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Lightbulb, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const OptimizationAssistant: FC = () => {
  const [formData, setFormData] = useState<SuggestWorkflowOptimizationsInput>({
    historicalTransactionData: '',
    currentWorkflowDefinition: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestWorkflowOptimizationsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const optimizationResult = await suggestWorkflowOptimizations(formData);
      setResult(optimizationResult);
    } catch (err) {
      setError('取得建議失敗，請再試一次。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>AI 優化助理</CardTitle>
          <CardDescription>提供資料以取得 AI 驅動的工作流程優化建議。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="historicalData">歷史交易資料</Label>
              <Textarea
                id="historicalData"
                placeholder="貼上或描述歷史交易資料，包括時間、合作夥伴績效等。"
                className="min-h-[150px]"
                value={formData.historicalTransactionData}
                onChange={(e) => setFormData({ ...formData, historicalTransactionData: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentWorkflow">目前工作流程定義</Label>
              <Textarea
                id="currentWorkflow"
                placeholder="從頭到尾描述您目前的工作流程。"
                className="min-h-[150px]"
                value={formData.currentWorkflowDefinition}
                onChange={(e) => setFormData({ ...formData, currentWorkflowDefinition: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Wand2 className="mr-2 h-4 w-4" />
              {loading ? '分析中...' : '建議優化'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="lg:col-span-1">
        {loading && <LoadingSkeleton />}
        {error && (
            <Card className="border-destructive">
                <CardHeader className="flex-row items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-destructive">錯誤</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )}
        {result && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex-row items-center gap-3 space-y-0">
                         <Lightbulb className="h-6 w-6 text-primary" />
                         <CardTitle>建議的優化</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{result.suggestedOptimizations}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center gap-3 space-y-0">
                         <TrendingUp className="h-6 w-6 text-green-600" />
                         <CardTitle>預測效率提升</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">{result.predictedEfficiencyIncrease}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center gap-3 space-y-0">
                         <CheckCircle className="h-6 w-6 text-muted-foreground" />
                         <CardTitle>理由</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-muted-foreground">{result.rationale}</p>
                    </CardContent>
                </Card>
            </div>
        )}
         {!loading && !result && !error && (
            <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed p-8">
                <div className="text-center">
                    <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">準備好接收建議了嗎？</h3>
                    <p className="mt-1 text-sm text-muted-foreground">填寫表單以開始。</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

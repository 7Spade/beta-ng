'use client';

import { useState, type FC, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Workflow, WorkflowNode, WorkflowEdge, Partner } from '@/lib/types';
import { GitBranch, CheckCircle, PlayCircle, StopCircle, Bot, ArrowLeftRight, PlusCircle, Save, Pencil, Trash2 } from 'lucide-react';
import { OptimizationAssistant } from './optimization-assistant';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '../../../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../../../ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../ui/alert-dialog';


const nodeIcons = {
  start: <PlayCircle className="h-5 w-5 mr-2 text-green-500" />,
  end: <StopCircle className="h-5 w-5 mr-2 text-red-500" />,
  task: <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />,
  decision: <GitBranch className="h-5 w-5 mr-2 text-yellow-500" />,
};

const Node: FC<{ node: WorkflowNode; onDoubleClick: (node: WorkflowNode) => void; onDragStart: (e: React.MouseEvent, nodeId: string) => void; }> = ({ node, onDoubleClick, onDragStart }) => (
  <div
    className="absolute bg-card border rounded-lg shadow-md p-3 flex items-center group cursor-grab active:cursor-grabbing hover:shadow-xl hover:border-primary transition-all"
    style={{ left: node.position.x, top: node.position.y, width: 200 }}
    onDoubleClick={() => onDoubleClick(node)}
    onMouseDown={(e) => onDragStart(e, node.id)}
  >
    {nodeIcons[node.type]}
    <span className="font-medium flex-1 pointer-events-none">{node.label}</span>
    <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </div>
);

const Edge: FC<{ edge: WorkflowEdge; nodes: WorkflowNode[] }> = ({ edge, nodes }) => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  if (!sourceNode || !targetNode) return null;

  const startX = sourceNode.position.x + 200;
  const startY = sourceNode.position.y + 28;
  const endX = targetNode.position.x;
  const endY = targetNode.position.y + 28;
  const midX = startX + (endX - startX) / 2;
  const midY = startY + (endY - startY) / 2;

  return (
    <g>
      <path
        d={`M ${startX} ${startY} L ${endX} ${endY}`}
        stroke="hsl(var(--border))"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      {edge.label && (
        <foreignObject x={midX-30} y={midY-20} width="60" height="40">
            <div className="bg-background px-2 py-1 text-xs rounded-md border text-center text-muted-foreground">
                {edge.label}
            </div>
        </foreignObject>
      )}
    </g>
  );
};


interface WorkflowBuilderProps {
  partners: Partner[];
}

export const WorkflowBuilder: FC<WorkflowBuilderProps> = ({ partners }) => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [nodeToEdit, setNodeToEdit] = useState<WorkflowNode | null>(null);
    const [isNodeFormOpen, setIsNodeFormOpen] = useState(false);
    const { toast } = useToast();
    
    const dragInfo = useRef<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const fetchWorkflows = useCallback(async () => {
      setIsLoading(true);
      const workflowsCollection = collection(db, 'workflows');
      const workflowSnapshot = await getDocs(workflowsCollection);
      const workflowList = workflowSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Workflow[];
      setWorkflows(workflowList);

      if(workflowList.length > 0) {
        setSelectedWorkflow(workflowList[0]);
      }
      setIsLoading(false);
    }, []);

    useEffect(() => {
      fetchWorkflows();
    }, [fetchWorkflows]);
    
    const handleSelectWorkflow = (workflowId: string) => {
        const workflow = workflows.find(w => w.id === workflowId);
        setSelectedWorkflow(workflow || null);
    }
    
    const handleUpdateWorkflowDetails = (key: 'name' | 'partnerId', value: string) => {
        if (!selectedWorkflow) return;
        const finalValue = key === 'partnerId' && value === 'none' ? undefined : value;
        setSelectedWorkflow({ ...selectedWorkflow, [key]: finalValue });
    }

    const handleSaveWorkflow = async () => {
        if(!selectedWorkflow || !selectedWorkflow.id) return;
        try {
            const { id, ...workflowData } = selectedWorkflow;
            const workflowRef = doc(db, 'workflows', id);
            await setDoc(workflowRef, workflowData, { merge: true });
            setWorkflows(workflows.map(w => w.id === id ? selectedWorkflow : w));
            toast({ title: "流程已儲存", description: `流程 "${selectedWorkflow.name}" 已更新。` });
        } catch (error) {
            console.error("儲存流程時發生錯誤：", error);
            toast({ title: "錯誤", description: "儲存流程失敗。", variant: "destructive" });
        }
    }

    const handleNewWorkflow = async () => {
        const newWorkflow: Omit<Workflow, 'id'> = {
            name: `新流程 ${workflows.length + 1}`,
            nodes: [
                { id: 'n1', type: 'start', label: '開始', position: { x: 50, y: 200 } },
                { id: 'n2', type: 'end', label: '結束', position: { x: 450, y: 200 } },
            ],
            edges: [
                 { id: 'e1-2', source: 'n1', target: 'n2' },
            ]
        };
        try {
            const docRef = await addDoc(collection(db, 'workflows'), newWorkflow);
            const newWorkflowWithId = { ...newWorkflow, id: docRef.id };
            setWorkflows([...workflows, newWorkflowWithId]);
            setSelectedWorkflow(newWorkflowWithId);
            toast({ title: "流程已建立", description: `成功建立 "${newWorkflow.name}"。`});
        } catch(error) {
            console.error("建立新流程時發生錯誤：", error);
            toast({ title: "錯誤", description: "建立流程失敗。", variant: "destructive" });
        }
    }
    
    const handleSelectNodeToEdit = (node: WorkflowNode) => {
        setNodeToEdit(node);
        setIsNodeFormOpen(true);
    }

    const handleUpdateNodeAndEdges = (newLabel: string, newEdgeTarget: string, newEdgeLabel: string) => {
        if (!selectedWorkflow || !nodeToEdit) return;

        let updatedEdges = selectedWorkflow.edges;
        if (newEdgeTarget) {
            const newEdge: WorkflowEdge = {
                id: `e-${nodeToEdit.id}-${newEdgeTarget}`,
                source: nodeToEdit.id,
                target: newEdgeTarget,
                label: newEdgeLabel
            };
            if (!updatedEdges.some(e => e.id === newEdge.id)) {
                updatedEdges = [...updatedEdges, newEdge];
            }
        }

        const updatedNodes = selectedWorkflow.nodes.map(n => 
            n.id === nodeToEdit.id ? { ...n, label: newLabel } : n
        );
        
        setSelectedWorkflow({ ...selectedWorkflow, nodes: updatedNodes, edges: updatedEdges });
        setIsNodeFormOpen(false);
        setNodeToEdit(null);
    }
    
    const handleDragStart = (e: React.MouseEvent, nodeId: string) => {
        if (!selectedWorkflow || !canvasRef.current) return;
        const node = selectedWorkflow.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        dragInfo.current = {
            nodeId,
            offsetX: e.clientX - canvasRect.left - node.position.x,
            offsetY: e.clientY - canvasRect.top - node.position.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragInfo.current || !selectedWorkflow || !canvasRef.current) return;
        
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const newX = e.clientX - canvasRect.left - dragInfo.current.offsetX;
        const newY = e.clientY - canvasRect.top - dragInfo.current.offsetY;

        const updatedNodes = selectedWorkflow.nodes.map(n => 
            n.id === dragInfo.current?.nodeId ? { ...n, position: { x: newX, y: newY } } : n
        );
        
        setSelectedWorkflow({ ...selectedWorkflow, nodes: updatedNodes });
    };

    const handleMouseUp = () => {
        dragInfo.current = null;
    };
    
    const nodeTypes = [
        { type: 'task', label: '任務', icon: <CheckCircle className="h-5 w-5 mr-2 text-blue-500" /> },
        { type: 'decision', label: '決策', icon: <GitBranch className="h-5 w-5 mr-2 text-yellow-500" /> },
    ];

    const handleAddNode = (type: 'task' | 'decision') => {
      if (!selectedWorkflow) return;
      const newNodeId = `n${selectedWorkflow.nodes.length + 1}`;
      const newNode: WorkflowNode = {
        id: newNodeId,
        type: type,
        label: `新${type === 'task' ? '任務' : '決策'}`,
        position: { x: 100, y: 100 + selectedWorkflow.nodes.length * 20 }
      };
      const updatedNodes = [...selectedWorkflow.nodes, newNode];
      setSelectedWorkflow({...selectedWorkflow, nodes: updatedNodes});
    }

    const handleDeleteNode = () => {
        if (!selectedWorkflow || !nodeToEdit) return;

        const updatedNodes = selectedWorkflow.nodes.filter(n => n.id !== nodeToEdit.id);
        const updatedEdges = selectedWorkflow.edges.filter(e => e.source !== nodeToEdit.id && e.target !== nodeToEdit.id);

        setSelectedWorkflow({
            ...selectedWorkflow,
            nodes: updatedNodes,
            edges: updatedEdges,
        });

        setIsNodeFormOpen(false);
        setNodeToEdit(null);
        toast({ title: "節點已刪除", description: `節點 "${nodeToEdit.label}" 已被移除。`});
    }


  return (
    <div className="space-y-6">
       <div>
            <h2 className="text-3xl font-bold tracking-tight">應收應付流程</h2>
            <p className="text-muted-foreground">設計、視覺化並優化與合作夥伴之間的應收與應付流程。</p>
        </div>
      <Tabs defaultValue="builder">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder"><ArrowLeftRight className="mr-2 h-4 w-4"/>視覺化流程建立器</TabsTrigger>
          <TabsTrigger value="optimizer"><Bot className="mr-2 h-4 w-4" />AI 優化助理</TabsTrigger>
        </TabsList>
        <TabsContent value="builder">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>流程</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {isLoading ? <Skeleton className="h-10 w-full" /> : (
                                <Select onValueChange={handleSelectWorkflow} value={selectedWorkflow?.id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="選擇一個流程" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workflows.map(w => <SelectItem key={w.id} value={w.id!}>{w.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                            <Button className='w-full' onClick={handleNewWorkflow} disabled={isLoading}><PlusCircle className='mr-2 h-4 w-4' /> 新增流程</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>詳細資訊</CardTitle>
                             <CardDescription>指派並管理此流程。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="workflow-name">流程名稱</Label>
                                <Input 
                                    id="workflow-name" 
                                    value={selectedWorkflow?.name || ''}
                                    onChange={(e) => handleUpdateWorkflowDetails('name', e.target.value)}
                                    disabled={!selectedWorkflow}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assign-partner">指派給合作夥伴</Label>
                                <Select 
                                    value={selectedWorkflow?.partnerId || 'none'} 
                                    onValueChange={(value) => handleUpdateWorkflowDetails('partnerId', value)}
                                    disabled={!selectedWorkflow || isLoading}
                                >
                                    <SelectTrigger id="assign-partner">
                                        <SelectValue placeholder="選擇一個合作夥伴" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">無</SelectItem>
                                        {partners.filter(p => p.id).map(p => <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>控制項</CardTitle>
                            <CardDescription>將元素新增至您的流程。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {nodeTypes.map(node => (
                                <Button key={node.type} variant="outline" className="w-full justify-start" onClick={() => handleAddNode(node.type as 'task' | 'decision')}>
                                    {node.icon} {node.label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                             {isLoading ? <Skeleton className="h-8 w-1/2" /> : (
                               <div className="flex justify-between items-center">
                                 <CardTitle>{selectedWorkflow?.name || "未選擇流程"}</CardTitle>
                                 <Button onClick={handleSaveWorkflow} disabled={!selectedWorkflow}>
                                     <Save className="mr-2 h-4 w-4" /> 儲存變更
                                 </Button>
                               </div>
                            )}
                            <CardDescription>流程的視覺化表示。雙擊節點以進行編輯。</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div 
                            ref={canvasRef}
                            className="relative w-full h-[600px] bg-muted/30 rounded-lg border-2 border-dashed overflow-auto"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {isLoading ? <div className='flex items-center justify-center h-full'><p>正在載入流程...</p></div> : (
                               <>
                                {selectedWorkflow ? (
                                    <>
                                    <svg width="1200" height="800" className="absolute top-0 left-0 pointer-events-none">
                                        <defs>
                                        <marker
                                            id="arrowhead"
                                            markerWidth="10"
                                            markerHeight="7"
                                            refX="0"
                                            refY="3.5"
                                            orient="auto"
                                        >
                                            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--border))" />
                                        </marker>
                                        </defs>
                                        {selectedWorkflow.edges.map(edge => <Edge key={edge.id} edge={edge} nodes={selectedWorkflow.nodes} />)}
                                    </svg>
                                    {selectedWorkflow.nodes.map(node => <Node key={node.id} node={node} onDoubleClick={handleSelectNodeToEdit} onDragStart={handleDragStart} />)}
                                    </>
                                ) : (
                                    <div className='flex items-center justify-center h-full'>
                                        <div className='text-center text-muted-foreground'>
                                            <ArrowLeftRight className="mx-auto h-12 w-12" />
                                            <p className='mt-4'>未選擇流程。</p>
                                            <p className='text-sm'>建立新流程或選擇一個以開始。</p>
                                        </div>
                                    </div>
                                )}
                               </>
                            )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
        <TabsContent value="optimizer">
          <OptimizationAssistant />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isNodeFormOpen} onOpenChange={setIsNodeFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>編輯節點</DialogTitle>
                <DialogDescription>更新此流程節點的詳細資訊並建立新連線。</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const label = formData.get('label') as string;
                const edgeTarget = formData.get('edge-target') as string;
                const edgeLabel = formData.get('edge-label') as string;
                handleUpdateNodeAndEdges(label, edgeTarget, edgeLabel);
            }}>
                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor="node-label">節點標籤</Label>
                        <Input id="node-label" name="label" defaultValue={nodeToEdit?.label} />
                    </div>
                     <Separator />
                    <div className="space-y-2">
                        <Label>建立新連線 (Edge)</Label>
                        <p className="text-sm text-muted-foreground">
                            從此節點 (<span className="font-semibold text-primary">{nodeToEdit?.label}</span>) 建立一個連到另一個節點的連結。
                        </p>
                    </div>
                     <div className='space-y-2'>
                        <Label htmlFor="edge-target">目標節點</Label>
                         <Select name="edge-target">
                            <SelectTrigger id="edge-target">
                                <SelectValue placeholder="選擇目標節點" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedWorkflow?.nodes.filter(n => n.id !== nodeToEdit?.id).map(n => (
                                    <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className='space-y-2'>
                        <Label htmlFor="edge-label">連線標籤 (可選)</Label>
                        <Input id="edge-label" name="edge-label" placeholder="例如：'通過', '失敗', '已核准'"/>
                    </div>
                </div>
                <DialogFooter className="justify-between">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                刪除節點
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>您確定嗎？</AlertDialogTitle>
                            <AlertDialogDescription>
                                此操作無法復原。這將永久刪除該節點及其所有連線。
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteNode}>繼續</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsNodeFormOpen(false)}>取消</Button>
                        <Button type="submit">儲存變更</Button>
                    </div>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { KnowledgeBaseEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { handleSaveKnowledgeBaseEntry } from '@/app/actions/knowledge.actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EntryFormDialog } from '@/components/features/team/knowledge-base/entry-form-dialog';
import { Badge } from '@/components/ui/badge';

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<KnowledgeBaseEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'knowledgeBaseEntries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as KnowledgeBaseEntry[];
      setEntries(entriesData);
      setLoading(false);
    }, (error) => {
      console.error("獲取工法庫時發生錯誤：", error);
      toast({ title: "錯誤", description: "無法載入工法工序庫資料。", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleOpenForm = (entry: KnowledgeBaseEntry | null) => {
    setEntryToEdit(entry);
    setFormOpen(true);
  };
  
  const handleSave = async (data: Omit<KnowledgeBaseEntry, 'id' | 'createdAt' | 'updatedAt'>, entryId?: string) => {
    const result = await handleSaveKnowledgeBaseEntry(data, entryId);
    if (result.error) {
        toast({ title: "錯誤", description: result.error, variant: "destructive" });
        return false;
    } else {
        toast({ title: result.message });
        return true;
    }
  };

  const categories = useMemo(() => {
    const allCategories = entries.map(e => e.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
        const searchMatch = searchTerm === '' ||
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const categoryMatch = categoryFilter === 'All' || entry.category === categoryFilter;

        return searchMatch && categoryMatch;
    });
  }, [entries, searchTerm, categoryFilter]);


  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">工法工序庫</h1>
                <p className="text-muted-foreground">搜尋、管理並建立標準化的工作方法與順序。</p>
            </div>
            <Button onClick={() => handleOpenForm(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                新增工法
            </Button>
        </div>
        
        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="搜尋標題、內容或標籤..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="篩選分類" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat === 'All' ? '所有分類' : cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

        {loading ? <LoadingSkeleton /> : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEntries.map(entry => (
                    <Card key={entry.id} className="flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenForm(entry)}>
                        <CardHeader>
                            <CardTitle>{entry.title}</CardTitle>
                            <CardDescription>{entry.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                            {entry.tags && entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {entry.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {filteredEntries.length === 0 && !loading && (
                     <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-medium">找不到結果</h3>
                        <p className="text-sm text-muted-foreground">嘗試調整您的搜尋或篩選條件，或建立一個新的工法。</p>
                    </div>
                )}
            </div>
        )}
      </div>

      <EntryFormDialog
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        entry={entryToEdit}
      />
    </>
  );
}

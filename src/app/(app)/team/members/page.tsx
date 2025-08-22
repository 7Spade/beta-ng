
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import type { TeamMember } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, PlusCircle } from 'lucide-react';
import { CreateMemberDialog } from '@/components/features/team/members/create-member-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'teamMembers'), (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[];
      setMembers(membersData);
      setLoading(false);
    }, (error) => {
      console.error("獲取團隊成員時發生錯誤：", error);
      toast({ title: "錯誤", description: "無法載入團隊成員資料。", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddMember = async (memberData: Omit<TeamMember, 'id'>) => {
    try {
      await addDoc(collection(db, 'teamMembers'), memberData);
      toast({ title: "成員已新增", description: `${memberData.name} 已成功加入團隊。` });
      setDialogOpen(false);
      return true;
    } catch (error) {
      console.error("新增成員時發生錯誤：", error);
      toast({ title: "錯誤", description: "新增成員失敗。", variant: "destructive" });
      return false;
    }
  };
  
  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
             <Skeleton className="h-5 w-full" />
             <Skeleton className="h-5 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">同伴列表</h1>
            <p className="text-muted-foreground">管理您的內部團隊成員。</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新增同伴
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : members.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">尚無團隊成員</h2>
            <p className="text-muted-foreground mt-2">點擊「新增同伴」以建立您的團隊列表。</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <Card key={member.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person face" />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm pt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${member.email}`} className="hover:text-primary truncate">{member.email}</a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateMemberDialog 
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddMember}
      />
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Skill } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SkillFormDialog } from './skill-form-dialog';

export function SkillsList() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'skills'), (snapshot) => {
      const skillsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Skill[];
      setSkills(skillsData.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    }, (error) => {
      console.error("獲取技能時發生錯誤：", error);
      toast({ title: "錯誤", description: "無法載入技能清單。", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleOpenForm = (skill: Skill | null) => {
    setSkillToEdit(skill);
    setFormOpen(true);
  };
  
  const handleSaveSkill = async (skillData: Omit<Skill, 'id'>, skillId?: string) => {
    try {
      if (skillId) {
        // Update existing skill
        const skillRef = doc(db, 'skills', skillId);
        await setDoc(skillRef, skillData, { merge: true });
        toast({ title: "技能已更新", description: `技能 "${skillData.name}" 已成功更新。` });
      } else {
        // Add new skill
        await addDoc(collection(db, 'skills'), skillData);
        toast({ title: "技能已新增", description: `已成功新增技能 "${skillData.name}"。` });
      }
      return true;
    } catch (error) {
      console.error("儲存技能時發生錯誤：", error);
      toast({ title: "錯誤", description: "儲存技能失敗。", variant: "destructive" });
      return false;
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await deleteDoc(doc(db, 'skills', skillId));
      toast({ title: "技能已刪除", description: "該技能已成功從清單中移除。" });
    } catch (error) {
      console.error("刪除技能時發生錯誤：", error);
      toast({ title: "錯誤", description: "刪除技能失敗。", variant: "destructive" });
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-9 w-9" />
                    </div>
                </div>
            </Card>
        ))}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>所有技能</CardTitle>
              <CardDescription>點擊技能以編輯，或新增一個新技能。</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                新增技能
            </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : skills.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-medium">尚無技能</h3>
                <p className="text-sm text-muted-foreground">點擊「新增技能」以建立您的技能資料庫。</p>
            </div>
          ) : (
            <div className="space-y-3">
              {skills.map((skill) => (
                <Card key={skill.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{skill.name}</h4>
                      <p className="text-sm text-muted-foreground">{skill.description || '沒有提供描述。'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenForm(skill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>確定要刪除「{skill.name}」嗎？</AlertDialogTitle>
                                <AlertDialogDescription>
                                    此操作無法復原。這將永久刪除此技能，並可能影響已關聯此技能的團隊成員。
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)}>繼續刪除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SkillFormDialog
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveSkill}
        skill={skillToEdit}
      />
    </>
  );
}

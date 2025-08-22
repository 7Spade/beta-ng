
'use client';

import { SkillsList } from '@/components/features/team/skills/skills-list';

export default function TeamSkillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">技能清單</h1>
        <p className="text-muted-foreground">管理團隊成員所需的所有技能，為 AI 排班做準備。</p>
      </div>
      <SkillsList />
    </div>
  );
}

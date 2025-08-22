
'use client';

import { useState, useMemo, type FC } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Partner } from '@/lib/types';
import type { Role } from '@/lib/roles';
import { Button } from '../../ui/button';
import { Plus, Search } from 'lucide-react';

interface PartnerListProps {
  partners: Partner[];
  onSelectPartner: (partnerId: string) => void;
  userRole: Role;
  onAddPartner: () => void;
}

export const PartnerList: FC<PartnerListProps> = ({ partners, onSelectPartner, userRole, onAddPartner }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const searchMatch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (partner.overview || '').toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'All' || partner.status === statusFilter;
      const categoryMatch = categoryFilter === 'All' || partner.category === categoryFilter;
      return searchMatch && statusMatch && categoryMatch;
    });
  }, [partners, searchTerm, statusFilter, categoryFilter]);
  
  const statusBadgeVariant = (status: Partner['status']) => {
    switch (status) {
      case '啟用中': return 'default';
      case '停用中': return 'secondary';
      case '待審核': return 'outline';
      default: return 'default';
    }
  };

  const categories = useMemo(() => ['All', ...Array.from(new Set(partners.map(p => p.category)))], [partners]);
  const statuses = useMemo(() => ['All', ...Array.from(new Set(partners.map(p => p.status)))], [partners]);


  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">合作夥伴</h2>
                <p className="text-muted-foreground">檢視、篩選並管理您的所有業務關係。</p>
            </div>
            {userRole === 'Admin' && (
              <Button size="sm" className="h-9 gap-1" onClick={onAddPartner}>
                <Plus className="h-4 w-4" />
                <span>
                  新增夥伴
                </span>
              </Button>
            )}
        </div>
        
        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="搜尋夥伴名稱..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[160px]">
                            <SelectValue placeholder="篩選狀態" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">所有狀態</SelectItem>
                            {statuses.filter(s => s !== 'All').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="篩選類別" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">所有類別</SelectItem>
                           {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(partner => (
          <Card 
            key={partner.id} 
            onClick={() => onSelectPartner(partner.id!)} 
            className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 flex flex-col"
          >
            <CardHeader className="flex-grow">
              <div className="flex justify-between items-start">
                  <div className='flex items-center gap-4'>
                    <Image src={partner.logoUrl} alt={`${partner.name} logo`} width={48} height={48} className="rounded-md border" data-ai-hint="logo company" />
                    <div>
                        <CardTitle className="text-xl">{partner.name}</CardTitle>
                        <CardDescription>{partner.category}</CardDescription>
                    </div>
                  </div>
                <Badge variant={statusBadgeVariant(partner.status)}>{partner.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{partner.overview}</p>
            </CardContent>
          </Card>
        ))}
      </div>
       {filteredPartners.length === 0 && (
          <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">找不到符合條件的合作夥伴。請嘗試調整您的篩選條件。</p>
          </div>
        )}
    </div>
  );
};

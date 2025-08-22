/**
 * @project Beta-NG Integrated Platform - 統一整合平台 PartnerVerse 儀表板
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author Beta-NG Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 1.0.0
 * 
 * @fileoverview PartnerVerse 儀表板元件
 * @description 顯示合作夥伴相關統計數據，包括總數、各類別分佈及近期活動。
 */
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { Partner } from '@/lib/types';
import { Button } from '../../../ui/button';
import { ArrowUpRight, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface DashboardProps {
    partners: Partner[];
    onViewPartners: () => void;
}

export const Dashboard: FC<DashboardProps> = ({ partners, onViewPartners }) => {
    const totalPartners = partners.length;
    const activePartners = partners.filter(p => p.status === '啟用中').length;
    const inactivePartners = partners.filter(p => p.status === '停用中').length;
    const pendingPartners = partners.filter(p => p.status === '待審核').length;

    const categoryData = partners.reduce((acc, partner) => {
        const category = partner.category;
        const existing = acc.find(item => item.name === category);
        if (existing) {
            existing.total++;
        } else {
            acc.push({ name: category, total: 1 });
        }
        return acc;
    }, [] as { name: string; total: number }[]);

    const totalTransactions = partners.reduce((sum, p) => sum + p.transactions.length, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總合作夥伴數</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalPartners}</div>
                <p className="text-xs text-muted-foreground">系統中所有合作夥伴</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活躍合作夥伴</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activePartners}</div>
                <p className="text-xs text-muted-foreground">{totalPartners > 0 ? ((activePartners/totalPartners) * 100).toFixed(0) : 0}% 的佔比</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">待審批合作夥伴</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingPartners}</div>
                 <p className="text-xs text-muted-foreground">等待批准</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總交易量</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalTransactions}</div>
                <p className="text-xs text-muted-foreground">所有合作夥伴的總和</p>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>各類別合作夥伴</CardTitle>
                <CardDescription>不同類別的合作夥伴分佈情況。</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>近期活動</CardTitle>
                 <CardDescription>快速查看最新的合作夥伴更新。</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {partners.slice(0, 4).map(partner => (
                        <div key={partner.id} className="flex items-center">
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{partner.name}</p>
                                <p className="text-sm text-muted-foreground">{partner.category}</p>
                            </div>
                            <div className="ml-auto font-medium">{partner.status}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
             <CardFooter>
                <Button className="w-full" onClick={onViewPartners}>
                    查看所有合作夥伴
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
};

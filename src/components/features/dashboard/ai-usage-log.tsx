'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import type { AiTokenLog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const processFirestoreLog = (doc: any): AiTokenLog => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toDate(),
    } as AiTokenLog;
};

export function AiUsageLog() {
    const [logs, setLogs] = useState<AiTokenLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const logsCollection = collection(db, 'aiTokenLogs');
        const q = query(logsCollection, orderBy('timestamp', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const logList = querySnapshot.docs.map(processFirestoreLog);
            setLogs(logList);
            setLoading(false);
        }, (error) => {
            console.error("獲取 AI 使用日誌時發生錯誤：", error);
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    const StatusIndicator = ({ status }: { status: 'succeeded' | 'failed' }) => {
        if (status === 'succeeded') {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        return <XCircle className="h-5 w-5 text-destructive" />;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-6 w-6" />
                    <span>近期 AI Token 消耗紀錄</span>
                </CardTitle>
                <CardDescription>最近 10 次 AI 流程調用紀錄。</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>流程名稱</TableHead>
                            <TableHead>時間</TableHead>
                            <TableHead className="text-right">Token 數量</TableHead>
                            <TableHead className="text-center">狀態</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.flowName}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true, locale: zhTW }) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right font-mono">{log.totalTokens.toLocaleString()}</TableCell>
                                <TableCell className="flex justify-center items-center pt-4">
                                    <StatusIndicator status={log.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {logs.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        尚無任何 AI 使用紀錄。
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

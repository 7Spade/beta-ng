'use client';

import { WorkflowBuilder } from '@/components/features/partnerverse/workflows/workflow-builder';
import { db } from '@/lib/firebase';
import type { Partner } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export default function WorkflowsPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            setIsLoading(true);
            try {
                const partnersCollection = collection(db, 'partners');
                const partnerSnapshot = await getDocs(partnersCollection);
                const partnerList = partnerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Partner[];
                setPartners(partnerList);
            } catch (error) {
                console.error("為工作流程獲取合作夥伴時發生錯誤：", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPartners();
    }, []);

    if (isLoading) {
        return <div>正在載入...</div>
    }

  return <WorkflowBuilder partners={partners} />;
}

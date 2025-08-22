'use client';

import { WorkflowBuilder } from '@/components/partnerverse/workflows/workflow-builder';
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
                console.error("Error fetching partners for workflow: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPartners();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>
    }

  return <WorkflowBuilder partners={partners} />;
}

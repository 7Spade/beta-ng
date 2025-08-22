'use client';

import { useState, useEffect, type FC } from 'react';
import type { Partner } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Dashboard } from '@/components/partnerverse/dashboard/dashboard';

const PartnerVerseDashboardPage: FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      const partnersCollection = collection(db, 'partners');
      const partnerSnapshot = await getDocs(partnersCollection);
      const partnerList = partnerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Partner[];
      setPartners(partnerList);
      setIsLoading(false);
    };

    fetchPartners();
  }, []);

  const handleNavigate = () => {
    // This can be replaced with Next.js router navigation if needed
    window.location.href = '/partnerverse/partners';
  }

  if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[400px] w-full lg:col-span-2" />
          <Skeleton className="h-[400px] w-full lg:col-span-2" />
        </div>
      );
  }

  return <Dashboard partners={partners} onViewPartners={handleNavigate} />;
}

export default PartnerVerseDashboardPage;

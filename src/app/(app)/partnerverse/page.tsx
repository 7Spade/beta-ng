
'use client';

import { useState, useEffect, type FC } from 'react';
import type { Partner } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerDashboard } from '@/components/features/partnerverse/dashboard/partner-dashboard';
import { useRouter } from 'next/navigation';

const PartnerVersePage: FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      try {
        const partnersCollection = collection(db, 'partners');
        const partnerSnapshot = await getDocs(partnersCollection);
        const partnerList = partnerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Partner[];
        setPartners(partnerList);
      } catch (error) {
        console.error("獲取合作夥伴時發生錯誤:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleNavigate = () => {
    router.push('/partnerverse/partners');
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

  return <PartnerDashboard partners={partners} onViewPartners={handleNavigate} />;
}

export default PartnerVersePage;

'use client';

import { useState, useEffect, type FC } from 'react';
import type { Partner } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerList } from '@/components/partnerverse/partners/partner-list';
import { PartnerProfile } from '@/components/partnerverse/partners/partner-profile';
import { PartnerForm } from '@/components/partnerverse/partners/partner-form';
import { useToast } from "@/hooks/use-toast";
import type { Role } from '@/lib/roles';


const PartnersPage: FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<Partner | null>(null);
  const [userRole, setUserRole] = useState<Role>('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      try {
        const partnersCollection = collection(db, 'partners');
        const partnerSnapshot = await getDocs(partnersCollection);
        const partnerList = partnerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Partner[];
        setPartners(partnerList);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleSelectPartner = (partner: Partner) => {
    setSelectedPartner(partner);
  };
  
  const handleBackToList = () => {
    setSelectedPartner(null);
  };

  const handleAddPartner = () => {
    setPartnerToEdit(null);
    setIsFormOpen(true);
  };
  
  const handleEditPartner = (partner: Partner) => {
    setPartnerToEdit(partner);
    setIsFormOpen(true);
  }

  const handleSavePartner = async (partnerToSave: Omit<Partner, 'id'>) => {
    try {
      if (partnerToEdit && partnerToEdit.id) {
        const partnerRef = doc(db, 'partners', partnerToEdit.id);
        await setDoc(partnerRef, partnerToSave, { merge: true });
        const updatedPartners = partners.map(p => p.id === partnerToEdit.id ? { ...partnerToSave, id: partnerToEdit.id } : p);
        setPartners(updatedPartners);
        if(selectedPartner?.id === partnerToEdit.id) {
            setSelectedPartner({ ...partnerToSave, id: partnerToEdit.id });
        }
        toast({ title: "Partner Updated", description: `${partnerToSave.name} has been successfully updated.` });
      } else {
        const docRef = await addDoc(collection(db, 'partners'), partnerToSave);
        const newPartner = { ...partnerToSave, id: docRef.id };
        setPartners([newPartner, ...partners]);
        toast({ title: "Partner Added", description: `${newPartner.name} has been successfully added.` });
      }
    } catch (error) {
       console.error("Error saving partner: ", error);
       toast({
        title: "Error",
        description: "Failed to save partner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFormOpen(false);
      setPartnerToEdit(null);
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      );
    }
    if (selectedPartner) {
        return <PartnerProfile partner={selectedPartner} onBack={handleBackToList} userRole={userRole} onEdit={handleEditPartner} />;
    }
    return <PartnerList partners={partners} onSelectPartner={handleSelectPartner} userRole={userRole} onAddPartner={handleAddPartner} />;
  }

  return (
    <div className="space-y-6">
      {renderContent()}
       <PartnerForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSavePartner as any}
        partner={partnerToEdit}
      />
    </div>
  );
}

export default PartnersPage;

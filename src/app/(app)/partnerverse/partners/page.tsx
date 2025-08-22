
'use client';

import { useState, useEffect, type FC } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore';

import type { Partner, Contact } from '@/lib/types';
import type { Role } from '@/lib/roles';

import { Skeleton } from '@/components/ui/skeleton';
import { PartnerList } from '@/components/partnerverse/partners/partner-list';
import { PartnerProfile } from '@/components/partnerverse/partners/partner-profile';
import { PartnerForm } from '@/components/partnerverse/partners/forms/partner-form';
import { ContactForm } from '@/components/partnerverse/partners/forms/contact-form';


const PartnersPage: FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<Partner | null>(null);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [userRole, setUserRole] = useState<Role>('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const partnersCollection = collection(db, 'partners');
    const unsubscribe = onSnapshot(partnersCollection, (querySnapshot) => {
        const partnerList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Partner[];
        setPartners(partnerList);
        setIsLoading(false);
    }, (error) => {
        console.error("獲取合作夥伴時發生錯誤 (snapshot):", error);
        toast({ title: "錯誤", description: "無法即時載入合作夥伴資料。", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
  };
  
  const handleBackToList = () => {
    setSelectedPartnerId(null);
  };

  const handleAddPartner = () => {
    setPartnerToEdit(null);
    setIsFormOpen(true);
  };
  
  const handleEditPartner = (partner: Partner) => {
    setPartnerToEdit(partner);
    setIsFormOpen(true);
  }

  const handleSavePartner = async (partnerData: Omit<Partner, 'id'>) => {
    setIsFormOpen(false);
    try {
      if (partnerToEdit && partnerToEdit.id) {
        // Update existing partner
        const partnerRef = doc(db, 'partners', partnerToEdit.id);
        await setDoc(partnerRef, partnerData, { merge: true });
        toast({ title: "合作夥伴已更新", description: `${partnerData.name} 的資料已成功更新。` });
      } else {
        // Add new partner
        await addDoc(collection(db, 'partners'), partnerData);
        toast({ title: "合作夥伴已新增", description: `已成功新增合作夥伴。` });
      }
    } catch (error) {
       console.error("儲存合作夥伴時發生錯誤：", error);
       toast({
        title: "錯誤",
        description: "儲存合作夥伴失敗，請再試一次。",
        variant: "destructive",
      });
    } finally {
      setPartnerToEdit(null);
    }
  };

  const handleUpdateWorkflows = async (partnerId: string, receivableWorkflow: string[], payableWorkflow: string[]) => {
      try {
          const partnerRef = doc(db, 'partners', partnerId);
          await setDoc(partnerRef, { receivableWorkflow, payableWorkflow }, { merge: true });
          toast({ title: "流程已更新", description: "合作夥伴的財務流程已成功儲存。" });
      } catch (error) {
          console.error("更新流程時發生錯誤：", error);
          toast({
              title: "錯誤",
              description: "更新流程失敗，請再試一次。",
              variant: "destructive",
          });
      }
  };
  
  const handleOpenContactForm = (contact: Contact | null) => {
    setContactToEdit(contact);
    setIsContactFormOpen(true);
  };
  
  const handleSaveContact = async (contactData: Omit<Contact, 'id'>, contactId?: string) => {
    const selectedPartner = partners.find(p => p.id === selectedPartnerId);
    if (!selectedPartner || !selectedPartner.id) return false;
    
    const partnerRef = doc(db, 'partners', selectedPartner.id);
    let updatedContacts: Contact[];

    if (contactId) { // Editing existing contact
        updatedContacts = selectedPartner.contacts.map(c => 
            c.id === contactId ? { ...c, ...contactData, id: c.id } : c
        );
    } else { // Adding new contact
        const newContact: Contact = { ...contactData, id: `contact-${Date.now()}` };
        updatedContacts = [...(selectedPartner.contacts || []), newContact];
    }
    
    try {
        await updateDoc(partnerRef, { contacts: updatedContacts });
        toast({ title: "聯絡人已儲存", description: `聯絡人 ${contactData.name} 的資料已成功更新。` });
        return true;
    } catch (error) {
        console.error("儲存聯絡人時發生錯誤：", error);
        toast({ title: "錯誤", description: "儲存聯絡人失敗。", variant: "destructive" });
        return false;
    }
  };

  const handleDeleteContact = async (partnerId: string, contactId: string) => {
    const selectedPartner = partners.find(p => p.id === partnerId);
    if (!selectedPartner) return;

    const partnerRef = doc(db, 'partners', partnerId);
    const updatedContacts = selectedPartner.contacts.filter(c => c.id !== contactId);

    try {
        await updateDoc(partnerRef, { contacts: updatedContacts });
        toast({ title: "聯絡人已刪除", description: "該聯絡人已成功從列表中移除。" });
    } catch (error) {
        console.error("刪除聯絡人時發生錯誤：", error);
        toast({ title: "錯誤", description: "刪除聯絡人失敗。", variant: "destructive" });
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

    const selectedPartner = partners.find(p => p.id === selectedPartnerId);

    if (selectedPartner) {
        return (
            <PartnerProfile 
                partner={selectedPartner} 
                onBack={handleBackToList} 
                userRole={userRole} 
                onEdit={handleEditPartner} 
                onUpdateWorkflows={handleUpdateWorkflows}
                onOpenContactForm={handleOpenContactForm}
                onDeleteContact={handleDeleteContact}
            />
        );
    }
    return <PartnerList partners={partners} onSelectPartner={handleSelectPartner} userRole={userRole} onAddPartner={handleAddPartner} />;
  }

  return (
    <>
      {renderContent()}
       <PartnerForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSavePartner}
        partner={partnerToEdit}
      />
      <ContactForm 
        isOpen={isContactFormOpen}
        onOpenChange={setIsContactFormOpen}
        onSave={handleSaveContact}
        contact={contactToEdit}
    />
    </>
  );
}

export default PartnersPage;

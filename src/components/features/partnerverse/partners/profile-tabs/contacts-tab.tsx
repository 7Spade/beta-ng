
'use client';

import type { FC } from 'react';
import type { Partner, Contact } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface ContactsTabProps {
    partner: Partner;
    onOpenContactForm: (contact: Contact | null) => void;
    onDeleteContact: (partnerId: string, contactId: string) => Promise<void>;
}

export const ContactsTab: FC<ContactsTabProps> = ({ partner, onOpenContactForm, onDeleteContact }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>相關聯絡人</CardTitle>
                    <CardDescription>{partner.name} 的主要聯絡窗口。</CardDescription>
                </div>
                <Button onClick={() => onOpenContactForm(null)}>
                    <Plus className="mr-2 h-4 w-4" /> 新增聯絡人
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>姓名</TableHead>
                            <TableHead>職位</TableHead>
                            <TableHead>電子郵件</TableHead>
                            <TableHead>電話</TableHead>
                            <TableHead><span className="sr-only">操作</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partner.contacts && partner.contacts.length > 0 ? partner.contacts.map(contact => (
                            <TableRow key={contact.id}>
                                <TableCell className="font-medium">{contact.name}</TableCell>
                                <TableCell>{contact.role}</TableCell>
                                <TableCell><a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a></TableCell>
                                <TableCell>{contact.phone}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onOpenContactForm(contact)}>
                                                <Edit className="mr-2 h-4 w-4" /> 編輯
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                        <span className="text-destructive">刪除</span>
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>確定要刪除嗎？</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            此操作無法復原。這將永久刪除聯絡人 {contact.name}。
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>取消</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDeleteContact(partner.id!, contact.id)}>繼續</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                           <TableRow>
                             <TableCell colSpan={5} className="text-center h-24">找不到聯絡人。</TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

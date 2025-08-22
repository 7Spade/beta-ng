"use client";

import { useState, useEffect } from 'react';
import { FileJson, FileText, Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ExtractWorkItemsOutput } from '@/ai/flows/extract-work-items-flow';
import { Badge } from '../../ui/badge';

export type WorkItem = ExtractWorkItemsOutput['workItems'][0];

interface WorkItemsTableProps {
  initialData: WorkItem[];
  onDataChange: (data: WorkItem[]) => void;
}

export function WorkItemsTable({ initialData, onDataChange }: WorkItemsTableProps) {
  const [data, setData] = useState<WorkItem[]>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const updateData = (newData: WorkItem[]) => {
      setData(newData);
      onDataChange(newData);
  }

  const handleInputChange = (index: number, field: keyof WorkItem, value: string | number) => {
    const newData = [...data];
    const updatedItem = { ...newData[index] };
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (field === 'item') {
        updatedItem.item = String(value);
    } else if (!isNaN(numericValue) && (field === 'quantity' || field === 'price' || field === 'unitPrice')) {
        (updatedItem[field] as number) = numericValue;
    } else {
        // Handle cases where input might be cleared, default to 0
        (updatedItem[field] as number) = 0;
    }
    
    // Automatic calculation logic
    if (field === 'quantity' || field === 'unitPrice') {
        updatedItem.price = parseFloat((updatedItem.quantity * updatedItem.unitPrice).toFixed(2));
    } else if (field === 'price') {
        if (updatedItem.quantity > 0) {
            updatedItem.unitPrice = parseFloat((updatedItem.price / updatedItem.quantity).toFixed(2));
        } else {
            updatedItem.unitPrice = 0; // Avoid division by zero
        }
    }

    newData[index] = updatedItem;
    updateData(newData);
  };
  
  const handleRemoveRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    updateData(newData);
  };

  const handleAddRow = () => {
    const newRow: WorkItem = {
      item: '新項目',
      quantity: 1,
      price: 0,
      unitPrice: 0,
    };
    updateData([...data, newRow]);
  };
  
  const exportToCSV = () => {
    const headers = ['項目', '數量', '單價', '總價'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => `"${row.item.replace(/"/g, '""')}",${row.quantity},${row.unitPrice},${row.price}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'work-items.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'work-items.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const totalAmount = data.reduce((sum, item) => sum + item.price, 0);

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">文件中未提取到任何工作項目。</p>
        <p className="text-muted-foreground mt-2">您可以在下方手動新增項目。</p>
        <Button onClick={handleAddRow} className="mt-4" variant="secondary">
          <Plus className="mr-2 h-4 w-4" />
          新增項目
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="w-[100px] text-center">佔比</TableHead>
              <TableHead className="w-[45%]">項目描述</TableHead>
              <TableHead className="text-right w-[120px]">數量</TableHead>
              <TableHead className="text-right w-[150px]">單價</TableHead>
              <TableHead className="text-right w-[150px]">總價</TableHead>
              <TableHead className="w-12 p-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="text-center">
                    <Badge variant="outline">
                        {totalAmount > 0 ? ((row.price / totalAmount) * 100).toFixed(1) : '0.0'}%
                    </Badge>
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    value={row.item}
                    onChange={(e) => handleInputChange(index, 'item', e.target.value)}
                    className="bg-transparent border-0 h-9 focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                    className="text-right bg-transparent border-0 h-9 focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) => handleInputChange(index, 'unitPrice', e.target.value)}
                    className="text-right bg-transparent border-0 h-9 focus-visible:ring-1 focus-visible:ring-ring"
                    step="0.01"
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    value={row.price}
                    onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                    className="text-right bg-transparent border-0 h-9 focus-visible:ring-1 focus-visible:ring-ring"
                    step="0.01"
                  />
                </TableCell>
                <TableCell className="p-1 text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(index)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        <span className="sr-only">移除此行</span>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <Button onClick={handleAddRow} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          新增一列
        </Button>
        <div className="text-right">
            <p className="text-sm text-muted-foreground">總金額</p>
            <p className="text-2xl font-bold">${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>

      <div className="flex justify-start items-center mt-6">
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="secondary">
            <FileText className="mr-2 h-4 w-4" />
            匯出 CSV
          </Button>
          <Button onClick={exportToJSON} variant="secondary">
            <FileJson className="mr-2 h-4 w-4" />
            匯出 JSON
          </Button>
        </div>
      </div>
    </div>
  );
}

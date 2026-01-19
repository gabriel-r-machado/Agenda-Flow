'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BUSINESS_CATEGORIES } from '@/lib/categories';
import { Tag } from 'lucide-react';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">Categoria do Negócio</Label>
      <div className="relative">
        <Tag className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="pl-10">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {BUSINESS_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


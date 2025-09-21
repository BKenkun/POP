
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  maxStock?: number;
}

export function QuantitySelector({ quantity, onQuantityChange, maxStock }: QuantitySelectorProps) {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input for user typing, treat as 0 for now
    const numValue = value === '' ? 1 : parseInt(value, 10);
    
    if (isNaN(numValue)) return; // Ignore non-numeric input

    if (maxStock !== undefined && numValue > maxStock) {
        onQuantityChange(maxStock);
    } else {
        onQuantityChange(numValue);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // If the input is empty or less than 1 on blur, reset to 1
      if (quantity < 1) {
          onQuantityChange(1);
      }
  };

  const increment = () => {
    const newQuantity = quantity + 1;
    if (maxStock === undefined || newQuantity <= maxStock) {
      onQuantityChange(newQuantity);
    }
  };

  const decrement = () => {
    const newQuantity = quantity - 1;
    if (newQuantity >= 1) {
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={decrement}
        disabled={quantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min={1}
        max={maxStock}
        className="h-8 w-14 text-center p-0 border-x-0 focus-visible:ring-0"
        aria-label="Product quantity"
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={increment}
        disabled={maxStock !== undefined && quantity >= maxStock}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

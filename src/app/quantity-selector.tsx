'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  maxStock?: number;
}

export function QuantitySelector({ quantity, onQuantityChange, maxStock }: QuantitySelectorProps) {
  const canDecrease = quantity > 1;
  const canIncrease = maxStock === undefined || quantity < maxStock;

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        aria-label="Disminuir cantidad"
        disabled={!canDecrease}
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="min-w-5 text-center text-sm" aria-live="polite">{quantity}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        aria-label="Aumentar cantidad"
        disabled={!canIncrease}
        onClick={() => onQuantityChange(maxStock === undefined ? quantity + 1 : Math.min(maxStock, quantity + 1))}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

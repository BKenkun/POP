'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={selectedImage}
              alt={`Imagen principal de ${productName}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint="product image"
              priority
            />
          </div>
        </CardContent>
      </Card>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={cn(
                'overflow-hidden rounded-md border-2 transition-all',
                selectedImage === image
                  ? 'border-primary'
                  : 'border-transparent hover:border-primary/50'
              )}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={image}
                  alt={`Imagen de galería ${index + 1} de ${productName}`}
                  fill
                  className="object-cover"
                   sizes="25vw"
                  data-ai-hint="product thumbnail"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

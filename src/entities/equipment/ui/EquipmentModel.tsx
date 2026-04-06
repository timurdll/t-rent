import Image from 'next/image';
import { cn } from '@/src/shared/lib/utils';


interface EquipmentModelProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
}

export function EquipmentModel({
  src,
  alt,
  width = 600,
  height = 600,
  className,
  imageClassName,
}: EquipmentModelProps) {
  return (
    <div className={cn('absolute', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'object-contain [filter:drop-shadow(0_18px_35px_rgba(0,0,0,0.45))]',
          imageClassName
        )}
        style={{ width: '100%', height: 'auto' }}
        priority
      />
    </div>
  );
}

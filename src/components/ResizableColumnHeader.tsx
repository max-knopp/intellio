import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ResizableColumnHeaderProps {
  children: React.ReactNode;
  onResize: (delta: number) => void;
  className?: string;
  resizable?: boolean;
}

export function ResizableColumnHeader({ 
  children, 
  onResize, 
  className,
  resizable = true 
}: ResizableColumnHeaderProps) {
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    isDraggingRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = moveEvent.clientX - startXRef.current;
      if (Math.abs(delta) > 2) {
        onResize(delta);
        startXRef.current = moveEvent.clientX;
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [onResize]);

  return (
    <div className={cn("relative flex items-center pr-2", className)}>
      <span className="truncate">{children}</span>
      {resizable && (
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize group flex items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          <div className="w-0.5 h-3 bg-muted-foreground/30 group-hover:bg-primary/60 transition-colors rounded-full" />
        </div>
      )}
    </div>
  );
}

'use client';

import React, { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';

interface SignatureCanvasProps {
  onSignatureChange: (signatureData: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface SignatureCanvasRef {
  clear: () => void;
  getSignature: () => string;
}

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ onSignatureChange, width = 400, height = 200, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Clear canvas and redraw white background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            onSignatureChange('');
          }
        }
      },
      getSignature: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          return canvas.toDataURL('image/png');
        }
        return '';
      }
    }));

    // Initialize canvas once
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size only once
      canvas.width = width;
      canvas.height = height;

      // Set drawing styles
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw white background only once at initialization
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // Setup event listeners
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const getPointFromEvent = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX: number, clientY: number;

        if (e instanceof MouseEvent) {
          clientX = e.clientX;
          clientY = e.clientY;
        } else {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        }

        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      };

      const startDrawing = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        isDrawingRef.current = true;
        lastPointRef.current = getPointFromEvent(e);
      };

      const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawingRef.current || !lastPointRef.current) return;

        e.preventDefault();
        const currentPoint = getPointFromEvent(e);

        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();

        lastPointRef.current = currentPoint;
        
        // تحديث التوقيع أثناء الرسم
        onSignatureChange(canvas.toDataURL('image/png'));
      };

      const stopDrawing = () => {
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          lastPointRef.current = null;
          // Notify parent of signature change immediately
          const signatureData = canvas.toDataURL('image/png');
          console.log('Signature saved, length:', signatureData.length);
          onSignatureChange(signatureData);
        }
      };

      // Mouse events
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseout', stopDrawing);

      // Touch events
      canvas.addEventListener('touchstart', startDrawing);
      canvas.addEventListener('touchmove', draw);
      canvas.addEventListener('touchend', stopDrawing);

      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
      };
    }, [width, height, onSignatureChange]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ touchAction: 'none' }}
      />
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';

export default SignatureCanvas;

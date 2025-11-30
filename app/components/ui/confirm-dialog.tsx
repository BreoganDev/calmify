'use client';

/**
 * ConfirmDialog Component
 * Componente reutilizable para confirmaciones que reemplaza window.confirm()
 */

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { focusRing } from '@/lib/design-tokens';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error durante la confirmación:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming || loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isConfirming || loading}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isConfirming || loading ? 'Procesando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook para usar ConfirmDialog de forma programática
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    props: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>;
  }>({
    open: false,
    props: {
      title: '',
      description: '',
      onConfirm: () => {},
    },
  });

  const confirm = React.useCallback(
    (props: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
      return new Promise<boolean>((resolve) => {
        setState({
          open: true,
          props: {
            ...props,
            onConfirm: async () => {
              await props.onConfirm();
              resolve(true);
            },
          },
        });
      });
    },
    []
  );

  const dialog = (
    <ConfirmDialog
      {...state.props}
      open={state.open}
      onOpenChange={(open) => {
        if (!open) {
          setState((prev) => ({ ...prev, open: false }));
        }
      }}
    />
  );

  return { confirm, dialog };
}

// Componente helper para confirmaciones destructivas comunes
export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  itemType = 'elemento',
  onConfirm,
  loading,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`¿Eliminar ${itemType}?`}
      description={`¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="destructive"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

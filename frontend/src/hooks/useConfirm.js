import { useState, useCallback } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    type: 'warning',
    onConfirm: null
  });

  const confirm = useCallback(({
    title = "Confirmer l'action",
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'warning'
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => resolve(true)
      });
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm();
    }
    closeConfirm();
  }, [confirmState.onConfirm, closeConfirm]);

  const handleCancel = useCallback(() => {
    closeConfirm();
  }, [closeConfirm]);

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel,
    closeConfirm
  };
};

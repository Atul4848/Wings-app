import React from 'react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';

interface IParams {
  onNo: () => void;
  isDelete: boolean;
  message: string;
  title: string;
  onClose: () => void;
}

// Hook
export const useConfirmDialog = () => {
  const confirmAction = (
    onYes: Function,
    {
      onNo = () => ModalStore.close(),
      isDelete = false,
      message = '',
      title = '',
      onClose = () => ModalStore.close(),
    }: Partial<IParams>
  ) => {
    const _defaultMessage = isDelete
      ? 'Are you sure you want to remove this record?'
      : 'Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?';
    const _defaultTitle = isDelete ? 'Confirm Delete' : 'Confirm Cancellation';

    return ModalStore.open(
      <ConfirmDialog
        title={Boolean(title) ? title : _defaultTitle}
        message={Boolean(message) ? message : _defaultMessage}
        yesButton="Yes"
        onNoClick={onNo}
        onYesClick={onYes}
        onCloseClick={onClose}
      />
    );
  };

  return {
    confirmAction,
  };
};

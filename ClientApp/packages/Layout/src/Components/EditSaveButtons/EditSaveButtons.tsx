import React, { FC } from 'react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ViewPermission, GRID_ACTIONS } from '@wings-shared/core';

interface Props {
  disabled?: boolean;
  isEditMode: boolean;
  isEditing?: boolean;
  hasEditPermission: boolean;
  isSaveVisible?: boolean; // Task 47424
  onAction: (action: GRID_ACTIONS) => void;
}

const EditSaveButtons: FC<Props> = ({
  disabled,
  isEditMode,
  hasEditPermission,
  isEditing,
  isSaveVisible,
  ...props
}: Props) => {
  if (isEditMode) {
    return (
      <div >
        <PrimaryButton
          variant="outlined"
          color="primary"
          onClick={() => props.onAction(GRID_ACTIONS.CANCEL)}
          disabled={isEditing}
        >
          Cancel
        </PrimaryButton>
        <ViewPermission hasPermission={!isSaveVisible}>
          <PrimaryButton
            variant="contained"
            color="primary"
            onClick={() => props.onAction(GRID_ACTIONS.SAVE)}
            disabled={disabled}
          >
            Save
          </PrimaryButton>
        </ViewPermission>
      </div>
    );
  }

  return (
    <ViewPermission hasPermission={hasEditPermission}>
      <PrimaryButton
        variant="contained"
        color="primary"
        onClick={() => props.onAction(GRID_ACTIONS.EDIT)}
      >
        Edit
      </PrimaryButton>
    </ViewPermission>
  );
};
export default EditSaveButtons;

import { EditDialog, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { IViewInputControl, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GRID_ACTIONS, IOptionValue, baseEntitySearchFilters } from '@wings-shared/core';
import { useStyles } from './UplinkRejectionNotes.styles';
import { Field } from 'mobx-react-form';

interface Props {
  viewMode: VIEW_MODE;
  fields: Field;
  inputControls: IViewInputControl[];
  onDataSave: (data) => void;
}

const UplinkRejectionNotes = ({ inputControls, ...props }: Props) => {
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(props, props.fields, baseEntitySearchFilters);

  const onAction = (gridAction: GRID_ACTIONS): void => {
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        onDataSave()
        break;
      case GRID_ACTIONS.CANCEL:
        useUpsert.onCancel(props.viewMode)
        break;
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  const onDataSave = () => {
    const formData = useUpsert.form.values();
    props.onDataSave(formData);
  };
  
  const dialogContent = (): ReactNode => (
    <ViewInputControlsGroup
      groupInputControls={[{ title: '', inputControls }]}
      field={(fieldKey) => useUpsert.getField(fieldKey)}
      isEditing={useUpsert.isEditable}
      isLoading={useUpsert.loader.isLoading}
      onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
    />
  );

  return (
    <EditDialog
      tabs={''}
      noTabs={true}
      title="Provide Reason for Rejection"
      isEditable={useUpsert.isEditable}
      hasErrors={useUpsert.form.hasError || !useUpsert.form.changed}
      isLoading={useUpsert.isLoading}
      onAction={(action) => onAction(action)}
      tabContent={dialogContent}
      classes={{ modalWidth: classes.dialogContain }}
    />
  );
};

export default observer(UplinkRejectionNotes);

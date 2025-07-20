import React, { FC, ReactNode, useEffect } from 'react';
import { BaseUpsertComponent, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { MobileReleaseModel } from '../../../Shared/Models/MobileRelease.model';
import { fields } from './Fields';
import { action } from 'mobx';
import { MobileReleaseStore } from '../../../Shared/Stores/MobileRelease.store';
import { useStyles } from './UpsertRelease.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IAPIUpsertMobileReleaseRequest } from '../../../Shared';
import { DATE_FORMAT, IClasses, UIStore } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  mobileReleaseStore?: MobileReleaseStore;
  upsertRelease: (request: IAPIUpsertMobileReleaseRequest) => void;
  mobileRelease?: MobileReleaseModel;
};

const UpsertRelease: FC<Props> = ({ ...props }: Props) => { 
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(props, fields);

  useEffect(() => {
    useUpsert.setViewMode(props?.viewMode || VIEW_MODE.NEW);
    useUpsert.setFormValues(props.mobileRelease);
  }, []);

  const upsertRelease = (): void => {
    const { upsertRelease, mobileRelease } = props;
    const release = new MobileReleaseModel({ ...mobileRelease, ...useUpsert.form.values() });
    const request: IAPIUpsertMobileReleaseRequest = {
      MobileReleaseId: release.mobileReleaseId,
      Date: release.date,
      Version: release.version,
      ForceUpdate: release.forceUpdate,
    };
    upsertRelease(request);
  }

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'MobileRelease',
      inputControls: [
        {
          fieldKey: 'version',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'date',
          type: EDITOR_TYPES.DATE_TIME,
          dateTimeFormat: DATE_FORMAT.GRID_DISPLAY,
          allowKeyboardInput: false,
        },
        {
          fieldKey: 'forceUpdate',
          type: EDITOR_TYPES.CHECKBOX,
        },
      ],
    };
  }

  const hasError = (): boolean => {
    return useUpsert.form.hasError || UIStore.pageLoading;
  }

  const dialogContent = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          {groupInputControls().inputControls.map((inputControl: IViewInputControl, index: number) => (
            <ViewInputControl
              {...inputControl}
              key={index}
              classes={{
                flexRow: classes.fullFlex,
              }}
              field={useUpsert.getField(inputControl.fieldKey || '')}
              isEditable={useUpsert.isEditable}
              onValueChange={(option, fieldKey) => useUpsert.onValueChange(option, inputControl.fieldKey || '')}
            />
          ))}
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => upsertRelease()}
              disabled={useUpsert.form.hasError}
            >
              Save
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title={`${useUpsert.viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Release`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('mobileReleaseStore')(observer(UpsertRelease));

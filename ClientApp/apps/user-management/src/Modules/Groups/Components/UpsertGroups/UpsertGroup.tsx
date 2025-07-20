import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { GroupStore, UserGroupModel, IAPIUserGroupsRequest } from '../../../Shared';
import { useStyles } from './UpsertGroup.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IClasses } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { fields } from './Fields';
import { InfoFilledIcon } from '@uvgo-shared/icons';
import classNames from 'classnames';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  groupStore?: GroupStore;
  upsertGroup: (request: IAPIUserGroupsRequest) => void,
  userGroup?: UserGroupModel;
};

const UpsertGroup: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(props, fields);
  useEffect(() => {
    useUpsert.setViewMode(props?.viewMode || VIEW_MODE.NEW);
    useUpsert.setFormValues(props.userGroup);
  }, []);

  const upsertGroup = (): void => {
    const release = new UserGroupModel({ ...props.userGroup, ...useUpsert.form.values() });
    const request: IAPIUserGroupsRequest = {
      Id: release?.id,
      Name: release.name,
      Description: release.description,
      Unlocked: release.unlocked,
      IdleTimeout: release.idleTimeout,
    }
    props.upsertGroup(request);
  }

  const groupInputControls = (): IGroupInputControls => {
    const isDisabled = props.userGroup?.unlocked === false && props.viewMode !== VIEW_MODE.NEW;
    return {
      title: 'Group',
      inputControls: [
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: isDisabled,
        },
        {
          fieldKey: 'description',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'unlocked',
          type: EDITOR_TYPES.CHECKBOX,
          isDisabled: isDisabled,
        },
        {
          fieldKey: 'idleTimeout',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: isDisabled,
        },
      ],
    };
  }

  const dialogContent = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          {
            groupInputControls().inputControls
              .map((inputControl: IViewInputControl, index: number) =>
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  classes={{
                    flexRow: classNames({
                      [classes.inputControlGroup]: true,
                    }),
                  }}
                  field={useUpsert.getField(inputControl.fieldKey || '')}
                  isEditable={useUpsert.isEditable}
                  onValueChange={(option, fieldKey) => useUpsert.onValueChange(option, inputControl.fieldKey || '')}
                />
              )
          }
          <div className={classes.infoDetail}>
            <InfoFilledIcon />
            <span>Seconds of uvGO web users inactivity before auto logout. Mainly left blank.</span>
          </div>
          <div className={classes.btnContainer}>
            <div className={classes.btnContainerCancel}>
              <PrimaryButton color="primary" variant="contained" onClick={() => ModalStore.close()}>
                Cancel
              </PrimaryButton>
            </div>
            <div className={classes.btnContainerSave}>
              <PrimaryButton
                variant='contained'
                color='primary'
                onClick={() => upsertGroup()}
                disabled={useUpsert.form.hasError}
              >
              Save
              </PrimaryButton>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title={`${useUpsert.viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Group`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />

  )
}

export default inject('groupStore')(observer(UpsertGroup));
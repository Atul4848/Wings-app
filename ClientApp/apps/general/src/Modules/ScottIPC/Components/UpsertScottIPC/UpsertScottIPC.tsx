import React, { FC, ReactNode, useEffect } from 'react';
import { useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ScottIPCModel } from '../../../Shared/Models/ScottIPC.model';
import { fields } from './Fields';
import { ScottIPCStore } from '../../../Shared/Stores/ScottIPC.store';
import { useStyles } from './UpsertScottIPC.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IAPIUpsertScottIPCRequest } from '../../../Shared';
import { IClasses, UIStore } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  scottIPCStore?: ScottIPCStore;
  upsertScottIpc: (request: IAPIUpsertScottIPCRequest) => void,
  sipc?: ScottIPCModel;
};

const UpsertScottIPC: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(props, fields);

  useEffect(() => {
    useUpsert.setFormValues(props.sipc as ScottIPCModel);
  }, []);

  const upsertScottIpc = (): void => {
    const { upsertScottIpc, sipc } = props
    const scottIpc = new ScottIPCModel({ ...sipc, ...useUpsert.form.values() });
    const { sipcUserId, sipcName, uwaAccountNumber, captainName, crewPaxId, id } = scottIpc;
    const request: IAPIUpsertScottIPCRequest = {
      SIPCUserId: sipcUserId,
      SIPCName: sipcName,
      UniversalAccountNumber: uwaAccountNumber,
      CaptainName: captainName,
      CrewPaxId: crewPaxId?.toString() === '' ? null : crewPaxId,
    };
    upsertScottIpc(id ? { ...request, Id: id } : request);
  }

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'Scott IPC',
      inputControls: [
        {
          fieldKey: 'uwaAccountNumber',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'sipcUserId',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'sipcName',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'captainName',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'crewPaxId',
          type: EDITOR_TYPES.TEXT_FIELD,
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
        {useUpsert.loader.spinner}
        <div className={classes.modalDetail}>
          {
            groupInputControls().inputControls
              .map((inputControl: IViewInputControl, index: number) =>
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
              )
          }
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant='contained'
              color='primary'
              onClick={() => upsertScottIpc()}
              disabled={hasError()}
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
      title={`${useUpsert.viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Scott IPC Mapping`}
      open={true}
      classes={{
        dialogWrapper: classes?.modalRoot,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />

  )
}

export default inject('scottIPCStore')(observer(UpsertScottIPC));
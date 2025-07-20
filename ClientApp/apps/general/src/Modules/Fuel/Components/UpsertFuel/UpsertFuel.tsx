import React, { FC, ReactNode, useEffect } from 'react';
import { BaseUpsertComponent, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { withStyles } from '@material-ui/core';
import { FuelModel } from '../../../Shared/Models/Fuel.model';
import { fields } from './Fields';
import { action } from 'mobx';
import { FuelStore } from '../../../Shared/Stores/Fuel.store';
import { useStyles } from './UpsertFuel.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IAPIUpsertFuelRequest } from '../../../Shared';
import { IClasses, UIStore } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  fuelStore?: FuelStore;
  upsertFuel: (request: IAPIUpsertFuelRequest) => void;
  fuel?: FuelModel;
};

const UpsertFuel: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(props, fields);

  useEffect(() => {
    useUpsert.setFormValues(props.fuel as FuelModel);
  }, []);

  const upsertFuel = (): void => {
    const { upsertFuel, fuel } = props;
    const fuels = new FuelModel({ ...fuel, ...useUpsert.form.values() });
    const { customerName, uwaCustomerId, wfsCustomerId, id } = fuels;
    const request: IAPIUpsertFuelRequest = {
      CustomerName: customerName,
      UWACustomerId: uwaCustomerId,
      WFSCustomerId: wfsCustomerId,
    };
    upsertFuel(id ? { ...request, Id: id } : request);
  }

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'Fuel',
      inputControls: [
        {
          fieldKey: 'uwaCustomerId',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'wfsCustomerId',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'customerName',
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
              onClick={() => upsertFuel()}
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
      title={`${useUpsert.viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Fuel`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('fuelStore')(observer(UpsertFuel));

import React, { FC, ReactNode, useEffect } from 'react';
import { useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import { fields } from './Fields';
import { observable } from 'mobx';
import { useStyles } from './UpsertRetailData.style';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IAPIRetailDataOptionsResponse, RetailDataOptions, RetailDataStore } from '../../../Shared';
import { IClasses, IOptionValue, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { useParams } from 'react-router';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  retailDataStore?: RetailDataStore;
  upsertRetailData: (request: IAPIRetailDataOptionsResponse) => void;
  retailData?: RetailDataOptions;
};

const UpsertRetailData: FC<Props> = ({ ...props }: Props) => {
  const localStates = observable({ isAllSelected: false });
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);

  useEffect(() => {
    const retailData = props.retailData as RetailDataOptions;
    useUpsert.setFormValues(retailData);
  }, []);

  const hasError = (): boolean => {
    return UIStore.pageLoading || !Object.values(useUpsert.form.values()).some(x => x);
  }

  const setSelectAll = (isChecked: boolean) => {
    Object.keys(fields).forEach(key => useUpsert.getField(key).set(isChecked));
    localStates.isAllSelected = isChecked;
  }

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    localStates.isAllSelected = Object.keys(fields).every(key => useUpsert.getField(key).value);
  }

  const upsertRetailData = (): void => {
    props.upsertRetailData(useUpsert.form.values());
  }

  const groupInputControlsInactive = (): IGroupInputControls => {
    return {
      title: 'RetailData',
      inputControls: [
        {
          fieldKey: 'airport1Inactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'airport2Inactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'airport3Inactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'airport4Inactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'airportFlightpakInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'runway1Inactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'runway2Inactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'runway3Inactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'runway4Inactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'fboInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'fboServicesInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'hotelInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'attendenceInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'remarksInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'cateringInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'transportationInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'securityInactive',
          type: EDITOR_TYPES.CHECKBOX,
        },
      ],
    };
  }
  const groupInputControlsActive = (): IGroupInputControls => {
    return {
      title: 'RetailData',
      inputControls: [
        {
          fieldKey: 'airport1Active',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'airport2Active',
          type: EDITOR_TYPES.CHECKBOX,
          autoSelect: false,
        },
        {
          fieldKey: 'airport3Active',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'airport4Active',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'airportFlightpakActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'runway1Active',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'runway2Active',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'runway3Active',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'runway4Active',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'fboActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'fboServicesActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'hotelActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'attendenceActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'remarksActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'cateringActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'transportationActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'securityActive',
          type: EDITOR_TYPES.CHECKBOX,
        },
      ],
    };
  }

  const dialogContent = (): ReactNode => {
    const { viewMode } = props as Required<Props>;
    return (
      <>
        <div className={Utilities.isEqual(viewMode, VIEW_MODE.EDIT) ? classes.modalDetailEdit : classes.modalDetail}>
          <ViewPermission hasPermission={!Utilities.isEqual(viewMode, VIEW_MODE.EDIT)}>
            <div className={classes.checkSection}>
              <FormControlLabel
                control={
                  <Checkbox checked={localStates.isAllSelected} onChange={e => setSelectAll(e.target.checked)} />
                }
                label="Select All"
              />
            </div>
          </ViewPermission>
          <div className={classes.modalDetailSection}>
            {groupInputControlsActive().inputControls.map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                classes={{
                  flexRow: classes.fullFlex,
                }}
                field={useUpsert.getField(inputControl.fieldKey || '')}
                isEditable={true}
                onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
              />
            ))}
          </div>
          <hr />
          <div className={classes.modalDetailSection}>
            {groupInputControlsInactive().inputControls.map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                classes={{
                  flexRow: classes.fullFlex,
                }}
                field={useUpsert.getField(inputControl.fieldKey || '')}
                isEditable={true}
                onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
              />
            ))}
          </div>
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => upsertRetailData()}
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
      title={`${props.viewMode === VIEW_MODE.NEW ? 'Create Retail Data Job' : 'Selections for Retail Data Job'}`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('retailDataStore')(observer(UpsertRetailData));

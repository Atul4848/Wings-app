import React, { FC, useEffect, useState } from 'react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { fields } from './Fields';
import {
  IClasses,
  Utilities,
  IOptionValue,
  IAPIGridRequest,
  UIStore,
  IAPISearchFiltersDictionary,
} from '@wings-shared/core';
import { Box, Switch, Typography, withStyles } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { styles } from './Slide1.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SlidesApprovalStore } from 'apps/vendor-management/src/Stores';
import { Slide1Model } from '../../../../Shared/Models/Slide1.model';
import { useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { useGridState } from '@wings-shared/custom-ag-grid';
import { ConfirmNavigate } from '@wings-shared/layout';
import { finalize, takeUntil } from 'rxjs/operators';

interface Props {
  classes?: IClasses;
  slidesApprovalStore: SlidesApprovalStore;
  activeStep: number;
  setActiveStep: React.Dispatch<number>;
  // onNextButtonDisable: (boolean) => void;
}

const Slide1: FC<Props> = ({
  classes,
  slidesApprovalStore,
  activeStep,
  setActiveStep,
  // onNextButtonDisable,
}) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<Slide1Model>({}, fields, {});
  const formRef = useUpsert.form;
  const [ countryList, setCountryList ] = useState([]);
  const [ statesList, setStatesList ] = useState([]);

  const validateForm = () => {
    return !formRef.isValid || formRef.hasError;
  };
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'id',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'vendorId',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'airportReference',
            type: EDITOR_TYPES.DROPDOWN,
            // options: vendorLocationStore.airportList,
            isHalfFlex: true,
            // isHidden: slideOneAndTwoStore.toggleSwitch,
          },
          {
            fieldKey: 'locationName',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Location Name*',
            isHalfFlex: true,
          },
          {
            fieldKey: 'companyLegalName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'companyWebsite',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'accountReceivableContactName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'accountReceivableContactPhone',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
        ],
      },
    ];
  };

  const errorHandler = (errors: object, id): void => {
    Object.values(errors)?.forEach(errorMessage => useUpsert.showAlert(errorMessage[0], id));
  };

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    const params = {
      vendorId: slidesApprovalStore.vendorId,
      locationUniqueCode: slidesApprovalStore.locationUniqueCode,
    };
    slidesApprovalStore
      .getSlide1Approval(params)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((response: Slide1Model) => {
        if (response[0]) {
          useUpsert.setFormValues(Slide1Model.deserialize(response[0]));
        }
      });
  };

  const onValueChange = (option, fieldKey) => {
    
  }
  return (
    <>
      <Box>
        <Typography className={classes.heading}>Add your location based on</Typography>
        <div className={classes.toggle}>
          <Typography>ICAO</Typography>
          <Switch
            checked={false}
            onChange={()=>{}}
            color="primary"
            name="switch"
            disabled
          />
          <Typography style={{ color:' #7C7C7C' }}>Country & City</Typography>
        </div>
        <div className={classes.editorWrapperContainer}>
          <ViewInputControlsGroup
            groupInputControls={groupInputControls()}
            onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
            onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
            field={fieldKey => useUpsert.getField(fieldKey)}
          />
        </div>
      </Box>
    </>
  );
};

export default inject('slidesApprovalStore', 'vendorManagementStore')(withStyles(styles)(observer(Slide1)));

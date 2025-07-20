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
  SEARCH_ENTITY_TYPE,
} from '@wings-shared/core';
import { Box, Switch, Tooltip, Typography, withStyles } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { styles } from './Slide4.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SlidesApprovalStore, VendorManagementStore } from 'apps/vendor-management/src/Stores';
import { Slide4Model } from '../../../../Shared/Models/Slide4.model';
import { CountryModel, StateModel, useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { useGridState } from '@wings-shared/custom-ag-grid';
import { ConfirmNavigate } from '@wings-shared/layout';
import { finalize, takeUntil } from 'rxjs/operators';
import OperatingHoursAddData from '../../../../Shared/Components/OperatingHoursAddData/OperatingHoursAddData';
import { forkJoin } from 'rxjs';
import { LocationHoursModel } from 'apps/vendor-management/src/Modules/Shared';

interface Props {
  classes?: IClasses;
  slidesApprovalStore: SlidesApprovalStore;
  vendorManagementStore: VendorManagementStore;
  activeStep: number;
  setActiveStep: React.Dispatch<number>;
  // onNextButtonDisable: (boolean) => void;
}

const Slide4: FC<Props> = ({
  classes,
  slidesApprovalStore,
  vendorManagementStore,
  activeStep,
  setActiveStep,
  // onNextButtonDisable,
}) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<Slide4Model>({}, fields, {});
  const formRef = useUpsert.form;
  const [ countryList, setCountryList ] = useState([]);
  const [ statesList, setStatesList ] = useState([]);

  const validateForm = () => {
    return !formRef.isValid || formRef.hasError;
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const isCountrySelected = (): boolean => {
    const { value } = useUpsert.getField('countryReference');
    return Boolean((value as CountryModel)?.id);
  };

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
            fieldKey: 'addressLine1',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
          },
          {
            fieldKey: 'addressLine1',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'addressType',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: true,
          },
          {
            fieldKey: 'countryReference',
            type: EDITOR_TYPES.DROPDOWN,
            options: countryList,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
            isHalfFlex: true,
          },
          {
            fieldKey: 'stateReference',
            type: EDITOR_TYPES.DROPDOWN,
            options: statesList,
            isDisabled: !isCountrySelected(),
            searchEntityType: SEARCH_ENTITY_TYPE.STATE,
            getOptionLabel: state => (state as StateModel)?.label,
            isHalfFlex: true,
          },
          {
            fieldKey: 'cityReference',
            type: EDITOR_TYPES.DROPDOWN,
            options: vendorManagementStore.cities,
            // isDisabled: !isCountrySelected(),
            isHalfFlex: true,
          },
          {
            fieldKey: 'zipCode',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'airfieldLocation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'arinc',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'overTimeRequested',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'advanceOverTimeRequested',
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
    forkJoin([
      slidesApprovalStore.getSlide4Approval(params),
      slidesApprovalStore.getOnBoardingHours(slidesApprovalStore.vendorId, slidesApprovalStore.tempLocationId),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((response: [Slide4Model, LocationHoursModel]) => {
        if (response[0]?.results) {
          useUpsert.setFormValues(Slide4Model.deserialize(response[0]?.results));
        }
      });
  };

  const onValueChange = (option, fieldKey) => {};

  return (
    <>
      <Box>
        <Typography className={classes.heading}>
          If you have an office at this airport, please fill out the fields below:
        </Typography>
        <div className={classes.editorWrapperContainer}>
          <ViewInputControlsGroup
            groupInputControls={groupInputControls()}
            onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
            onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
            field={fieldKey => useUpsert.getField(fieldKey)}
          />
          <div className="mainOperationalHoursWrapper">
            <Typography className={classes.secondaryHeading}>Operating Hours</Typography>
            <OperatingHoursAddData />
          </div>
        </div>
      </Box>
    </>
  );
};

export default inject('slidesApprovalStore', 'vendorManagementStore')(withStyles(styles)(observer(Slide4)));

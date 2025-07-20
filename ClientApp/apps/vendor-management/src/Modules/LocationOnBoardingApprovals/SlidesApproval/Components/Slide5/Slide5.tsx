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
import { styles } from './Slide5.styles';
import { SlidesApprovalStore } from 'apps/vendor-management/src/Stores';
import { Slide5Model } from '../../../../Shared/Models/Slide5.model';
import { useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { useGridState } from '@wings-shared/custom-ag-grid';
import { finalize, takeUntil } from 'rxjs/operators';

interface Props {
  classes?: IClasses;
  slidesApprovalStore: SlidesApprovalStore;
  activeStep: number;
  setActiveStep: React.Dispatch<number>;
}

const Slide5: FC<Props> = ({
  classes,
  slidesApprovalStore,
  activeStep,
  setActiveStep,
  // onNextButtonDisable,
}) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<Slide5Model>({}, fields, {});
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
        title: 'General Information:',
        inputControls: [
          {
            fieldKey: 'id',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'coordinatingOffice',
            type: EDITOR_TYPES.DROPDOWN,
            isHalfFlex: true,
            isHidden: !slidesApprovalStore.ICAOcode,
          },
          {
            fieldKey: 'legalBusinessName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
            isHidden: !slidesApprovalStore.ICAOcode,
          },
          {
            fieldKey: 'vendorName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
            isHidden: !slidesApprovalStore.ICAOcode,
          },
          {
            fieldKey: 'managerName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'assitManagerName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'opsPrimaryPhoneNo',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'opsSecondaryPhoneNo',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'opsFaxNo',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'opsPrimaryEmail',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'opsSecondaryEmail',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
        ],
      },
    ];
  };

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    const params = {
      vendorId: slidesApprovalStore.vendorId,
      locationUniqueCode: slidesApprovalStore.locationUniqueCode,
    };
    slidesApprovalStore
      .getSlide8Approval(params)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((response: Slide5Model) => {
        console.log('Slide5', response[0]);
        if (response) {
          useUpsert.setFormValues(Slide5Model.deserialize(response[0]));
        }
      });
  };
  const onValueChange = (option, fieldKey) => {};
  return (
    <>
      <Box>
        <Typography className={classes.heading}>All communications for Handling is to be directed to:</Typography>
        <div className={classes.toggle}>
          <Typography>Self</Typography>
          <Switch checked={slidesApprovalStore.ICAOcode} onChange={() => {}} color="primary" name="switch" disabled />
          <Typography style={{ color: ' #7C7C7C' }}>Other</Typography>
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

export default inject('slidesApprovalStore', 'vendorManagementStore')(withStyles(styles)(observer(Slide5)));

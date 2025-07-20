import React, { FC, useCallback, useEffect, useState } from 'react';
import { useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useBaseUpsertComponent } from '@wings/shared';
import {
  IClasses,
  Utilities,
  IOptionValue,
  UIStore,
  IAPISearchFiltersDictionary,
  IAPIGridRequest,
  IAPIPageResponse,
} from '@wings-shared/core';
import { TextField, Typography, withStyles } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { fields } from './Fields';
import { SlidesApprovalStore } from 'apps/vendor-management/src/Stores';
import { Slide6Model } from '../../../../Shared/Models/Slide6.model';
import { debounce } from 'lodash-es';
import { Autocomplete } from '@material-ui/lab';
import { styles } from './Slide6.style';

interface Props {
  classes?: IClasses;
  slidesApprovalStore: SlidesApprovalStore;
  activeStep: number;
  setActiveStep: React.Dispatch<number>;
}

const Slide6: FC<Props> = ({ classes, slidesApprovalStore, activeStep, setActiveStep }) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<Slide6Model>({}, fields);
  const [ vendorLocationList, setVendorLocationList ] = useState<Slide6Model[]>([]);
  const formRef = useUpsert.form;

  //   const saveData = () => {
  //     upsertSlideNine();
  //   };

  const isOtherFieldExist = () => {
    return Boolean(useUpsert.getField('groundServiceProviderAppliedVendorLocation').value?.id === 99999999);
  };
  
  useEffect(() => {
    loadInitialData();
  }, [ activeStep ]);

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
            fieldKey: 'legalBusinessName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
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
            // isDisabled: !isOtherFieldExist(),
          },
          {
            fieldKey: 'primaryPhoneNo',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
            // isDisabled: !isOtherFieldExist(),
          },
          {
            fieldKey: 'secondaryPhoneNo',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
            // isDisabled: !isOtherFieldExist(),
          },
          {
            fieldKey: 'fax',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
            // isDisabled: !isOtherFieldExist(),
          },
          {
            fieldKey: 'email',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
            // isDisabled: !isOtherFieldExist(),
          },
          {
            fieldKey: 'secondaryEmail',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
            // isDisabled: !isOtherFieldExist(),
          },
        ],
      },
    ];
  };

  const errorHandler = (errors: object, id): void => {
    Object.values(errors)?.forEach(errorMessage => useUpsert.showAlert(errorMessage[0], id));
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      default:
        break;
    }
  };

  const resetFields = () => {
    useUpsert.getField('primaryPhoneNo').set(null);
    useUpsert.getField('email').set(null);
    useUpsert.getField('secondaryPhoneNo').set(null);
    useUpsert.getField('secondaryEmail').set(null);
    useUpsert.getField('fax').set(null);
    useUpsert.getField('managerName').set(null);
    useUpsert.getField('assitManagerName').set(null);
    useUpsert.getField('legalBusinessName').set(null);
  };

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    slidesApprovalStore
      .getByVendorIdSlideNine(slidesApprovalStore.tempLocationId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((response: Slide6Model) => {
        const data = Slide6Model.deserialize(response);
        useUpsert.setFormValues(data);
      });
  };

  return (
    <>
      <Typography className={classes.heading}>
        If you are coordinating with a local handler, please provide their information as follows:
      </Typography>
      <div className={classes.editorWrapperContainer}>
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          //   onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
          field={fieldKey => useUpsert.getField(fieldKey)}
          //   onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
          onFocus={fieldKey => onFocus(fieldKey)}
          onValueChange={function(option: IOptionValue, fieldKey: string): void {
            throw new Error('Function not implemented.');
          }}
        />
      </div>
    </>
  );
};

export default inject('slidesApprovalStore', 'vendorManagementStore')(withStyles(styles)(observer(Slide6)));

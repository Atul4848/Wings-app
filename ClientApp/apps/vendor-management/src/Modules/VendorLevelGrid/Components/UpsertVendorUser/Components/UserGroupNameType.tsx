import {
  IAPIGridRequest,
  IAPISearchFiltersDictionary,
  IOptionValue,
  UIStore,
  Utilities,
  ViewPermission,
} from '@wings-shared/core';
import React, { FC, useEffect, useRef, useState } from 'react';
import { VendorUserStore } from '../../../../../Stores';
import { NavigateFunction, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { useStyles } from '../../UpsertVendor.styles';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useGridState } from '@wings-shared/custom-ag-grid';
import { useVMSModuleSecurity } from '../../../../Shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { addUserEmailPhoneField } from '../Fields';
import ViewInputControls from '../../../../Shared/Components/ViewInputControls/ViewInputControls';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { VendorUserModel } from '../../../../Shared/Models/VendorUser.model';

interface Props {
  searchFilters: IAPISearchFiltersDictionary;
  vendorUserStore: VendorUserStore;
  navigate: NavigateFunction;
}

const UserGroupNameType: FC<Props> = ({
  vendorUserStore,
  searchFilters,
}) => {
  const params = useParams();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent<VendorUserModel>(params, addUserEmailPhoneField, searchFilters);
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const formRef = useUpsert.form;
  const previousUsername = useRef<string>('');
  const isEditable = useUpsert.isEditable && vmsModuleSecurityV2.isEditable;
  const [ isOptedSms, setIsOptedSms ] = useState(false);

  useEffect(() => {
    useUpsert.setViewMode((params?.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }, []);

  const groupInputControlsEmail = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'username',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
          },
          {
            fieldKey: 'phoneNo',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
          },
          {
            fieldKey: 'email',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
          },
          {
            fieldKey: 'isOptedSms',
            type: EDITOR_TYPES.CHECKBOX,
            isFullFlex: true,
          },
        ],
      },
    ];
  };

  const findExistingEmail = (): void => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      searchCollection: JSON.stringify([
        {
          propertyName: 'username',
          propertyValue: useUpsert.getField('username').value,
        },
      ]),
    };

    UIStore.setPageLoader(true);
    vendorUserStore
      .getOktaUserData(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        (response: any) => {
          const vendorUser = response.results.length ? response.results[0] : null;
          const phoneNo = vendorUser?.phoneNo || '';
          const email = vendorUser?.email || '';
          vendorUserStore.vendorUserData.phoneNo = phoneNo;
          vendorUserStore.vendorUserData.email = email;
          useUpsert.getField('phoneNo').set(phoneNo);
          useUpsert.getField('email').set(email);
          useUpsert.getField('isOptedSms').set(isOptedSms);
        },
        error => {
          if (error.response?.data.IsSuccess === false) {
            return useUpsert.showAlert(error.response?.data.Summary, '0');
          } else useUpsert.showAlert(error.message, '0');
        }
      );
  };

  const handleSubmit = () => {
    vendorUserStore.vendorUserData.isDataAvailable = true;
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    const _value = value as string;
    const _isOptedSmsValue = value as boolean;
    
    switch (fieldKey) {
      case 'phoneNo':
        vendorUserStore.vendorUserData.phoneNo = _value;
        break;
      case 'email':
        vendorUserStore.vendorUserData.email = _value;
        break;
      case 'username':
        vendorUserStore.vendorUserData.username = _value;
        break;
      case 'isOptedSms':
        setIsOptedSms(_isOptedSmsValue);
        break;
      default:
        break;
    }

    useUpsert.getField(fieldKey).set(value);
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const onBlur = (fieldKey: string) => {
    if (fieldKey === 'username') {
      const currentUsername = useUpsert.getField('username').value;
      if (previousUsername.current !== currentUsername && currentUsername.length > 2) {
        previousUsername.current = currentUsername;
        findExistingEmail();
      }
    }
  };

  return (
    <div className={classes.editorWrapperContainer}>
      <ViewInputControls
        isEditable={isEditable}
        groupInputControls={groupInputControlsEmail()}
        onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
        onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
        field={fieldKey => useUpsert.getField(fieldKey)}
        onBlur={fieldKey => onBlur(fieldKey)}
      />
      
      <ViewPermission hasPermission={useUpsert.isEditable && !vendorUserStore.vendorUserData.isDataAvailable}>
        <PrimaryButton
          variant="contained"
          color="primary"
          onClick={() => handleSubmit()}
          disabled={(formRef.hasError || !isOptedSms)}
        >
          Next
        </PrimaryButton>
      </ViewPermission>
    </div>
  );
};

export default inject(
  'vendorUserStore'
)(observer(UserGroupNameType));

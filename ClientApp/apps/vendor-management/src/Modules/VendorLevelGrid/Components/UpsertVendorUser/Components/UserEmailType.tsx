import {
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPISearchFiltersDictionary,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  ViewPermission,
} from '@wings-shared/core';
import React, { FC, useEffect } from 'react';
import { SettingsStore, VendorLocationStore, VendorManagementStore, VendorUserStore } from '../../../../../Stores';
import { NavigateFunction, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { useStyles } from '../../UpsertVendor.styles';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useGridState } from '@wings-shared/custom-ag-grid';
import { VendorUserModel, useVMSModuleSecurity } from '../../../../Shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { addUserEmailField } from '../Fields';
import ViewInputControls from '../../../../Shared/Components/ViewInputControls/ViewInputControls';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';

interface Props {
  settingsStore: SettingsStore;
  vendorManagementStore: VendorManagementStore;
  searchFilters: IAPISearchFiltersDictionary;
  vendorLocationStore: VendorLocationStore;
  vendorUserStore: VendorUserStore;
  navigate: NavigateFunction;
}

const UserEmailType: FC<Props> = ({
  settingsStore,
  vendorManagementStore,
  vendorLocationStore,
  vendorUserStore,
  searchFilters,
}) => {
  const params = useParams();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent<VendorUserModel>(params, addUserEmailField, searchFilters);
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const formRef = useUpsert.form;
  const isEditable = useUpsert.isEditable && vmsModuleSecurityV2.isEditable;

  useEffect(() => {
    useUpsert.setViewMode((params?.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }, []);

  const groupInputControlsEmail = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'email',
            type: EDITOR_TYPES.TEXT_FIELD,
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
          propertyName: 'email',
          propertyValue: useUpsert.getField('email').value,
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
          vendorUserStore.vendorUserData.isDataAvailable = true;
        },
        error => {
          const errorMessage = error.response?.data.IsSuccess === false ? error.response?.data.Summary : error.message;
          useUpsert.showAlert(errorMessage, '0');
        }
      );
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    vendorUserStore.vendorUserData.email = value as string;
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  return (
    <div className={classes.editorWrapperContainer}>
      <ViewInputControls
        isEditable={isEditable}
        groupInputControls={groupInputControlsEmail()}
        onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
        onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
        field={fieldKey => useUpsert.getField(fieldKey)}
      />

      <ViewPermission hasPermission={useUpsert.isEditable && !vendorUserStore.vendorUserData.isDataAvailable}>
        <PrimaryButton
          variant="contained"
          color="primary"
          onClick={() => findExistingEmail()}
          disabled={formRef.hasError}
        >
          Next
        </PrimaryButton>
      </ViewPermission>
    </div>
  );
};

export default inject(
  'settingsStore',
  'vendorLocationStore',
  'vendorManagementStore',
  'vendorUserStore'
)(observer(UserEmailType));

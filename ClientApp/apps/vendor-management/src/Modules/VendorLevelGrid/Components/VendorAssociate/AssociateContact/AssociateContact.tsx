import React, { FC, useEffect, useState } from 'react';
import {
  IAPISearchFiltersDictionary,
  IClasses,
  IOptionValue,
  UIStore,
  IAPIPageResponse,
  IAPIGridRequest,
} from '@wings-shared/core';
import { forkJoin } from 'rxjs';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import { ContactMasterStore, SettingsStore, VendorLocationStore } from '../../../../../Stores';
import { NavigateFunction, useParams } from 'react-router';
import { withStyles } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { Dialog } from '@uvgo-shared/dialog';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  SETTING_ID,
  SettingBaseModel,
  VENDOR_CONTACT_COMPARISON_FILTERS,
  VendorLocationModel,
  VendorManagmentModel,
} from '../../../../Shared';
import { inject, observer } from 'mobx-react';
import { fields, locationField } from './Fields';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { SETTING_NAME } from '../../../../Shared/Enums/SettingNames.enum';
import { ContactMasterModel } from '../../../../Shared/Models/ContactMaster.model';
import { gridFilters } from '../../../../ContactMaster/fields';
import { VendorContact } from '../../../../Shared/Models/VendorContact.model';
import { styles } from './AssociateContact.style';
import ViewInputControls from '../../../../Shared/Components/ViewInputControls/ViewInputControls';
import { VendorLocationContactModel } from '../../../../Shared/Models/VendorLocationContact.model';
import { COLLECTION_NAMES } from '../../../../Shared/Enums/CollectionName.enum';

interface Props {
  classes: IClasses;
  settingsStore: SettingsStore;
  contactMasterStore: ContactMasterStore;
  vendorLocationStore: VendorLocationStore;
  searchFilters: IAPISearchFiltersDictionary;
  selectedVendor: VendorManagmentModel;
  navigate: NavigateFunction;
  setIsVendorContactDataAdded: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: VIEW_MODE;
  vendorId: number;
  isLocationContactBtnClicked: boolean;
  setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AssociateContact: FC<Props> = ({
  classes,
  settingsStore,
  searchFilters,
  contactMasterStore,
  selectedVendor,
  setIsVendorContactDataAdded,
  viewMode,
  vendorLocationStore,
  vendorId,
  isLocationContactBtnClicked,
  setIsModelOpen,
}) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<VendorManagmentModel>(
    params,
    isLocationContactBtnClicked ? locationField : fields,
    searchFilters
  );
  const formRef = useUpsert.form;
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_CONTACT_COMPARISON_FILTERS, VendorLocationContactModel>(gridFilters, gridState);
  const [ accessLevel, setAccessLevel ] = useState([]);
  const [ usageType, setUsageType ] = useState([]);
  const [ status, setStatus ] = useState([]);

  useEffect(() => {
    useUpsert.setViewMode((viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadDropdownsData();
  }, []);

  const groupInputControl = (): IGroupInputControls[] => {
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
            fieldKey: 'contact',
            type: EDITOR_TYPES.DROPDOWN,
            options: contactMasterStore.contactList,
          },
          {
            fieldKey: 'vendorLocationIds',
            type: EDITOR_TYPES.DROPDOWN,
            options: vendorLocationStore.vendorLocationList,
            isHidden: !isLocationContactBtnClicked,
            multiple: true,
          },
          {
            fieldKey: 'contactUsegeType',
            type: EDITOR_TYPES.DROPDOWN,
            options: usageType,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: status,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: accessLevel,
          },
        ],
      },
    ];
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  const loadDropdownsData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(false);
    useUpsert.getField('id').set(0);
    settingsStore.getSettings(SETTING_ID.SETTING_ACCESS_LEVEL, SETTING_NAME.ACCESS_LEVEL).subscribe(response => {
      setAccessLevel(response.results);
    });
    settingsStore.getSettings(SETTING_ID.SETTING_USAGES_TYPE, SETTING_NAME.CONTACT_TYPE).subscribe(response => {
      setUsageType(response.results);
    });
    settingsStore.getSettings(SETTING_ID.SETTINGS_CONTACT_STATUS, 'ContactStatus').subscribe(response => {
      setStatus(response.results);
    });
    const locationRequest: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        {
          propertyName: 'Vendor.Id',
          propertyValue: vendorId,
        },
      ]),
    };
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    forkJoin([
      contactMasterStore?.getVMSComparison(COLLECTION_NAMES.CONTACT),
      vendorLocationStore?.getVMSComparison(locationRequest),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: [IAPIPageResponse<ContactMasterModel>, IAPIPageResponse<VendorLocationModel>]) => {
        UIStore.setPageLoader(false);
      });
  };

  const onSearch = (searchValue: string, fieldKey: string): void => {
    switch (fieldKey) {
      case 'accessLevel':
        setAccessLevel(
          settingsStore.vendorAccessLevel.filter(data => {
            return data.label?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase());
          })
        );
        break;
      case 'status':
        setStatus(
          settingsStore.vendorContactStatus.filter(data => {
            return data.label?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase());
          })
        );
        break;
      case 'contactUsegeType':
        setUsageType(
          settingsStore.vendorContactUsageType.filter(data => {
            return data.label?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase());
          })
        );
        break;
      case 'contact':
        const contactFilter = searchValue
          ? [
            {
              propertyName: 'Contact',
              propertyValue: searchValue,
            },
            {
              propertyName: 'ContactName',
              operator: 'or',
              propertyValue: searchValue,
            },
            {
              propertyName: 'ContactMethod.Name',
              operator: 'or',
              propertyValue: searchValue,
            },
            {
              propertyName: 'ContactType.Name',
              operator: 'or',
              propertyValue: searchValue,
            },
          ]
          : [];
        const request: IAPIGridRequest = {
          searchCollection: JSON.stringify(contactFilter),
        };
        contactMasterStore?.getVMSComparison(COLLECTION_NAMES.CONTACT, request).subscribe();
        break;
      case 'vendorLocationIds':
        if (!searchValue) {
          const locationRequest: IAPIGridRequest = {
            filterCollection: JSON.stringify([
              {
                propertyName: 'Vendor.Id',
                propertyValue: vendorId,
              },
            ]),
          };
          vendorLocationStore?.getVMSComparison(locationRequest).subscribe();
          return;
        }
        const locationFilter = searchValue
          ? [
            {
              propertyName: 'Name',
              propertyValue: searchValue,
            },
            {
              propertyName: 'Code',
              propertyValue: searchValue,
              operator: 'or',
            },
            {
              propertyName: 'AirportReference.DisplayCode',
              propertyValue: searchValue,
              operator: 'or',
            },
          ]
          : [];
        const locationRequest: IAPIGridRequest = {
          searchCollection: JSON.stringify(locationFilter),
          filterCollection: JSON.stringify([
            {
              propertyName: 'Vendor.Id',
              propertyValue: vendorId,
            },
          ]),
        };
        vendorLocationStore?.getVMSComparison(locationRequest).subscribe();
        break;
      default:
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'vendorLocationIds':
        const locationRequest: IAPIGridRequest = {
          filterCollection: JSON.stringify([
            {
              propertyName: 'Vendor.Id',
              propertyValue: vendorId,
            },
          ]),
        };
        vendorLocationStore?.getVMSComparison(locationRequest).subscribe();
        break;
      default:
        break;
    }
  };

  const dialogContent = () => {
    return (
      <>
        <div className={classes.modalDetail}>
          <ViewInputControls
            isEditable={true}
            groupInputControls={groupInputControl()}
            onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
            onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
            field={fieldKey => useUpsert.getField(fieldKey)}
            onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
            classes={{
              flexRow: classes.fullFlex,
            }}
            onFocus={fieldKey => onFocus(fieldKey)}
          />
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => (formRef.changed ? setIsModelOpen(true) : ModalStore.close())}
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => {
                isLocationContactBtnClicked ? upsertVendorLocationContact() : upsertVendorContact();
              }}
              disabled={formRef.hasError || !formRef.changed}
            >
              Save
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  };

  const upsertVendorContact = () => {
    UIStore.setPageLoader(true);
    const request = new VendorContact({ ...useUpsert.form.values(), vendor: selectedVendor });
    contactMasterStore
      ?.upsertVendorContact(request.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: VendorContact) => {
          setIsVendorContactDataAdded(true);
          ModalStore.close();
        },
        error: error => {
          useUpsert.showAlert(error.message, request.id);
        },
      });
  };

  const upsertVendorLocationContact = () => {
    UIStore.setPageLoader(true);
    const request = new VendorLocationContactModel({ ...useUpsert.form.values() });
    const locationIds = request.vendorLocationIds.map(value => value.id);
    contactMasterStore
      ?.upsertVendorLocationContact(request.serialize(locationIds, [ 0 ], vendorId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: VendorLocationContactModel) => {
          setIsVendorContactDataAdded(true);
          ModalStore.close();
        },
        error: error => {
          useUpsert.showAlert(<div className={classes.warningErrorMessage}>{error.message}</div>, request.id)
        },
      });
  };

  return (
    <Dialog
      title={isLocationContactBtnClicked ? 'Associate Location Contact:' : 'Associate Contact:'}
      open={true}
      onClose={() => (formRef.changed ? setIsModelOpen(true) : ModalStore.close())}
      dialogContent={() => dialogContent()}
      disableBackdropClick={true}
    />
  );
};

export default inject(
  'settingsStore',
  'contactMasterStore',
  'vendorManagementStore',
  'vendorLocationStore'
)(withStyles(styles)(observer(AssociateContact)));

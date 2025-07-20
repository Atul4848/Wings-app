import {
  DATE_FORMAT,
  GRID_ACTIONS,
  StatusTypeModel,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import {
  AuditFields,
  EDITOR_TYPES,
  ViewInputControlsGroup,
  IGroupInputControls,
  IPagination,
} from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomerRefModel, ModelStatusOptions, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fields } from './fields';
import { useStyles } from './AssociatedRegistryGeneralUpsert.style';
import { CustomerStore, EntityMapStore, RegistryStore, SettingsStore, TeamStore } from '../../../Stores';
import { AssociatedRegistriesModel, RegistryModel } from '../../../Models';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { upsertAssociatedRegistryBackNavLink } from '../../CustomerSidebarOptions/CustomerSidebarOptions';
import { useCustomerModuleSecurity } from '../../../Tools';

interface Props {
  registryStore?: RegistryStore;
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
  entityMapStore?: EntityMapStore;
  teamStore?: TeamStore;
}

const AssociatedRegistryGeneralUpsert: FC<Props> = ({
  registryStore,
  settingsStore,
  customerStore,
  entityMapStore,
  teamStore,
}: Props) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const _useConfirmDialog = useConfirmDialog();
  const useUpsert = useBaseUpsertComponent<AssociatedRegistriesModel>(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const navigate = useNavigate();
  const _registryStore = registryStore as RegistryStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _teamStore = teamStore as TeamStore;
  const _customerStore = customerStore as CustomerStore;
  const _entityMapStore = entityMapStore as EntityMapStore;
  const [ isStatusDisabled, setStatusDisabled ] = useState(false);
  const customerModuleSecurity = useCustomerModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.registryViewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    if (!useUpsert.isAddNew) {
      useUpsert.getField('startDate').set(new Date());
    }
    if (_registryStore.selectedAssociatedRegistry.id) {
      loadInitialData();
    }
  }, [ _registryStore.selectedAssociatedRegistry.id ]);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    if (!params.registryId) {
      return;
    }
    useUpsert.setFormValues(_registryStore.selectedAssociatedRegistry);
  };

  const isEndDate = () => {
    return Boolean(_registryStore.selectedAssociatedRegistry.endDate);
  };

  const isStatusActive = () =>
    Utilities.isEqual('Active', _registryStore.selectedAssociatedRegistry.status?.name || '');

  /* istanbul ignore next */
  const setStatus = value => {
    if (
      !Utilities.isDateInThePast(value) &&
      !Utilities.isSameDate(value, Utilities.getCurrentDate, DATE_FORMAT.API_DATE_FORMAT)
    ) {
      useUpsert.getField('status').set(new StatusTypeModel({ id: 1, name: 'Active' }));
      return;
    }
    useUpsert.getField('status').set(new StatusTypeModel({ id: 2, name: 'InActive' }));
    setStatusDisabled(true);
  };

  const onValueChange = (value, fieldKey): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'registry':
        useUpsert.getField('status').set(value?.status);
        useUpsert.getField('accessLevel').set(value?.accessLevel);
        useUpsert.getField('sourceType').set(value?.sourceType);
        break;
      case 'endDate':
        const endDate = _registryStore.selectedAssociatedRegistry.endDate;
        setStatusDisabled(false);
        if (!value) return;
        if (useUpsert.isAddNew) {
          setStatus(value);
          return;
        }
        _useConfirmDialog.confirmAction(
          () => {
            ModalStore.close();
            setStatus(value);
          },
          {
            onNo: () => {
              useUpsert.getField(fieldKey).set(endDate), ModalStore.close();
            },
            title: 'Confirmation',
            message:
              !Utilities.isDateInThePast(value) &&
              !Utilities.isSameDate(value, Utilities.getCurrentDate, DATE_FORMAT.API_DATE_FORMAT)
                ? 'The selected end date will be set for all sites associated with the Customer Associated Registry.'
                : Utilities.isSameDate(value, Utilities.getCurrentDate, DATE_FORMAT.API_DATE_FORMAT)
                  ? 'Since the selected end date is set to today\'s date, the Customer Associated' +
                  'Registry will be marked as InActive and the selected' +
                  ' end date will be set for all sites associated with the Customer Associated Registry.'
                  : 'Since the selected end date is in the past as of today, ' +
                  'the Customer Associated Registry will be marked as InActive and the selected ' +
                  'end date will be set for all sites associated with the Customer Associated Registry.',
            onClose: () => {
              useUpsert.getField(fieldKey).set(endDate), ModalStore.close();
            },
          }
        );
        break;
      default:
        break;
    }
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'registry',
            type: EDITOR_TYPES.DROPDOWN,
            options: _registryStore.registryList,
            isDisabled: !useUpsert.isAddNew,
            isServerSideSearch: true,
            pagination: unsubscribe.pagination.get('registry'),
          },
          {
            fieldKey: 'startDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('endDate').value,
            isDisabled: isEndDate(),
          },
          {
            fieldKey: 'endDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            minDate: useUpsert.getField('startDate').value,
            isDisabled: isEndDate(),
          },
          {
            fieldKey: 'team',
            type: EDITOR_TYPES.DROPDOWN,
            options: _teamStore.teams,
          },
          {
            fieldKey: 'associatedRegistryServiceTypes',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _entityMapStore.serviceType,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.accessLevels,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
            isDisabled:
              (isEndDate() &&
                (Utilities.isDateInThePast(_registryStore.selectedAssociatedRegistry.endDate) ||
                  Utilities.isSameDate(
                    _registryStore.selectedAssociatedRegistry.endDate,
                    Utilities.getCurrentDate,
                    DATE_FORMAT.API_DATE_FORMAT
                  ))) ||
              isStatusDisabled,
          },
        ],
      },
    ];
  };

  /* istanbul ignore next */
  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'team':
        useUpsert.observeSearch(_teamStore.getTeams());
        break;
      case 'associatedRegistryServiceTypes':
        useUpsert.observeSearch(_entityMapStore.getServiceType());
        break;
    }
  };

  /* istanbul ignore next */
  const upsertAssociateRegistry = (isStatusUpdated = false): void => {
    if (isStatusUpdated) {
      useUpsert.getField('status').set(new StatusTypeModel({ id: 1, name: 'Active' }));
      useUpsert.getField('endDate').set('');
      setStatusDisabled(false);
    }
    const request = new AssociatedRegistriesModel({
      ..._registryStore.selectedAssociatedRegistry,
      ...useUpsert.form.values(),
      customer: new CustomerRefModel({
        name: _customerStore.selectedCustomer.name,
        number: _customerStore.selectedCustomer.number,
        startDate: _customerStore.selectedCustomer.startDate,
        endDate: _customerStore.selectedCustomer.endDate,
      }),
    });
    const isAddNew: boolean = request.id === 0;
    UIStore.setPageLoader(true);
    _registryStore
      .upsertAssociatedRegistry(request, _customerStore.selectedCustomer.partyId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AssociatedRegistriesModel) => {
          const { associatedRegistries } = _customerStore.selectedCustomer;
          useUpsert.form.reset();
          _registryStore.selectedAssociatedRegistry = response;
          useUpsert.setFormValues(response);
          _customerStore.selectedCustomer.associatedRegistries = Utilities.updateArray<AssociatedRegistriesModel>(
            associatedRegistries,
            response,
            {
              replace: !isAddNew,
              predicate: t => t.id === response.id,
            }
          );
          if (Utilities.isEqual(params.registryViewMode || '', VIEW_MODE.DETAILS)) {
            useUpsert.setViewMode(VIEW_MODE.DETAILS);
          }
          if (!request?.id) {
            navigate(
              `${upsertAssociatedRegistryBackNavLink(params.customerNumber || '', params.viewMode || '')}/${
                response.registry?.id
              }/edit`,
              useUpsert.noBlocker
            );
          }
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertAssociatedRegistry');
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  // Search Entity based on field value
  const onSearch = (
    searchValue: string,
    fieldKey: string,
    searchEntityType?: string,
    pagination?: IPagination
  ): void => {
    if (fieldKey !== 'registry') return;
    if (searchValue.length < 2) return;
    const request = {
      pageNumber: pagination?.pageNumber,
      searchCollection: JSON.stringify([{ propertyName: 'Name', propertyValue: searchValue, searchType: 'start' }]),
    };
    UIStore.setPageLoader(true);
    _registryStore
      .getRegistriesNoSql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const { results } = response;
        response.results = [];
        unsubscribe.setPagination('registry', response);
        const filteredRegistries = results.filter(({ status }: RegistryModel) => status?.name === 'Active');
        const isFirstPage = Utilities.isEqual(pagination?.pageNumber || 0, 1);
        _registryStore.registryList = isFirstPage
          ? filteredRegistries
          : [ ..._registryStore.registryList, ...filteredRegistries ];
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertAssociateRegistry();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.TOGGLE_STATUS:
        _useConfirmDialog.confirmAction(
          () => {
            upsertAssociateRegistry(true), ModalStore.close();
          },
          {
            title: 'Confirm Activation',
            message: 'Are you sure you want to activate the associated registry?',
          }
        );
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.registryViewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(_registryStore.selectedAssociatedRegistry);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(upsertAssociatedRegistryBackNavLink(params.customerNumber || '', params.viewMode || ''));
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_customerStore.selectedCustomer?.name}
        backNavTitle="Associated Registry"
        backNavLink={params && upsertAssociatedRegistryBackNavLink(params.customerNumber || '', params.viewMode || '')}
        disableActions={useUpsert.isActionDisabled}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={customerModuleSecurity.isEditable}
        onAction={action => onAction(action)}
        showBreadcrumb={true}
        showStatusButton={!useUpsert.isAddNew && !isStatusActive()}
        showEditControlls={true}
        isActive={isStatusActive()}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched || useUpsert.form.changed}>
      <DetailsEditorWrapper
        isBreadCrumb={true}
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={useUpsert.getField}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.loader.isLoading}
          onFocus={onFocus}
          onValueChange={onValueChange}
          onSearch={onSearch}
        />
        <AuditFields
          isNew={useUpsert.isAddNew}
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={useUpsert.getField}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'registryStore',
  'settingsStore',
  'customerStore',
  'entityMapStore',
  'teamStore'
)(observer(AssociatedRegistryGeneralUpsert));

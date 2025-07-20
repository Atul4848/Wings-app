import { baseEntitySearchFilters, GRID_ACTIONS, IOptionValue, UIStore, Utilities } from '@wings-shared/core';
import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  CustomerStore,
  RegistryModel,
  ManageRegistriesModel,
  RegistryStore,
  SettingsStore,
  TeamStore,
  useCustomerModuleSecurity,
} from '../../../Shared';
import { fields } from './fields';
import { debounce } from '@material-ui/core';

interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
  customerStore?: CustomerStore;
  registryStore?: RegistryStore;
  teamStore?: TeamStore;
}

const ManageRegistries: FC<Props> = ({ title, customerStore, registryStore, teamStore }: Props) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<ManageRegistriesModel>(params, fields, baseEntitySearchFilters);
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const _registryStore = registryStore as RegistryStore;
  const _customerStore = customerStore as CustomerStore;
  const _teamStore = teamStore as TeamStore;
  const _customer = useMemo(() => _customerStore.selectedCustomer, [ _customerStore.selectedCustomer ]);
  const _associatedOffices = useMemo(() => _customer.associatedOffices, [ _customer ]);
  const _associatedRegistries = useMemo(
    () =>
      _customer.associatedRegistries
        .filter(x => x.isActive)
        .map(x => new RegistryModel({ id: x.id, name: x.registry.name })),
    [ _customer ]
  );
  const customerModuleSecurity = useCustomerModuleSecurity();
  /* istanbul ignore next */
  const onFocus = (fieldKey: string): void => {
    if (fieldKey === 'team') {
      useUpsert.observeSearch(_teamStore.getTeams());
    }
  };

  /* istanbul ignore next */
  const updateRegistry = (): void => {
    const { registries, includeAllRegistry } = useUpsert.form.values();
    const request = new ManageRegistriesModel({
      ...useUpsert.form.values(),
      partyId: _customer.partyId,
      customerNumber: params.customerNumber,
      registries: includeAllRegistry ? [] : registries,
    });
    UIStore.setPageLoader(true);
    _registryStore
      .manageRegistry(request.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ManageRegistriesModel) => {
          useUpsert.form.reset();
          const url = window.location.pathname.replace('/manage-registries', '');
          debounce(navigate, 200)(url);
        },
        error: e => useUpsert.showAlert(e.message, 'upsertRegistry'),
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        updateRegistry();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate('/customer');
        break;
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string) => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'includeAllRegistry':
        useUpsert.getField('registries').set(value ? _associatedRegistries : []);
        break;
      case 'registries':
        const { registries } = useUpsert.form.values();
        if (registries.length < _associatedRegistries.length) {
          useUpsert.getField('includeAllRegistry').set(false);
        }
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
    }
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'includeAllRegistry',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'registries',
            type: EDITOR_TYPES.DROPDOWN,
            options: _associatedRegistries,
            multiple: true,
            isFullFlex: true,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'team',
            type: EDITOR_TYPES.DROPDOWN,
            options: _teamStore.teams,
            isHalfFlex: true,
          },
          {
            fieldKey: 'office',
            type: EDITOR_TYPES.DROPDOWN,
            options: _associatedOffices,
            isHalfFlex: true,
          },
        ],
      },
    ];
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched || useUpsert.form.changed}>
      <DetailsEditorWrapper
        isEditMode={useUpsert.isEditable}
        headerActions={
          <DetailsEditorHeaderSection
            title={title}
            backNavTitle="Customer"
            disableActions={useUpsert.isActionDisabled}
            backNavLink="/customer"
            isEditMode={useUpsert.isEditable}
            showBreadcrumb={true}
            onAction={onAction}
          />
        }
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={useUpsert.getField}
          isEditing={useUpsert.isEditable && customerModuleSecurity.isEditable}
          isLoading={useUpsert.loader.isLoading}
          onValueChange={onValueChange}
          onFocus={onFocus}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('customerStore', 'registryStore', 'teamStore')(observer(ManageRegistries));

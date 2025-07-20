import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import { forkJoin } from 'rxjs';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions } from 'ag-grid-community';
import {
  AssociatedSpecialCareModel,
  SettingsStore,
  CustomerStore,
  ENTITY_LEVEL,
  SPECIAL_CARE_FILTER,
  useCustomerModuleSecurity,
} from '../../index';
import {
  GRID_ACTIONS,
  IdNameCodeModel,
  SettingsTypeModel,
  UIStore,
  Utilities,
  ViewPermission,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { BaseUserStore, UserRefModel, useBaseUpsertComponent } from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AxiosError } from 'axios';
import { Logger } from '@wings-shared/security';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { useStyles } from '../../Styles';
interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
}

const AssociatedSpecialCare: FC<Props> = ({
  title,
  backNavTitle,
  backNavLink,
  settingsStore,
  customerStore,
}: Props) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<SPECIAL_CARE_FILTER, AssociatedSpecialCareModel>([], gridState);
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<AssociatedSpecialCareModel>(params, {}, baseEntitySearchFilters);
  const _settingsStore = settingsStore as SettingsStore;
  const _customerStore = customerStore as CustomerStore;
  const _baseUserStore = useMemo(() => new BaseUserStore(), []);
  const searchHeader = useSearchHeader();
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadSpecialCares();
  }, []);

  /* istanbul ignore next */
  const loadSpecialCares = () => {
    UIStore.setPageLoader(true);
    _customerStore
      .getAssociatedSpecialCares(_customerStore.selectedCustomer.number)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  /* istanbul ignore next */
  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([
      _settingsStore.getSourceTypes(),
      _settingsStore.getAccessLevels(),
      _settingsStore.getSpecialCareType(),
      _settingsStore.getSpecialCareTypeLevel(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const onInputChange = (params: any, value: string) => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = ({ colDef }, value: any) => {
    if (colDef.field === 'specialCareTypeLevel') {
      // Clear Existing entity
      agGrid.fetchCellInstance('specialCareTypeEntity').setValue(null);
      const { selectedCustomer } = _customerStore;
      switch (value?.name) {
        case ENTITY_LEVEL.CUSTOMER:
          agGrid.fetchCellInstance('specialCareTypeEntity').setValue(selectedCustomer);
          break;
        case ENTITY_LEVEL.OFFICE:
          const request = {
            filterCollection: JSON.stringify([{ number: selectedCustomer.number }]),
          };
          _customerStore
            .getAssociatedOffice(selectedCustomer.number, request)
            .pipe(takeUntil(unsubscribe.destroy$))
            .subscribe();
      }
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (rowIndex: number): boolean => {
    const data = agGrid._getTableItem(rowIndex);

    // save button will not enable without these keys
    const columns = [ 'specialCareType', 'person', 'specialCareTypeLevel', 'specialCareTypeEntity' ];
    const editorInstance = gridState.gridApi.getCellEditorInstances({ columns });
    const currentItem = columns.reduce((total, key, idx) => {
      if (!editorInstance[idx]?.getValue()) {
        return total;
      }
      return {
        ...total,
        [key]: editorInstance[idx]?.getValue(),
      };
    }, {});

    /* if user selected only few fields from all four 
      then needs to check the selected fields only and other fields should be null or empty */
    const currentItemKeys = Object.keys(currentItem);
    // first filter data based on first two columns if those two match then only we needs to match remaining fields
    const hasDuplicate = gridState.data
      .filter(x => x.id !== data.id)
      .some(item => {
        const isFound = currentItemKeys.every(key =>
          [ 'person' ].includes(key)
            ? Utilities.isEqual(currentItem[key]?.guid, item[key]?.guid)
            : Utilities.isEqual(currentItem[key]?.id, item[key]?.id)
        );
        if (isFound) {
          const uniqueArray = columns.filter(item => !currentItemKeys.includes(item));
          return uniqueArray.every(key => !Boolean(currentItem[key]?.id));
        }
        return isFound;
      });
    if (hasDuplicate) {
      AlertStore.important(`Combination of ${currentItemKeys.join(' and ')} should be unique`);
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertSpecialCare = (rowIndex): void => {
    if (isAlreadyExists(rowIndex)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const data: AssociatedSpecialCareModel = new AssociatedSpecialCareModel({
      ...agGrid._getTableItem(rowIndex),
      customer: _customerStore.selectedCustomer,
    });

    if (data.specialCareTypeLevel?.label?.toLowerCase() === 'customer') {
      data.specialCareTypeEntity = new IdNameCodeModel({ code: null, name: null, id: null });
    }
    UIStore.setPageLoader(true);
    _customerStore
      .upsertAssociatedSpecialCare(data, _customerStore.selectedCustomer.partyId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          agGrid._updateTableItem(rowIndex, response);
          agGrid.expandGeneralDetails();
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const searchUsers = (searchValue: string): void => {
    const request = {
      q: searchValue,
    };
    UIStore.setPageLoader(true);
    _baseUserStore
      .getUsers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const _users = response.results.filter(x => x.guid && x.email);
        _baseUserStore.users = _users.filter(x => {
          return [ x.firstName, x.lastName, x.csdUsername, x.email ]
            .filter(p => Boolean(p))
            .join(' ')
            .toLowerCase()
            .includes(searchValue?.toLowerCase());
        });
      });
  };

  /* istanbul ignore next */
  // Get entity options based on related level field
  const getEntityOptions = () => {
    const entityLevel = agGrid.getInstanceValue<SettingsTypeModel>('specialCareTypeLevel')?.label || '';
    const { associatedRegistries, associatedOperators, associatedSites } = _customerStore.selectedCustomer;
    switch (entityLevel) {
      case ENTITY_LEVEL.REGISTRY:
        return associatedRegistries.map(x => x.registry) || [];
      case ENTITY_LEVEL.OPERATOR:
        return associatedOperators.map(x => x.operator) || [];
      case ENTITY_LEVEL.SITE:
        return associatedSites;
      case ENTITY_LEVEL.OFFICE:
        return _customerStore.associatedOffices;
      default:
        return [];
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid.expandGeneralDetails(true);
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertSpecialCare(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        agGrid.expandGeneralDetails();
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Care Type',
      field: 'specialCareType',
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }) => value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Special Care Type',
        getAutoCompleteOptions: () => _settingsStore.specialCareType,
      },
    },
    {
      headerName: 'Person',
      field: 'person',
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      valueFormatter: ({ value }) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        showTooltip: true,
        placeHolder: 'Person',
        onSearch: value => searchUsers(value),
        isLoading: () => UIStore.pageLoading,
        valueGetter: (option: UserRefModel) => option,
        getOptionTooltip: option => (option as UserRefModel)?.email,
        getAutoCompleteOptions: () => _baseUserStore.users,
      },
    },
    {
      headerName: 'Level',
      field: 'specialCareTypeLevel',
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      valueFormatter: ({ value }) => value?.name || '',
      cellEditorParams: {
        placeHolder: 'Level',
        getAutoCompleteOptions: () => _settingsStore.specialCareTypeLevel,
      },
    },
    {
      headerName: 'Entity',
      field: 'specialCareTypeEntity',
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }) => value?.name || '',
      cellEditorParams: {
        isRequired: () => Boolean(agGrid.getInstanceValue<SettingsTypeModel>('specialCareTypeLevel')?.id),
        placeHolder: 'Entity',
        getAutoCompleteOptions: () => getEntityOptions(),
        getDisableState: () => {
          return !Boolean(agGrid.getInstanceValue<SettingsTypeModel>('specialCareTypeLevel')?.id);
        },
      },
    },
    ...agGrid.generalFields(_settingsStore, 'asc'),
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        hide: !useUpsert.isEditable,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
              action: GRID_ACTIONS.EDIT,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange,
        onDropDownChange,
      },
      columnDefs,
      isEditable: useUpsert.isEditView,
      gridActionProps: {
        hideActionButtons: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const {
          id,
          specialCareType,
          specialCareTypeEntity,
          specialCareTypeLevel,
          person,
        } = node.data as AssociatedSpecialCareModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [SPECIAL_CARE_FILTER.CARE_TYPE]: specialCareType.label,
              [SPECIAL_CARE_FILTER.PERSON]: person.label,
              [SPECIAL_CARE_FILTER.LEVEL]: specialCareTypeLevel.label,
              [SPECIAL_CARE_FILTER.ENTITY]: specialCareTypeEntity.label,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        loadSettingsData();
      },
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
    };
  };

  /* istanbul ignore next */
  const addAssociatedSpecialCare = () => {
    const specialCare = new AssociatedSpecialCareModel({ id: 0 });
    agGrid.expandGeneralDetails(true);
    agGrid.addNewItems([ specialCare ], { startEditing: false, colKey: 'specialCareType' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!useUpsert.isEditable || gridState.isRowEditing || UIStore.pageLoading || gridState.isProcessing}
          onClick={addAssociatedSpecialCare}
        >
          Add Association
        </PrimaryButton>
      </ViewPermission>
    );
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavTitle={backNavTitle}
        backNavLink={backNavLink}
        isEditMode={false}
        showBreadcrumb={true}
      />
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false} isBreadCrumb={true}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(SPECIAL_CARE_FILTER, SPECIAL_CARE_FILTER.CARE_TYPE) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        classes={{ customHeight: classes.customHeight }}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('settingsStore', 'customerStore')(observer(AssociatedSpecialCare));

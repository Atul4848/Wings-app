import React, { FC, useEffect, ReactNode } from 'react';
import {
  CustomAgGridReact,
  useAgGrid,
  useGridState,
  AgGridMasterDetails,
  IActionMenuItem,
} from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ICellEditorParams, RowNode, ICellEditor } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useVMSModuleSecurity } from '../../../Modules/Shared';
import { IAPIGridRequest, Utilities, GRID_ACTIONS, IClasses, cellStyle, SelectOption } from '@wings-shared/core';
import { VendorManagementStore } from '../../../Stores';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { styles } from './BankInformationCore.style';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import CustomTooltip from '../Components/Tooltip/CustomTooltip';
import { BankInformation } from '../Models/BankInformation.model';
import { VALIDATION_REGEX } from '../Enums/Spacing.enum';


interface Props {
  vendorManagementStore: VendorManagementStore;
  rightContentActionText: string;
  onSave: (rowIndex: number) => void;
  classes: IClasses;
  backNavLink: string;
  backNavTitle: string;
  loadInitialData: (pageRequest?: IAPIGridRequest, agGrid?: any, gridState?: any) => void;
  headerName: string;
  agGrid: any;
  gridState?: any;
}

const BankInformationCore: FC<Props> = ({
  vendorManagementStore,
  rightContentActionText,
  onSave,
  classes,
  backNavLink,
  backNavTitle,
  loadInitialData,
  headerName,
  agGrid,
  gridState
}) => {
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  useEffect(() => {
    vendorManagementStore.getVmsCountryCode().subscribe();
    loadInitialData();
  }, []);

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const getSelectedCellValue = (fieldKey: string): number => {
    return agGrid.fetchCellInstance(fieldKey)?.selectedOption?.id;
  };

  const onDropDownChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    const colId = params.column.getColId();
    switch (colId) {
      case 'countryReference':
        if (value === null) {
          vendorManagementStore.isCellDisable = true;
          agGrid.fetchCellInstance('stateReference')?.setValue('');
          agGrid.fetchCellInstance('cityReference')?.setValue('');
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
          return;
        }
        vendorManagementStore.states = [];
        vendorManagementStore.cities = [];
        filterStateByCountry(value);
        agGrid.fetchCellInstance('stateReference')?.setValue('');
        agGrid.fetchCellInstance('cityReference')?.setValue('');
        vendorManagementStore.isCellDisable = false;
        break;
      case 'stateReference':
        if(value){
          vendorManagementStore.cities = [];
          agGrid.fetchCellInstance('cityReference')?.setValue('');
          gridState.setHasError(true)
        }
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const filterStateByCountry = (value?: any) => {
    const filter = value
      ? JSON.stringify([
        {
          propertyName: 'Country.CountryId',
          propertyValue: value.id,
        },
      ])
      : '';

    const request: IAPIGridRequest = {
      filterCollection: filter,
    };
    vendorManagementStore.getVmsStates(request, undefined).subscribe();
  };

  const loadCities = (searchValue: string): void => {
    const filters = getSelectedCellValue('stateReference')
      ? Utilities.getFilter('State.StateId', getSelectedCellValue('stateReference'))
      : Utilities.getFilter('Country.CountryId', getSelectedCellValue('countryReference'));

    const searchCityFilter = searchValue
      ? [
        {
          propertyName: 'CommonName',
          propertyValue: searchValue,
        },
        {
          propertyName: 'OfficialName',
          operator: 'or',
          propertyValue: searchValue,
        },
      ]
      : [];

    const filterCollection = [ filters ];
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify(filterCollection),
      searchCollection: JSON.stringify(searchCityFilter),
    };
    vendorManagementStore.getVmsCities(request).subscribe();
  };

  const saveRowData = (rowIndex: number) => {
    gridState.gridApi.stopEditing();
    onSave(rowIndex);
    gridState.setIsAllRowsSelected(false);
    agGrid.filtersApi.resetColumnFilters();
  };

  const addNewGrid = () => {
    vendorManagementStore.isCellDisable = true;
    const data = [ new BankInformation() ];
    agGrid.addNewItems(data, { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const colDef: ColDef[] = [
    {
      headerName: 'Bank Name',
      minWidth: 150,
      field: 'name',
      headerTooltip:'Bank Name',
      cellEditorParams: {
        placeHolder: 'Bank Name',
        ignoreNumber: true,
        rules: `required|string|between:2,200|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`
      },
    },
    {
      headerName: 'Bank Address 1',
      minWidth: 150,
      field: 'addressLine1',
      headerTooltip:'Bank Address 1',
      cellEditorParams: {
        placeHolder: 'Bank Address 1',
        ignoreNumber: true,
        rules: 'string|between:1,200',
      },
    },
    {
      headerName: 'Bank Address 2',
      minWidth: 150,
      field: 'addressLine2',
      headerTooltip:'Bank Address 2',
      cellEditorParams: {
        placeHolder: 'Bank Address 2',
        ignoreNumber: true,
        rules: `string|between:1,200|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`,
      },
    },
    {
      headerName: 'Country',
      minWidth: 200,
      field: 'countryReference',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'countryReference'),
      headerTooltip:'Country',
      cellEditorParams: {
        // isRequired: true,
        placeHolder: 'Country',
        getAutoCompleteOptions: () => vendorManagementStore.countries,
        valueGetter: (option: SelectOption) => option.value,
        // rules: 'required',
        onSearch: () => vendorManagementStore.countries,
      },
    },
    {
      headerName: 'State',
      minWidth: 150,
      field: 'stateReference',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'stateReference'),
      headerTooltip:'State',
      cellEditorParams: {
        placeHolder: 'State',
        getAutoCompleteOptions: () => vendorManagementStore.states,
        valueGetter: (option: SelectOption) => option.value,
        onSearch: () => vendorManagementStore.states,
        getDisableState: ({ data }) => vendorManagementStore.isCellDisable,
      },
    },
    {
      headerName: 'City',
      minWidth: 150,
      field: 'cityReference',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'cityReference'),
      headerTooltip:'City',
      cellEditorParams: {
        // isRequired: true,
        placeHolder: 'City',
        getAutoCompleteOptions: () => vendorManagementStore?.cities,
        valueGetter: (option: SelectOption) => option.value,
        // rules: 'required',
        onSearch: value => loadCities(value),
        getDisableState: ({ data }) => vendorManagementStore.isCellDisable,
      },
    },
    {
      headerName: 'Zip Code',
      minWidth: 100,
      field: 'zipCode',
      headerTooltip:'Zip Code',
      cellEditorParams: {
        placeHolder: 'Zip Code',
        rules: 'string|between:1,10',
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      hide: !vmsModuleSecurityV2.isEditable,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs: colDef,
      isEditable: vmsModuleSecurityV2.isEditable,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: true,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Edit',
            action: GRID_ACTIONS.EDIT,
            isHidden: !vmsModuleSecurityV2.isEditable,
          },
        ],
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              const model: BankInformation = agGrid._getTableItem(rowIndex);
              if(model.countryReference.id != null){
                filterStateByCountry(model.countryReference)
              }else{
                vendorManagementStore.isCellDisable = true;
              }
              agGrid._startEditingCell(rowIndex, 'name');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressScrollOnNewData: true,
      getRowNodeId: function (data) {
        return data.id;
      },
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: 1 });
      },
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        const model: BankInformation = agGrid._getTableItem(rowIndex);
        if(model.countryReference.id != null){
          filterStateByCountry(model.countryReference)
        }else{
          vendorManagementStore.isCellDisable = true;
        }
        agGrid._startEditingCell(rowIndex, colDef.field);
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={headerName} />}
        backNavTitle={backNavTitle}
        hideActionButtons={false}
        backNavLink={backNavLink}
        hasEditPermission={false}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  const getConfirmation = (rowIndex: number): void => {
    if (gridState.isAllRowsSelected) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Changes"
          message={'Cancelling will lost your changes. Are you sure you want to cancel?'}
          yesButton="Confirm"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => {
            ModalStore.close();
            cancelEditing(rowIndex);
            removeUnSavedRow(rowIndex);
          }}
        />
      );
    } else {
      cancelEditing(rowIndex);
      removeUnSavedRow(rowIndex);
    }
  };

  const cancelEditing = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
    gridState.setIsAllRowsSelected(false);
    vendorManagementStore.isCellDisable = false;
    vendorManagementStore.states = [];
  };

  const removeUnSavedRow = (rowIndex: number) => {
    const data: ServiceItemPricingModel = agGrid._getTableItem(rowIndex);
    if (!data.id) {
      const model = agGrid._getTableItem(rowIndex);
      agGrid._removeTableItems([ model ]);
    }
  };

  return (
    <>
      <ConfirmNavigate isBlocker={gridState.isRowEditing}>
        <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
          <div className={classes.editorWrapperContainer}>
            <AgGridMasterDetails
              addButtonTitle={rightContentActionText}
              onAddButtonClick={() => addNewGrid()}
              hasAddPermission={vmsModuleSecurityV2.isEditable}
              disabled={gridState.isProcessing || gridState.isRowEditing}
              resetHeight={true}
              isPrimaryBtn={true}
            >
              <CustomAgGridReact
                isRowEditing={gridState.isRowEditing}
                rowData={gridState.data}
                gridOptions={gridOptions()}
                serverPagination={false}
                paginationData={gridState.pagination}
                onPaginationChange={loadInitialData}
                disablePagination={gridState.isRowEditing}
              />
            </AgGridMasterDetails>
          </div>
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    </>
  );
};
export default inject(
  'vendorManagementStore',
  'vendorLocationStore'
)(withStyles(styles)(observer(BankInformationCore)));

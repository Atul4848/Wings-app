import React, { FC, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import {
  AirportModel,
  CustomsContactModel,
  AirportSettingsStore,
  AirportStore,
  AirportCustomDetailStore,
  CONTACT_ADDRESS_TYPE,
  useAirportModuleSecurity,
} from '../../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ModelStatusOptions } from '@wings/shared';
import { useStyles } from './CustomContacts.styles';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import {
  GRID_ACTIONS,
  ISelectOption,
  SettingsTypeModel,
  UIStore,
  Utilities,
  ViewPermission,
} from '@wings-shared/core';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { ColDef, GridOptions, ValueFormatterParams, ICellEditorParams, GridReadyEvent } from 'ag-grid-community';

interface Props {
  airportStore?: AirportStore;
  airportCustomDetailStore?: AirportCustomDetailStore;
  airportSettingsStore?: AirportSettingsStore;
  isEditable: boolean;
  isRowEditing: (isEditing: boolean) => void;
}

const CustomContacts: FC<Props> = ({ ...props }) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const classes = useStyles();
  const agGrid = useAgGrid<'', CustomsContactModel>([], gridState);
  const _airportStore = props.airportStore as AirportStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const _customDetailStore = props.airportCustomDetailStore as AirportCustomDetailStore;
  const _airportSettingStore = props.airportSettingsStore as AirportSettingsStore;
  const _disabled = gridState.isRowEditing || UIStore.pageLoading || !_selectedAirport?.isActive || !props.isEditable;
  const { isGRSUser, isEditable } = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
    return () => props.isRowEditing(false);
  }, [ props.isEditable ]);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _customDetailStore
      .getCustomsContacts(Number(params.airportId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => gridState.setGridData(response.results),
        error: (error: AxiosError) => console.log('error', error.code),
      });
  };

  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    setContactValueRules();
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    if (colDef.field === 'customsContactAddressType') {
      agGrid.getComponentInstance('contactValue').setValue('');
    }
    setContactValueRules();
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const addCustomContact = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new CustomsContactModel({ id: 0 }) ], { startEditing: false, colKey: 'customsContactType' });
    gridState.setHasError(true);
  };

  const upsertCustomContact = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    model.airportId = Number(params.airportId);
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _customDetailStore
      .upsertCustomsContact(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => agGrid._updateTableItem(rowIndex, response),
        error: error => agGrid.showAlert(error.message, 'upsertCustomsContact'),
      });
  };

  const setContactValueRules = () => {
    const contactValue = agGrid.getComponentInstance('contactValue');
    const addressType = agGrid.getInstanceValue<SettingsTypeModel>('customsContactAddressType')?.label?.toLowerCase();
    if (Utilities.isEqual(addressType, CONTACT_ADDRESS_TYPE.EMAIL)) {
      contactValue?.setRules('email');
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertCustomContact(rowIndex);
        props.isRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        props.isRowEditing(false);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Contact Type',
      field: 'customsContactType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Contact Type',
        getAutoCompleteOptions: () => _airportSettingStore.customsContactTypes,
      },
    },
    {
      headerName: 'Preferred ',
      field: 'preferred',
      cellEditor: 'checkBoxRenderer',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
    },
    {
      headerName: 'Contact Name',
      field: 'contactName',
      cellEditorParams: {
        rules: 'between:1,200',
      },
    },
    {
      headerName: 'Contact Address Type',
      field: 'customsContactAddressType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Contact Address Type',
        getAutoCompleteOptions: () => _airportSettingStore.customsContactAddressTypes,
      },
    },
    {
      headerName: 'Contact Value',
      field: 'contactValue',
    },
    {
      headerName: 'Contact Notes',
      field: 'contactNotes',
      cellEditor: 'customTextAreaEditor',
      cellEditorParams: {
        rules: 'between:1,200',
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
      },
    },
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
            },
          ],
          onAction: gridActions,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: isEditable || isGRSUser,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      onRowEditingStarted: params => {
        props.isRowEditing(true);
        _airportSettingStore.loadCustomsContactAddressTypes().subscribe();
        _airportSettingStore.loadCustomsContactTypes().subscribe();
        agGrid.onRowEditingStarted(params);
      },
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', props.isEditable);
      },
    };
  };

  return (
    <>
      <div className={classes.addButtonContainer}>
        <ExpandCollapseButton onExpandCollapse={agGrid.autoSizeColumns} />
        <ViewPermission hasPermission={props.isEditable}>
          <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={_disabled} onClick={addCustomContact}>
            Add Contact
          </PrimaryButton>
        </ViewPermission>
      </div>
      <div className={classes.gridWrapper}>
        <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} isRowEditing={gridState.isRowEditing} />
      </div>
    </>
  );
};

export default inject('airportStore', 'airportCustomDetailStore', 'airportSettingsStore')(observer(CustomContacts));

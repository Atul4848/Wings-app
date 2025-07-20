import React, { FC, useEffect, ReactNode, useState } from 'react';
import {
  CustomAgGridReact,
  AgGridMasterDetails,
} from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { UltimateOwnershipModel, useVMSModuleSecurity } from '../../../Modules/Shared';
import { IAPIGridRequest, Utilities, GRID_ACTIONS, IClasses, cellStyle, regex, UIStore } from '@wings-shared/core';
import { BaseStore, UltimateOwnershipStore } from '../../../Stores';
import { inject, observer } from 'mobx-react';
import { useStyles } from './UltimateOwnershipCore.style';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import CustomTooltip from '../Components/Tooltip/CustomTooltip';
import { VALIDATION_REGEX } from '../Enums/Spacing.enum';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';

interface Props {
  ultimateOwnershipStore: UltimateOwnershipStore;
  rightContentActionText: string;
  onSave: (rowIndex: number) => void;
  updateUBORefusedData: () => void;
  backNavLink: string;
  backNavTitle: string;
  loadInitialData: (pageRequest?: IAPIGridRequest, agGrid?: any, gridState?: any) => void;
  loadVendorData: () => void;
  headerName: string;
  agGrid: any;
  gridState?: any;
  hasOwnership: boolean;
}

const UltimateOwnershipCore: FC<Props> = ({
  ultimateOwnershipStore,
  rightContentActionText,
  onSave,
  updateUBORefusedData,
  backNavLink,
  backNavTitle,
  loadInitialData,
  headerName,
  agGrid,
  loadVendorData,
  gridState
}) => {

  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    ultimateOwnershipStore.isUboChecked = event.target.checked;
    updateUBORefusedData();
  };

  useEffect(() => {
    loadVendorData();
    loadInitialData();
  }, []);

  const classes = useStyles();

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const saveRowData = (rowIndex: number) => {
    // gridState.gridApi.stopEditing();
    onSave(rowIndex);
    // gridState.setIsAllRowsSelected(false);
    // agGrid.filtersApi.resetColumnFilters();
  };

  const addNewGrid = () => {
    const data = [ new UltimateOwnershipModel({ isUBORefused: ultimateOwnershipStore.isUboChecked }) ];
    agGrid.addNewItems(data, { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const colDef: ColDef[] = [
    {
      headerName: 'Owner Name',
      minWidth: 150,
      field: 'name',
      headerTooltip: 'Owner Name',
      cellEditorParams: {
        placeHolder: 'Owner Name',
        ignoreNumber: true,
        rules: `required|string|between:2,200|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`,
      },
    },
    {
      headerName: 'Owner Percentage',
      minWidth: 150,
      field: 'percentage',
      headerTooltip: 'Owner Percentage',
      cellEditorParams: {
        placeHolder: 'Owner Percentage',
        ignoreNumber: true,
        rules: `required|numeric|between:1,100|regex:${regex.numberOnly}`,
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
      context: { onInputChange },
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
          }
        ],
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
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
      isExternalFilterPresent: () => false,
      suppressScrollOnNewData: true,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: 1 });
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
    loadInitialData()
    gridState.setIsAllRowsSelected(false);
  };

  const removeUnSavedRow = (rowIndex: number) => {
    const data: UltimateOwnershipModel = agGrid._getTableItem(rowIndex);
    if (!data.id) {
      const model = agGrid._getTableItem(rowIndex);
      agGrid._removeTableItems([ model ]);
    }
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
        <div className={classes.editorWrapperContainer}>
          <FormGroup>
            <FormControlLabel control={<Checkbox checked={ultimateOwnershipStore.isUboChecked}
              onChange={handleChange}
              disabled={!(ultimateOwnershipStore.vendorOwner.length > 0)} />} label="UBO Refused" />
          </FormGroup>
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
  );
};
export default inject(
  'ultimateOwnershipStore'
)(observer(UltimateOwnershipCore));

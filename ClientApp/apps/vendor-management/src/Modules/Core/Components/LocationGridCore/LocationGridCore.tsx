import React, { FC, useRef, useEffect } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, useGridFilters } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, RowNode, GridReadyEvent } from 'ag-grid-community';
import {
  StatusBaseModel,
  VENDOR_LOCATION_COMPARISON_FILTERS,
  VendorLocationModel,
  Airports,
  useVMSModuleSecurity,
} from '../../../Shared';
import {
  IAPIGridRequest,
  UIStore,
  Utilities,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { BaseStore, SettingsStore, VendorLocationStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './LocationGridCore.styles';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ISearchHeaderRef } from '@wings-shared/form-controls';

interface Props {
  vendorLocationStore?: VendorLocationStore;
  settingsStore?: SettingsStore;
  agGrid:any;
  gridState:any;
  gridFilters:any,
  columnDefs: ColDef[];
  gridHeader: boolean;
  gridHeading: string;
  headerActionBtn: any;
  loadData:(pageRequest?: IAPIGridRequest)=>void;
  isEditable: boolean;
}

const LocationGridCore: FC<Props> = ({ 
  vendorLocationStore, 
  settingsStore,
  agGrid,
  gridState,
  gridFilters,
  columnDefs,
  gridHeader,
  gridHeading,
  headerActionBtn,
  loadData,
  isEditable
}) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const filtersApi = useGridFilters<VENDOR_LOCATION_COMPARISON_FILTERS>(gridFilters, gridState);
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const isStatusFilter = Utilities.isEqual(
            searchHeaderRef.current?.getSelectedOption('defaultOption'),
            VENDOR_LOCATION_COMPARISON_FILTERS.LOCATION_STATUS
  );

  useEffect(() => {
    // agGrid._setColumnVisible('actionRenderer', isEditable);
  }, []);

  // Load Data on Mount
  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (): void => {
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

 
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: (vmsModuleSecurityV2.isEditable && isEditable),
      gridActionProps: {
        isActionMenu: (vmsModuleSecurityV2.isEditable && isEditable),
        showDeleteButton: false,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Edit',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.EDIT,
          },
          // {
          //   title: 'View',
          //   action: GRID_ACTIONS.VIEW,
          // },
        ],
        getDisabledState: () => gridState.hasError,
        onGridReady: (param: GridReadyEvent) => {
          // a(param);
          // agGrid._setColumnVisible('actionRenderer', isEditable)
        },
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              agGrid._startEditingCell(rowIndex, 'name');
              break;
            case GRID_ACTIONS.CANCEL:
              agGrid.cancelEditing(rowIndex);
              agGrid.filtersApi.resetColumnFilters();
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressScrollOnNewData: true,       
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadData({ pageNumber: 1 }),
      onSortChanged: e => {
        filtersApi.onSortChanged(e);
        loadData();
      }
    };
  };

  return (
    <>
      
      {
        gridHeader ? 
          <div className={classes.gridHeaderWapper}>
            <h3>{gridHeading}</h3>
            {headerActionBtn}
          </div>
          :
          ''
      }
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadData}
        classes={{ customHeight: classes.customHeight }}
        disablePagination={gridState.isRowEditing || gridState.isProcessing}
      />
    </>
  );
};
export default inject('settingsStore')(observer(LocationGridCore));



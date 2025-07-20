import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, ICellRendererParams, RowNode, ValueFormatterParams } from 'ag-grid-community';
import {
  AgGridMasterDetails,
  useAgGrid,
  CustomAgGridReact,
  useGridState,
  AgGridPopoverWrapper,
} from '@wings-shared/custom-ag-grid';
import { observer } from 'mobx-react';
import { Utilities, GRID_ACTIONS, DATE_FORMAT, IClasses, UIStore, SettingsTypeModel } from '@wings-shared/core';
import { CUSTOMER_COMMS_FILTER_BY, CustomerCommunicationModel, CustomerStore } from '../../Shared';
import { useStyles } from './ContactDetailsGrid.styles';
import { VIEW_MODE } from '@wings/shared';
import Chip from '@material-ui/core/Chip';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';

interface Props extends ICellRendererParams {
  isEditable?: boolean;
  customerStore?: CustomerStore;
}

const ContactDetailsGrid: FC<Props> = ({ isEditable, data, customerStore }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<CUSTOMER_COMMS_FILTER_BY, CustomerCommunicationModel>([], gridState);
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const _customerStore = customerStore as CustomerStore;

  // Load Data on Mount
  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = () => {
    UIStore.setPageLoader(true);
    const request = {
      filterCollection: JSON.stringify([{ propertyName: 'ContactId', propertyValue: data.id }]),
      specifiedFields: [ 'Communications' ],
    };
    _customerStore
      .getContactNoSqlById(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response.communications);
        unsubscribe.setHasLoaded(true);
      });
  };

  const viewRenderer = (chipValues, fieldKey) => {
    if (!Array.isArray(chipValues)) {
      return;
    }
    return (
      <AgGridPopoverWrapper chipsValues={chipValues} suppressPopover={!chipValues.length}>
        <>
          {chipValues.map((x, index) => {
            const _label = fieldKey.includes('registry')
              ? x.registry?.name
              : fieldKey.includes('operator')
                ? x.operator?.name
                : x?.name;
            return <Chip size="small" label={_label} key={index} />;
          })}
        </>
      </AgGridPopoverWrapper>
    );
  };

  const actionMenus = (node: RowNode) => {
    const communicationId = node.data?.contactCommunicationId;
    return [
      {
        title: 'Edit',
        isHidden: !isEditable,
        action: GRID_ACTIONS.EDIT,
        to: () => `${data.id}/communication/${communicationId}/${VIEW_MODE.EDIT.toLowerCase()}`,
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.DETAILS,
        to: () => `${data.id}/communication/${communicationId}/${VIEW_MODE.DETAILS.toLowerCase()}`,
      },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Communication Level',
      field: 'communicationLevel',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'value'),
    },
    {
      headerName: 'Contact Role',
      field: 'contactRole',
      valueFormatter: ({ value }) => value?.name || '',
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'Communication Categories',
      field: 'communicationCategories',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) =>
          viewRenderer(node.data?.communicationCategories, colDef?.field),
      },
    },
    {
      headerName: 'Customer',
      field: 'customer',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
    },
    {
      headerName: 'Operators',
      field: 'operatorAssociations',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) =>
          viewRenderer(node.data?.customerCommunicationOperators, colDef?.field),
      },
    },
    {
      headerName: 'Registries',
      field: 'registryAssociations',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) =>
          viewRenderer(node.data?.customerCommunicationRegistries, colDef?.field),
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
    });
    return {
      ...baseOptions,
      suppressCellSelection: true,
    };
  };

  return (
    <AgGridMasterDetails addButtonTitle="" onAddButtonClick={() => ''} hasAddPermission={false}>
      <CustomAgGridReact
        rowData={gridState.data}
        gridOptions={gridOptions()}
        isRowEditing={gridState.isRowEditing}
        classes={{ customHeight: classes.customHeight }}
      />
    </AgGridMasterDetails>
  );
};

export default observer(ContactDetailsGrid);

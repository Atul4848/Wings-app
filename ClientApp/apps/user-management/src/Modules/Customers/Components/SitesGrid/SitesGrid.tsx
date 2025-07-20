import React, { FC } from 'react';
import { CustomAgGridReact, AgGridActions, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Typography } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useStyles } from './SitesGrid.style';
import { CustomersStore, ServicesStore, SiteModel } from '../../../Shared';
import { IClasses, Utilities, DATE_FORMAT } from '@wings-shared/core';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { LOGS_FILTERS } from '../../../Shared/Enums';
import ManageServices from '../ManageServices/ManageServices';

interface Props {
  classes?: IClasses;
  sitesField: SiteModel[];
  customerStore?: CustomersStore;
  serviceStore?: ServicesStore;
  openManageServicesDialog?: (sitesField: SiteModel) => void;
  upsertSiteField: (sitesField) => void;
  deleteSiteField: (siteField) => void;
}


const SitesGrid: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<LOGS_FILTERS, SiteModel>([], gridState);

  const openManageServicesDialog = (): void => {
    ModalStore.open(<ManageServices
      sitesField={props.sitesField} 
      upsertSiteField={siteField => props.upsertSiteField(siteField)}
      deleteSiteField={model => props.deleteSiteField(model)}
    />);
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Client ID',
      field: 'siteUseId',
    },
    {
      headerName: 'Site',
      field: 'location',
    },
    {
      headerName: 'Service',
      field: 'services',
    },
    {
      headerName: 'EndDate',
      field: 'endDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_API_FORMAT),
    },
  ];

  const gridActionProps = (): object => {
    return {
      showDeleteButton: true,
      getDisabledState: () => gridState.hasError,
      getEditableState: () => false,
    };
  }

  const gridOptions = (): GridOptions =>{
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs,
      isEditable: false,
      gridActionProps,
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
        minWidth: 180,
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
      },
      pagination: false,
    };
  }

  return (
    <>
      <div className={classes.container}>
        <div className={classes.containerFlex}>
          <div className={classes.manageRoleBtn}>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => openManageServicesDialog()}
            >
            Manage Services
            </PrimaryButton>
          </div>
        </div>
        <div className={classes.mainRoot}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={props.sitesField}
            gridOptions={gridOptions()}
          />
        </div>
      </div>
    </>
  );
}

export default inject('customerStore', 'serviceStore')(observer(SitesGrid));

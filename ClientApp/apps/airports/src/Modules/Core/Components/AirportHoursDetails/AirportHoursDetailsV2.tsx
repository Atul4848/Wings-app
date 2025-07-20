import React, { FC, ReactNode, useEffect } from 'react';
import { AuditHistory, baseApiPath } from '@wings/shared';
import { useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { GridOptions } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AirportHoursStore,
  AirportStore,
  AIRPORT_AUDIT_MODULES,
  AirportHoursModel,
  useAirportModuleSecurity,
  updateAirportSidebarOptions,
  airportBasePath,
  AirportSettingsStore,
} from '../../../Shared';
import { useStyles } from './AirportHoursDetails.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { GridPagination, IAPIGridRequest, UIStore, ViewPermission, GRID_ACTIONS } from '@wings-shared/core';
import { CustomLinkButton, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { CommonAirportHoursGrid } from '../../../AirportHours';

interface Props {
  airportStore?: AirportStore;
  airportHoursStore?: AirportHoursStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportHoursDetails: FC<Props> = ({ airportStore, airportHoursStore, sidebarStore, airportSettingsStore }) => {
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<[], AirportHoursModel>([], gridState);
  const _airportStore = airportStore as AirportStore;
  const _airportHoursStore = airportHoursStore as AirportHoursStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Airport Hours', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    loadAirportHours();
  }, []);

  /* istanbul ignore next */
  const loadAirportHours = (pageRequest?: IAPIGridRequest): void => {
    if (!params.airportId) {
      return;
    }
    const request: IAPIGridRequest = {
      ...pageRequest,
      filterCollection: JSON.stringify([{ propertyName: 'Airport.AirportId', propertyValue: params.airportId }]),
    };
    UIStore.setPageLoader(true);
    _airportHoursStore
      ?.loadAirportHours(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          gridState.setGridData(response.results);
          gridState.setPagination(new GridPagination({ ...response }));
        },
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    if (gridAction === GRID_ACTIONS.AUDIT) {
      const model: AirportHoursModel = agGrid._getTableItem(rowIndex);
      ModalStore.open(
        <AuditHistory
          title={model.airport?.label || model.icao}
          entityId={model.id}
          entityType={AIRPORT_AUDIT_MODULES.AIRPORT_HOURS}
          baseUrl={baseApiPath.airports}
        />
      );
    }
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs: [],
      isEditable: false,
      gridActionProps: {
        tooltip: 'Airport Hours',
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_airportStore?.selectedAirport?.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
      <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
        <div className={classes.addHoursContainer}>
          <ExpandCollapseButton onExpandCollapse={agGrid.autoSizeColumns} />
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to={`/airports/airport-hours/${params.airportId}/${params.icao}/new?backNav=airports`}
            title="Add Hours"
            disabled={!_airportStore.selectedAirport?.isActive}
          />
        </div>
      </ViewPermission>
      <div className={classes.gridWrapper}>
        <CommonAirportHoursGrid
          rowData={gridState.data}
          auditFields={agGrid.auditFields(gridState.isRowEditing)}
          gridOptions={gridOptions()}
          serverPagination={true}
          paginationData={gridState.pagination}
          isAirportScreen={true}
          onPaginationChange={loadAirportHours}
          onAction={gridActions}
          airportSettingsStore={airportSettingsStore}
        />
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject(
  'sidebarStore',
  'airportHoursStore',
  'airportStore',
  'airportSettingsStore'
)(observer(AirportHoursDetails));

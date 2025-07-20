import React, { FC, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './SessionViolations.styles';
import { Theme, FormControlLabel, Checkbox } from '@material-ui/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { ColDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { SessionViolationsModel, SessionViolationsStore } from '../Shared';
import { LOGS_FILTERS, SESSION_VOILATIONS } from '../Shared/Enums';
import { IClasses, UIStore, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import {
  CustomAgGridReact,
  useAgGrid,
  useGridState,
  agGridUtilities,
  AgGridActionButton,
} from '@wings-shared/custom-ag-grid';
import { AuthStore, useRoles } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  sessionViolationsStore?: SessionViolationsStore;
};

const SessionViolations: FC<Props> = ({ sessionViolationsStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<LOGS_FILTERS, SessionViolationsModel>([], gridState);
  const [ isExcludingInternalUsers, setIsExcludingInternalUsers ] = useState(false);
  const searchHeaderRef = useRef<ISearchHeaderRef>();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    sessionViolationsStore
      ?.getSessionViolations()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: SessionViolationsModel[]) => {
        sessionViolationsStore.setSessionData(data);
        gridState.setGridData(data);
      });
  };

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const excludingInternalRecords = () => {
    if (!isExcludingInternalUsers) {
      const _data = gridState.data.filter(
        x =>
          !Boolean(
            x.username?.toLowerCase().includes('univ-wea.com') ||
              x.username?.toLowerCase().includes('universalweather.net')
          )
      );
      gridState.setGridData(_data);
    }
    else {
      gridState.setGridData(sessionViolationsStore.sessionData);
    }
  };

  const setExcludeExternal = (value: boolean) => {
    setIsExcludingInternalUsers(value);
    excludingInternalRecords();
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Username',
      field: 'username',
    },
    {
      headerName: 'Customer Number',
      field: 'customerNumber',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        if (value === undefined) {
          return '';
        }
        return value ? value : '-';
      },
    },
    {
      headerName: 'Clients',
      field: 'clients',
    },
    {
      headerName: 'Violation Count',
      field: 'violationCount',
    },
    {
      headerName: '',
      minWidth: 100,
      width: 100,
      sortable: false,
      maxWidth: 100,
      cellRenderer: 'actionButtonRenderer',
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isHidden: () => false,
        isDisabled: () => !hasWritePermission,
        onClick: node => {
          gridActions(GRID_ACTIONS.DELETE, node.rowIndex)
        },
      },
    },
  ];

  const deleteSessionViolations = (sessionViolation: SessionViolationsModel): void => {
    UIStore.setPageLoader(true);
    sessionViolationsStore
      ?.deleteSessionViolations(sessionViolation.oktaUserId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        () => {
          agGrid._removeTableItems([ sessionViolation ]);
          AlertStore.info('SessionViolations deleted successfully');
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    const sessionViolation = agGrid._getTableItem(rowIndex);

    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Delete"
          message="Are you sure you want to delete this SessionViolations?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteSessionViolations(sessionViolation)}
        />
      );
    }
  };

  const rightContent = (): ReactNode => {
    return (
      <FormControlLabel
        value={setIsExcludingInternalUsers}
        control={<Checkbox onChange={e => setExcludeExternal(e.target.checked)} />}
        label="Exclude Internal Users"
      />
    );
  };

  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: {},
        columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      frameworkComponents: {
        actionButtonRenderer: AgGridActionButton,
      },
      isExternalFilterPresent: () => searchHeaderRef.current?.hasSearchValue || false,
      doesExternalFilterPass: node => {
        const searchHeader = searchHeaderRef.current;
        if (!searchHeader) {
          return false;
        }
        const { username, customerNumber } = node.data as SessionViolationsModel;
        return agGrid.isFilterPass(
          {
            [SESSION_VOILATIONS.ALL]: [ username, customerNumber ],
          },
          searchHeader.searchValue,
          searchHeader.selectedOption
        );
      },
    };
  };

  return (
    <>
      <div className={classes.sessionListContainer}>
        <div className={classes.headerContainer}>
          <div className={classes.searchContainer}>
            <SearchHeaderV2
              ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
              selectInputs={[ agGridUtilities.createSelectOption(SESSION_VOILATIONS, SESSION_VOILATIONS.ALL) ]}
              onFilterChange={() => gridState.gridApi.onFilterChanged()}
              rightContent={rightContent}
              disableControls={gridState.isRowEditing}
              hideSelectionDropdown={true}
            />
          </div>
        </div>
        <div className={classes.mainroot}>
          <div className={classes.mainContent}>
            <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} />
          </div>
        </div>
      </div>
    </>
  );
};

export default inject('sessionViolationsStore')(observer(SessionViolations));

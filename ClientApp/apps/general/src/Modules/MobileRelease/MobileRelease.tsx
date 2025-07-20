import React, { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import { IAPIPagedUserRequest, VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, BaseGrid, AgGridActions, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useStyles } from './MobileRelease.styles';
import { withStyles, Typography, Theme } from '@material-ui/core';
import MobileFriendlyOutlinedIcon from '@material-ui/icons/MobileFriendlyOutlined';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { MobileReleaseModel } from '../Shared/Models/MobileRelease.model';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { action } from 'mobx';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import UpsertRelease from './Components/UpsertRelease/UpsertRelease';
import { MobileReleaseStore, IAPIUpsertMobileReleaseRequest, FUEL_FILTERS } from '../Shared';
import { DATE_FORMAT, IClasses, UIStore, Utilities, GRID_ACTIONS, cellStyle, SearchStore } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router';
import { ISearchHeaderRef } from '@wings-shared/form-controls';
import { AuthStore } from '@wings-shared/security';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  mobileReleaseStore?: MobileReleaseStore;
};

const MobileRelease: FC<Props> = ({ mobileReleaseStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  let pagedUserRequest: IAPIPagedUserRequest;
  const location = useLocation();
  const agGrid = useAgGrid<FUEL_FILTERS, MobileReleaseModel>([], gridState);
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const classes = useStyles();

  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData?.searchValue) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    mobileReleaseStore
      ?.getMobileRelease()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: MobileReleaseModel[]) => {
        gridState.setGridData(data);
      });
  }

  const hasAnyPermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const columnDefs: ColDef[] = [
    {
      headerName: 'Version',
      field: 'version',
    },
    {
      headerName: 'Date',
      field: 'date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.SDT_DST_FORMAT),
    },
    {
      headerName: 'Force Update',
      field: 'forceUpdate',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        if (value === undefined) {
          return '';
        }
        return value ? 'Yes' : 'No';
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      minWidth: 160,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          { title: 'Edit', action: GRID_ACTIONS.EDIT, isDisabled: !hasAnyPermission },
          { title: 'Delete', action: GRID_ACTIONS.DELETE, isDisabled: !hasAnyPermission },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  const deleteRelease = (mobileReleases: MobileReleaseModel): void => {
    UIStore.setPageLoader(true);
    mobileReleaseStore
      ?.deleteRelease(mobileReleases.mobileReleaseId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        }),
        filter((isDeleted: boolean) => isDeleted)
      )
      .subscribe(
        () => {
          agGrid._removeTableItems([ mobileReleases ]);
          AlertStore.info('Mobile Release deleted successfully');
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    const mobileRelease = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      openReleasesDialog(VIEW_MODE.EDIT, mobileRelease);
    }

    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Delete"
          message="Are you sure you want to delete this release?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteRelease(mobileRelease)}
        />
      );
    }
  }

  const upsertRelease = (upsertReleaseRequest: IAPIUpsertMobileReleaseRequest): void => {
    UIStore.setPageLoader(true);
    mobileReleaseStore
      ?.upsertRelease(upsertReleaseRequest)
      .pipe(
        switchMap(() => mobileReleaseStore.getMobileRelease()),
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => (gridState.data = response),
        error: (error: AxiosError) => AlertStore.info(error.message),
      });
  }

  const openReleasesDialog = (mode: VIEW_MODE, mobileRelease?: MobileReleaseModel): void => {
    ModalStore.open(
      <UpsertRelease
        mobileReleaseStore={mobileReleaseStore}
        viewMode={mode}
        mobileRelease={mobileRelease}
        upsertRelease={(upsertReleaseRequest: IAPIUpsertMobileReleaseRequest) =>
          upsertRelease(upsertReleaseRequest)
        }
      />
    );
  }

  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: this,
        columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      frameworkComponents: {
        actionRenderer: AgGridActions,
      },
      pagination: false,
    };
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <MobileFriendlyOutlinedIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Mobile Releases
          </Typography>
        </div>
        <div>
          <PrimaryButton
            variant="contained"
            color="primary"
            disabled={!hasAnyPermission}
            onClick={() => openReleasesDialog(VIEW_MODE.NEW, new MobileReleaseModel())}
            startIcon={<AddIcon />}
          >
            Add Release
          </PrimaryButton>
        </div>
      </div>
      <div className={classes.mainRoot}>
        <div className={classes.mainContent}>
          <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} />
        </div>
      </div>
    </>
  );
}

export default inject('mobileReleaseStore')(observer(MobileRelease));

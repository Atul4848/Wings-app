import React, { FC, RefObject, useEffect, useMemo, useRef } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  AgGridActions,
  AgGridGroupHeader,
  useGridState,
  useAgGrid
} from '@wings-shared/custom-ag-grid';
import { styles } from './UVGOBanner.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Typography } from '@material-ui/core';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { inject, observer } from 'mobx-react';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { UVGOBannerModel } from '../../../Shared/Models/UVGOBanner.model';
import {
  UVGOBannerStore,
  IAPIUpsertUVGOBannerRequest,
  UVGOBannerTypeModel,
  UVGOBannerServicesModel,
} from '../../../Shared';
import UpsertUVGOBanner from '../UpsertUVGOBanner/UpsertUVGOBanner';
import {
  DATE_FORMAT,
  IAPIGridRequest,
  UIStore,
  Utilities,
  GridPagination,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore } from '@wings-shared/security';

interface Props {
  uvgoBannerStore?: UVGOBannerStore;
}

const UVGOBanner: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<'', UVGOBannerModel>([], gridState);
  const classes: Record<string, string> = styles();
  const _uvgoBannerStore = props.uvgoBannerStore as UVGOBannerStore;
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const unsubscribe = useUnsubscribe();

  useEffect(() => {
    loadInitialData('enter');
  }, []);

  const hasAnyPermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  /* istanbul ignore next */
  const loadInitialData = (key: string, pageRequest?: IAPIGridRequest): void => {
    if (key === 'enter' || (key === 'backspace' && !(searchHeaderRef.current?.searchValue))) {
      const request: IAPIGridRequest = {
        ...pageRequest,
        searchCollection: searchHeaderRef.current?.searchValue,
      };
      UIStore.setPageLoader(true);
      _uvgoBannerStore
        ?.uvgoBanners(request)
        .pipe(finalize(() => UIStore.setPageLoader(false)))
        .subscribe(response => {
          gridState.setPagination(new GridPagination({ ...response }));
          gridState.setGridData(response.results);
          agGrid.reloadColumnState();
        });
    }
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Start Date',
      field: 'effectiveStartDate',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'End Date',
      field: 'effectiveEndDate',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Banner Type',
      field: 'bannerType',
      comparator: (current: UVGOBannerTypeModel, next: UVGOBannerTypeModel) =>
        Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Banner Service',
      field: 'bannerService',
      comparator: (current: UVGOBannerServicesModel, next: UVGOBannerServicesModel) =>
        Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Message',
      field: 'message',
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
          { title: !hasAnyPermission ? 'Details' : 'Edit', action: GRID_ACTIONS.EDIT },
          { title: 'Delete', isDisabled: !hasAnyPermission, action: GRID_ACTIONS.DELETE },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  /* istanbul ignore next */
  const deleteUVGOBanner = (uvgoBanner: UVGOBannerModel): void => {
    UIStore.setPageLoader(true);
    _uvgoBannerStore
      ?.deleteUVGOBanner(uvgoBanner.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(
        () => {
          agGrid._removeTableItems([ uvgoBanner ]);
          AlertStore.info('uvGO Banner deleted successfully');
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    const uvgoBanner = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      openUVGOBannerDialog(VIEW_MODE.EDIT, uvgoBanner);
    }

    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Delete uvGO Banner"
          message="Are you sure you want to delete this uvGO banner?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteUVGOBanner(uvgoBanner)}
        />
      );
    }
  }

  /* istanbul ignore next */
  const upsertUVGOBanner = (upsertUVGOBannerRequest: IAPIUpsertUVGOBannerRequest): void => {
    UIStore.setPageLoader(true);
    _uvgoBannerStore
      ?.upsertUVGOBanner(upsertUVGOBannerRequest)
      .pipe(
        switchMap(() => _uvgoBannerStore.uvgoBanners()),
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => (gridState.setGridData(response.results)),
        error: (error: AxiosError) => AlertStore.info(error.message),
      });
  }

  /* istanbul ignore next */
  const openUVGOBannerDialog = (mode: VIEW_MODE, uvgoBanner?: UVGOBannerModel): void => {
    ModalStore.open(
      <UpsertUVGOBanner
        uvgoBannerStore={_uvgoBannerStore}
        viewMode={mode}
        uvgoBanner={uvgoBanner}
        upsertUVGOBanner={(upsertUVGOBannerRequest: IAPIUpsertUVGOBannerRequest) =>
          upsertUVGOBanner(upsertUVGOBannerRequest)
        }
      />
    );
  }

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: {},
        columnDefs: columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => { },
        },
      }),
      onFilterChanged: () => Array.from(gridState.columFilters).length === 0 && loadInitialData('enter'),
      isExternalFilterPresent: () => false,
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
      },
      pagination: false,
    };
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <SpeakerNotesIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Banners
          </Typography>
        </div>
        <div>
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[]}
            onFilterChange={isInitEvent =>
              loadInitialData('enter', { pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 })
            }
            onClear={() => {
              loadInitialData('enter')
            }}
            onKeyUp={key => {
              loadInitialData(key)
            }}
            disableControls={Boolean(Array.from(gridState.columFilters).length)}
          />
        </div>
        <div>
          <PrimaryButton
            variant="contained"
            color="primary"
            disabled={!hasAnyPermission}
            onClick={() => openUVGOBannerDialog(VIEW_MODE.NEW, new UVGOBannerModel())}
            startIcon={<AddIcon />}
          >
            Add uvGO Banner
          </PrimaryButton>
        </div>
      </div>
      <div className={classes.mainroot}>
        <div className={classes.mainContent}>
          <CustomAgGridReact
            gridOptions={gridOptions()}
            rowData={gridState.data}
            serverPagination={true}
            paginationData={gridState.pagination}
            onPaginationChange={request => loadInitialData('enter', request)}
          />
        </div>
      </div>
    </>
  );
};

export default inject('uvgoBannerStore')(observer(UVGOBanner));

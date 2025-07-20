import React, { FC, RefObject, useEffect, useRef, useState } from 'react';
import {
  CustomAgGridReact,
  AgGridGroupHeader,
  AgGridActionButton,
  useGridState,
  useAgGrid,
  AgGridChipViewStatus
} from '@wings-shared/custom-ag-grid';
import {
  Utilities,
  DATE_FORMAT,
  UIStore,
  DATE_TIME_PICKER_TYPE,
  GridPagination,
  IAPIGridRequest,
  ISelectOption,
  IBaseGridFilterSetup,
  GRID_ACTIONS,
  cellStyle
} from '@wings-shared/core';
import { styles } from './Logs.styles';
import { Button, Menu, Typography } from '@material-ui/core';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { LogModel, LogStore } from '../Shared';
import { LOGS_FILTERS } from '../Shared/Enums';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import moment from 'moment';
import { DateTimePicker, ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import FilterLogs from './Components/FilterLogs/FilterLogs';
import LogContextDetail from './Components/LogContext/LogContext';
import { FilterIcon } from '@uvgo-shared/icons';
import { useNavigate } from 'react-router';

interface Props {
  logStore?: LogStore;
  id: string;
}

const Logs: FC<Props> = ({ logStore, id }: Props) => {
  const navigate = useNavigate();
  const _logStore = logStore as LogStore;
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const gridState = useGridState();
  const agGrid = useAgGrid<LOGS_FILTERS, LogModel>([], gridState);
  const classes: Record<string, string> = styles();

  const filtersSetup: IBaseGridFilterSetup<LOGS_FILTERS> = {
    defaultPlaceHolder: 'Search by Username',
    filterTypesOptions: Object.values(LOGS_FILTERS),
    defaultFilterType: LOGS_FILTERS.ALL,
  };

  useEffect(() => {
    loadInitialData();
    return (() => {
      _logStore.setStartDate('');
      _logStore.setEndDate('');
      _logStore?.setSelectedActorIDs(null);
      _logStore?.setSelectedTargetIDs(null);
    })
  }, []);

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => { 
    const request: IAPIGridRequest = {
      ...pageRequest,
      query: searchHeaderRef.current?.searchValue,
      status: _logStore.logsFilter,
      from: _logStore.startDate,
      to: _logStore.endDate,
      q: id,
      event: _logStore?.eventFilter,
      actorId: id || _logStore?.selectedActorIDs == null ? id : logStore?.selectedActorIDs.id,
      targetId: id || _logStore?.selectedTargetIDs == null ? id : logStore?.selectedTargetIDs.id,
    };
    UIStore.setPageLoader(true);
    _logStore
      .getLog(request)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        agGrid.reloadColumnState();
      });
  }

  /* istanbul ignore next */
  const applyFilter = () => {
    if (!(_logStore.startDate && _logStore.endDate)) {
      return;
    }
    loadInitialData();
  }

  /* istanbul ignore next */
  const contextInformation = (context: any) => {
    ModalStore.open(
      <LogContextDetail context={context} />
    );
  }

  const navigateToUser = (id: string) => {
    navigate(`/user-management/users/${id}/edit`);
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Actor',
      field: 'actor.username',
      cellClass: params => { 
        if (params.value === 'System') {
          return '';
        }
        return 'navigateText'
      },
      onCellClicked: (props) => {
        if(props.data.actor.id){
          navigateToUser(props.data.actor.id);
        }
      },
      cellStyle: params => {
        if (params.value === 'System') {
          return null;
        }
        return { color: '#1976d2', cursor: 'pointer' };
      }
    },
    {
      headerName: 'Target',
      field: 'target.username',
      cellClass: 'navigateText',
      onCellClicked: (props) => {
        if(props.data.target.id){
          navigateToUser(props.data.target.id);
        }
      },
      cellStyle: () => {
        return { color: '#1976d2', cursor: 'pointer' };
      }
    },
    {
      headerName: 'Message',
      field: 'message',
    },
    {
      headerName: 'Event',
      field: 'event',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Source',
      field: 'source',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'TimeStamp',
      field: 'timeStamp',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.TIME_ZONE_FORMAT),
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
    },
    {
      headerName: 'Context',
      cellRenderer: 'actionButtonRenderer',
      suppressSizeToFit: true,
      suppressNavigable: true,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        onClick: node => { contextInformation(node.data?.context) },
        info: true,
        isDisabled: () => true,
        isActive: (node) => { return (!node.data?.context || Object.keys(node.data.context).length > 0) }
      },
    }
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: () => (action: GRID_ACTIONS, rowIndex: number) => { },
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => false,
      frameworkComponents: {
        agGridChipViewStatus: AgGridChipViewStatus,
        customHeader: AgGridGroupHeader,
        actionButtonRenderer: AgGridActionButton,
      },
      pagination: false,
    };
  }

  const filterLogs = (e: any) => {
    ModalStore.open(
      <FilterLogs
        onSetClick={({ status }) => {
          loadInitialData();
          ModalStore.close();
        }}
        anchorEl={e.currentTarget}
      />
    );
  }

  return (
    <>
      <div className={classes.userListContainer}>
        <div className={classes.flexSection}>
          <div className={classes.headerContainer}>
            <SearchHeaderV2
              ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
              selectInputs={[]}
              onResetFilterClick={() => {
                loadInitialData();
              }}
              onFilterChange={isInitEvent =>
                loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 })
              }
              disableControls={Boolean(Array.from(gridState.columFilters).length)}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.filterBtn}
              onClick={(e) => filterLogs(e)}
              startIcon={<FilterIcon />}
            ></Button>
          </div>
          <div className={classes.spaceSection}>
            <DateTimePicker
              pickerType={DATE_TIME_PICKER_TYPE.DATE_TIME}
              format={DATE_FORMAT.GRID_DISPLAY}
              value={_logStore.startDate}
              placeholder="Start Date"
              variant="dialog"
              allowKeyboardInput={false}
              clearable={true}
              okLabel={''}
              cancelLabel={''}
              onChange={date => {
                _logStore.setStartDate(date);
                applyFilter();
              }}
            />
          </div>
          <div>
            <DateTimePicker
              pickerType={DATE_TIME_PICKER_TYPE.DATE_TIME}
              format={DATE_FORMAT.GRID_DISPLAY}
              minDate={moment(_logStore.startDate).format(DATE_FORMAT.GRID_DISPLAY)}
              value={_logStore.endDate}
              placeholder="End Date"
              variant="dialog"
              allowKeyboardInput={false}
              clearable={true}
              okLabel={''}
              cancelLabel={''}
              onChange={date => {
                _logStore.setEndDate(date);
                applyFilter();
              }}
            />
          </div>
        </div>
        <div className={classes.mainroot}>
          <div className={classes.mainContent}>
            <CustomAgGridReact
              gridOptions={gridOptions()}
              rowData={gridState.data}
              serverPagination={true}
              paginationData={gridState.pagination}
              customRowsPerPageLabel="Page Size"
              onPaginationChange={request => loadInitialData(request)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default inject('logStore')(observer(Logs));

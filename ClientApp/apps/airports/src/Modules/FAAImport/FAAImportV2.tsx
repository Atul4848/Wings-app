import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AirportStore,
  FAAImportProcess,
  FAA_IMPORT_STATUS_FILTER,
  IMPORT_FILE_TYPE,
  defaultAirportOptions,
  useAirportModuleSecurity,
} from '../Shared';
import ImportFAAFile from '../Shared/Components/ImportFAAFile/ImportFAAFileV2';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CloudUpload } from '@material-ui/icons';
import {
  faaImportStatusOptions,
  faaMergeAllStatusOptions,
  fields,
  importFileTypeOptions
} from './fields';
import MobxReactForm from 'mobx-react-form';
import {
  DATE_FORMAT,
  UIStore,
  Utilities,
  ViewPermission,
  getFormValidation,
  GRID_ACTIONS,
  SearchStore,
  IGridSortFilter,
} from '@wings-shared/core';
import { EDITOR_TYPES, SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { SidebarStore } from '@wings-shared/layout';
import {
  CustomAgGridReact,
  useGridState,
  useAgGrid,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
}

const FAAImport: FC<Props> = ({ ...props }: Props) => {
  const form: MobxReactForm = useMemo(() => getFormValidation(fields), [ fields ]);
  const gridState = useGridState();
  const agGrid = useAgGrid<FAA_IMPORT_STATUS_FILTER, FAAImportProcess>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _airportStore = props.airportStore as AirportStore;
  const searchHeader = useSearchHeader();
  const airportModuleSecurity = useAirportModuleSecurity();
  
  const [ isStatusFilter, setIsStatusFilter ] = useState(false)
  const [ isMergeAllStatusFilter, setIsMergeAllStatusFilter ] = useState(false)

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore.setNavLinks(defaultAirportOptions, 'airports');
    loadInitialData();
  }, [])


  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _airportStore.getFAAImportProcess()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: faaImport => {
          gridState.setGridData(faaImport.results)
          SearchStore.applyDefaultSortFilter(location.pathname, gridState.gridApi);
        },
      });
  }

  /* istanbul ignore next */
  const getNavigationUrl = (model: FAAImportProcess) => {
    const { id, processId, faaImportFileType } = model;
    if (Utilities.isEqual(faaImportFileType, IMPORT_FILE_TYPE.AIRPORT)) {
      return `/airports/import-faa/${id}/${processId}/airports`;
    }
    return `/airports/import-faa/${id}/${processId}/frequencies`;
  };

  /* istanbul ignore next */
  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    if (gridAction === GRID_ACTIONS.EXPORT) {
      const model: FAAImportProcess = agGrid._getTableItem(rowIndex);
      UIStore.setPageLoader(true);
      _airportStore.downloadRuralAirportData(model.processId)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((file: File) => {
          const url = window.URL.createObjectURL(new Blob([ file ]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'RuralAirports.txt');

          // Append to html link element page
          document.body.appendChild(link);

          // Start download
          link.click();

          // Clean up and remove the link
          link.parentNode?.removeChild(link);
        });
      return;
    }
    const sortFilters = gridState.gridApi.getSortModel();
    if (sortFilters) {
      SearchStore.saveSortData(location.pathname, sortFilters as IGridSortFilter[]);
    }
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'File Name',
      field: 'blobName',
    },
    {
      headerName: 'Process Id',
      field: 'processId',
    },
    {
      headerName: 'File Type',
      field: 'faaImportFileType',
      valueFormatter: ({ value }) => importFileTypeOptions[value - 1]?.name || '',
    },
    {
      headerName: 'Process Date',
      field: 'processDate',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN) || '',
    },
    {
      headerName: 'Status',
      field: 'faaImportStatus',
      maxWidth: 200,
      cellRenderer: 'statusRenderer',
      cellRendererParams: {
        getTooltip: node => node.data?.processMessage || node.data?.validationMessage,
      },
    },
    {
      headerName: 'Merge All Status',
      field: 'faaMergeAllStatus',
      maxWidth: 200,
      cellRenderer: 'statusRenderer',
      cellRendererParams: {
        getTooltip: node => node.data?.processMessage || node.data?.validationMessage,
      },
    },
    ...agGrid.auditFields(false),
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        suppressMenu: true
      })
    },
  ];


  /* istanbul ignore next */
  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          color="primary"
          startIcon={<CloudUpload />}
          onClick={onRequestImportFile}
        >
          Import File
        </PrimaryButton>
      </ViewPermission>
    );
  }

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      gridActionProps: {
        isActionMenu: true,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        getEditableState: ({ data }: RowNode) => !Boolean(data.id),
        onAction: gridActions,
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Details',
            action: GRID_ACTIONS.DETAILS,
            to: () => getNavigationUrl(data),
            isHidden: Utilities.isEqual(data.faaImportFileType, IMPORT_FILE_TYPE.RURAL_AIRPORT),
          },
          {
            title: 'Download',
            action: GRID_ACTIONS.EXPORT,
            isHidden: !Utilities.isEqual(data.faaImportFileType, IMPORT_FILE_TYPE.RURAL_AIRPORT),
            isDisabled: !Utilities.isEqual(data.faaImportStatus?.name, 'Completed'),
          },
        ],
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () =>
        Boolean(searchHeader.getFilters().searchValue) ||
        Boolean(searchHeader.getFilters().chipValue?.length),
      doesExternalFilterPass: node => {
        const { chipValue, searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue && !chipValue?.length) {
          return false;
        }
        const _value = chipValue?.length ? chipValue[0]?.label : searchValue
        const { blobName, faaImportStatus, faaImportFileType, faaMergeAllStatus } = node.data as FAAImportProcess;
        return agGrid.isFilterPass(
          {
            [FAA_IMPORT_STATUS_FILTER.NAME]: blobName,
            [FAA_IMPORT_STATUS_FILTER.TYPE]: importFileTypeOptions[faaImportFileType - 1]?.name,
            [FAA_IMPORT_STATUS_FILTER.STATUS]: faaImportStatus.name,
            [FAA_IMPORT_STATUS_FILTER.MERGE_ALL_STATUS]: faaMergeAllStatus.name,
          },
          _value,
          selectInputsValues.get('defaultOption'),
        );
      },
    };
  }

  /* istanbul ignore next */
  const onRequestImportFile = (): void => {
    ModalStore.open(
      <ImportFAAFile
        onImportFileData={file => {
          const { faaImportFileType } = form.values();
          return _airportStore.importFAAFile(file, faaImportFileType?.id);
        }}
        onImportDone={() => {
          form.reset()
          loadInitialData()
        }}
        title="Import FAA File"
        successMessage="FAA File Imported Successfully!"
        form={form}
        inputControl={{
          fieldKey: 'faaImportFileType',
          type: EDITOR_TYPES.DROPDOWN,
          options: importFileTypeOptions
        }}
      />
    );
  }

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(FAA_IMPORT_STATUS_FILTER, FAA_IMPORT_STATUS_FILTER.NAME) ]}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={() => gridState.gridApi?.onFilterChanged()}
        isChipInputControl={isStatusFilter || isMergeAllStatusFilter}
        chipInputProps={{
          options: isStatusFilter ? faaImportStatusOptions : faaMergeAllStatusOptions,
          allowOnlySingleSelect: true,
        }}
        onSearch={(sv) => gridState.gridApi?.onFilterChanged()}
        onSelectionChange={(fieldKey, updatedValue) => {
          searchHeader.onSelectionChange(fieldKey, updatedValue);
          setIsStatusFilter(Utilities.isEqual(updatedValue, FAA_IMPORT_STATUS_FILTER.STATUS))
          setIsMergeAllStatusFilter(Utilities.isEqual(updatedValue, FAA_IMPORT_STATUS_FILTER.MERGE_ALL_STATUS))
        }}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
}

export default inject('airportStore', 'sidebarStore')(observer(FAAImport));

import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  RowNode,
} from 'ag-grid-community';
import {
  agGridUtilities,
  CustomAgGridReact,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import {
  DATE_FORMAT,
  Utilities,
  UIStore,
  IAPIGridRequest,
  IAPIPageResponse,
  GridPagination,
  ViewPermission,
  ISelectOption,
  getFormValidation,
} from '@wings-shared/core';
import {
  customerSidebarOptions,
  CustomerStore,
  IMPORT_CUSTOMS_DECAL_FILTER,
  ImportCustomsDecalModel,
  useCustomerModuleSecurity
} from '../Shared';
import MobxReactForm from 'mobx-react-form';
import { fields, gridFilters, statusOptions } from './fields';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { CloudDownload, CloudUpload } from '@material-ui/icons';
import { ImportDialog, SidebarStore } from '@wings-shared/layout';
import { EDITOR_TYPES, SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useStyles } from './ImportCustomsDecal.styles';
import { DownloadIcon } from '@uvgo-shared/icons';
import { Tooltip } from '@material-ui/core';


interface Props {
  customerStore?: CustomerStore;
  sidebarStore?: typeof SidebarStore;
}

const ImportCustomsDecal: FC<Props> = ({ customerStore, sidebarStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<IMPORT_CUSTOMS_DECAL_FILTER, ImportCustomsDecalModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _customerStore = customerStore as CustomerStore;
  const customerModuleSecurity = useCustomerModuleSecurity();
  const form: MobxReactForm = useMemo(() => getFormValidation(fields), [ fields ]);

  // Load Data on Mount
  useEffect(() => {
    sidebarStore?.setNavLinks(customerSidebarOptions(true), 'customer');
    loadImportedDecals();
  }, []);

  /* istanbul ignore next */
  const _searchFilters = (): IAPIGridRequest => {
    const { searchValue, chipValue, selectInputsValues } = searchHeader.getFilters()
    if (!searchValue && !chipValue.length) {
      return {};
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, selectInputsValues.get('defaultOption'))
    );
    const filterKey = property?.columnId || '';
    const filter = searchHeader.searchValue
      ? { [filterKey]: searchHeader.searchValue }
      : Boolean(chipValue)
        ? { customsDecalImportFileStatusId: (chipValue[0] as ISelectOption)?.value }
        : null;
    return {
      filterCollection: JSON.stringify([{ ...filter }]),
    };
  };

  /* istanbul ignore next */
  const loadImportedDecals = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ..._searchFilters(),
    };
    UIStore.setPageLoader(true);
    _customerStore
      ?.getImportedDecalsData(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
      });
  };


  /* istanbul ignore next */
  const importCustomsDecal = (file: File): void => {
    const { decalImportYear } = form.values()
    const year = Utilities.getformattedDate(decalImportYear, DATE_FORMAT.YEAR_PICKER_FORMAT)
    UIStore.setPageLoader(true);
    _customerStore
      ?.importCustomsDecal(file, year)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          form.reset()
          ModalStore.close();
        })
      )
      .subscribe(() => loadImportedDecals());
  };

  /* istanbul ignore next */
  const downloadDecalTemplate = (): void => {
    UIStore.setPageLoader(true);
    _customerStore
      ?.downloadDecalTemplate()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((file: File) => {
        const url = window.URL.createObjectURL(new Blob([ file ]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'CustomsDecal.xlsx');
        // Append to html link element page
        document.body.appendChild(link);
        // Start download
        link.click();
        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });
  };

  /* istanbul ignore next */
  const openImportDecalDialog = (): void => {
    ModalStore.open(
      <ImportDialog
        title="Import Customs Decal"
        classes={{ paperSize: classes.paperSize }}
        isLoading={() => UIStore.pageLoading}
        onUploadFile={importCustomsDecal}
        form={form}
        inputControl={{
          fieldKey: 'decalImportYear',
          type: EDITOR_TYPES.DATE,
          dateTimeFormat: DATE_FORMAT.YEAR_PICKER_FORMAT,
          datePickerViews: [ 'year' ],
          allowKeyboardInput: false
        }}
      />
    );
  };

  const downloadLogFile = (rowIndex: number) => {
    const model: ImportCustomsDecalModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _customerStore
      ?.downloadDecalLogFile(model.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((file: File) => {
        const url = window.URL.createObjectURL(new Blob([ file ]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'DecalLogFile.txt');

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });
  }

  const viewRenderer = (rowIndex: number, { data }: RowNode) => {
    return (
      <ViewPermission hasPermission={Boolean(data?.validationMessage)}>
        <Tooltip title="Download Log File">
          <PrimaryButton
            variant="outlined"
            color="primary"
            disabled={UIStore.pageLoading}
            onClick={() => downloadLogFile(rowIndex)}
            className={classes.downloadButton}
          >
            <DownloadIcon />
          </PrimaryButton>
        </Tooltip>
      </ViewPermission>
    );
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'File Name',
      field: 'blobName',
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
      field: 'customsDecalImportFileStatus',
      cellRenderer: 'statusRenderer',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRenderer: 'viewRenderer',
        maxWidth: 100,
        cellRendererParams: {
          getViewRenderer: viewRenderer
        }
      })
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      onFilterChanged: (e) => loadImportedDecals()
    };
  };


  // right content for search header
  const rightContent = (): ReactNode => {
    return (
      <>
        <PrimaryButton
          variant="contained"
          startIcon={<CloudDownload />}
          onClick={downloadDecalTemplate}
          disabled={UIStore.pageLoading}>
          Download Template
        </PrimaryButton>
        <ViewPermission hasPermission={customerModuleSecurity.isEditable}>
          <PrimaryButton
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />}
            onClick={openImportDecalDialog}
            disabled={UIStore.pageLoading}
          >
            Import Customs Decal
          </PrimaryButton>
        </ViewPermission>
      </>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(IMPORT_CUSTOMS_DECAL_FILTER, IMPORT_CUSTOMS_DECAL_FILTER.NAME)
        ]}
        isChipInputControl={Utilities.isEqual(
          searchHeader.selectInputsValues.get('defaultOption'),
          IMPORT_CUSTOMS_DECAL_FILTER.STATUS
        )}
        chipInputProps={{
          options: statusOptions,
          allowOnlySingleSelect: true,
        }}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={loadImportedDecals}
        onSearch={sv => loadImportedDecals()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadImportedDecals}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('customerStore', 'sidebarStore')(observer(ImportCustomsDecal));

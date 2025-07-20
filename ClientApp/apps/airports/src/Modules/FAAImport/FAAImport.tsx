import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AirportStore,
  FAAImportProcess,
  FAA_IMPORT_STATUS_FILTER,
  AirportModuleSecurity,
  IMPORT_FILE_TYPE,
  defaultAirportOptions,
} from '../Shared';
import ImportFAAFile from '../Shared/Components/ImportFAAFile/ImportFAAFile';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CloudUpload } from '@material-ui/icons';
import { faaGgridFilters, faaImportStatusOptions, faaMergeAllStatusOptions, fields } from './fields';
import { action, observable } from 'mobx';
import MobxReactForm from 'mobx-react-form';
import {
  DATE_FORMAT,
  UIStore,
  Utilities,
  ISelectOption,
  ViewPermission,
  getFormValidation,
  SettingsTypeModel,
  IBaseGridFilterSetup,
  GRID_ACTIONS,
  cellStyle,
  SearchStore,
  IGridSortFilter,
} from '@wings-shared/core';
import { FaaMergedStatus } from './Components';
import { EDITOR_TYPES, SearchHeader } from '@wings-shared/form-controls';
import { SidebarStore } from '@wings-shared/layout';
import {
  AgGridViewRenderer,
  CustomAgGridReact,
  BaseGrid,
  AgGridGroupHeader,
  AgGridActions,
} from '@wings-shared/custom-ag-grid';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
}

const filterSetup: IBaseGridFilterSetup<FAA_IMPORT_STATUS_FILTER> = {
  defaultFilterType: FAA_IMPORT_STATUS_FILTER.NAME,
  defaultPlaceHolder: 'Search by File Name',
  apiFilterDictionary: faaGgridFilters,
  filterTypesOptions: Object.values(FAA_IMPORT_STATUS_FILTER),
};

const importFileTypeOptions: SettingsTypeModel[] = [
  new SettingsTypeModel({ name: 'Airport', id: IMPORT_FILE_TYPE.AIRPORT }),
  new SettingsTypeModel({ name: 'Frequency', id: IMPORT_FILE_TYPE.FREQUENCY }),
  new SettingsTypeModel({ name: 'Rural Airport', id: IMPORT_FILE_TYPE.RURAL_AIRPORT }),
];

@inject('airportStore', 'sidebarStore')
@observer
class FAAImport extends BaseGrid<Props, FAAImportProcess, FAA_IMPORT_STATUS_FILTER> {
  @observable public searchChips: ISelectOption[] = [];
  @observable public form: MobxReactForm = getFormValidation(fields);

  constructor(props) {
    super(props, filterSetup);
  }

  componentDidMount() {
    this.props.sidebarStore?.setNavLinks(defaultAirportOptions, 'airports');
    this.loadInitialData();
  }

  private get isStatusFilter(): boolean {
    return Utilities.isEqual(this.selectedOption, FAA_IMPORT_STATUS_FILTER.STATUS);
  }

  private get isMergeAllStatusFilter(): boolean {
    return Utilities.isEqual(this.selectedOption, FAA_IMPORT_STATUS_FILTER.MERGE_ALL_STATUS);
  }

  /* istanbul ignore next */
  private loadInitialData() {
    UIStore.setPageLoader(true);
    this.props.airportStore
      ?.getFAAImportProcess()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: faaImport => {
          this.data = faaImport.results;
          SearchStore.applyDefaultSortFilter(location.pathname, this.gridApi);
        },
      });
  }

  /* istanbul ignore next */
  private getNavigationUrl = (model: FAAImportProcess) => {
    const { id, processId, faaImportFileType } = model;
    if (Utilities.isEqual(faaImportFileType, IMPORT_FILE_TYPE.AIRPORT)) {
      return `/airports/import-faa/${id}/${processId}/airports`;
    }
    return `/airports/import-faa/${id}/${processId}/frequencies`;
  };

  /* istanbul ignore next */
  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }

    if (gridAction === GRID_ACTIONS.EXPORT) {
      const model: FAAImportProcess = this._getTableItem(rowIndex);
      UIStore.setPageLoader(true);
      this.props.airportStore
        ?.downloadRuralAirportData(model.processId)
        .pipe(
          takeUntil(this.destroy$),
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
    const sortFilters = this.gridApi.getSortModel();
    if (sortFilters) {
      SearchStore.saveSortData(location.pathname, sortFilters as IGridSortFilter[]);
    }
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
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
      cellRenderer: 'viewRenderer',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellRendererParams: {
        getViewRenderer: (_, rowNode: RowNode) => (
          <FaaMergedStatus {...rowNode} rowIndex={Number(rowNode.rowIndex)} fieldKey="faaImportStatus" />
        ),
      },
    },
    {
      headerName: 'Merge All Status',
      field: 'faaMergeAllStatus',
      maxWidth: 200,
      cellRenderer: 'viewRenderer',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellRendererParams: {
        getViewRenderer: (_, rowNode) => <FaaMergedStatus {...rowNode} fieldKey="faaMergeAllStatus" />,
      },
    },
    ...this.auditFields,
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      editable: false,
      sortable: false,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  private setSelectedOption(selectedOption: FAA_IMPORT_STATUS_FILTER): void {
    this.searchChips = [];
    this._setSelectedOption(selectedOption);
    this.gridApi?.onFilterChanged();
  }

  @action
  protected onChipAddOrRemove(searchChips: ISelectOption[]): void {
    // if multiple items then select last item
    this.searchChips = searchChips?.length > 1 ? [].concat(searchChips?.pop() as any) : searchChips;
    this._setSearchValue(this.searchChips[0]?.label);
    if (!this.gridApi) {
      return;
    }
    this.gridApi.onFilterChanged();
  }

  /* istanbul ignore next */
  private get rightContent(): ReactNode {
    return (
      <ViewPermission hasPermission={AirportModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          color="primary"
          startIcon={<CloudUpload />}
          onClick={() => this.onRequestImportFile()}
        >
          Import File
        </PrimaryButton>
      </ViewPermission>
    );
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      gridActionProps: {
        isActionMenu: true,
        showDeleteButton: false,
        getDisabledState: () => this.hasError,
        getEditableState: ({ data }: RowNode) => !Boolean(data.id),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Details',
            action: GRID_ACTIONS.DETAILS,
            to: () => this.getNavigationUrl(data),
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
      frameworkComponents: {
        actionRenderer: AgGridActions,
        viewRenderer: AgGridViewRenderer,
        customHeader: AgGridGroupHeader,
      },
      doesExternalFilterPass: node => {
        const { blobName, faaImportStatus, faaImportFileType, faaMergeAllStatus } = node.data as FAAImportProcess;
        return this._isFilterPass(
          {
            [FAA_IMPORT_STATUS_FILTER.NAME]: blobName,
            [FAA_IMPORT_STATUS_FILTER.TYPE]: importFileTypeOptions[faaImportFileType - 1]?.name,
            [FAA_IMPORT_STATUS_FILTER.STATUS]: faaImportStatus.name,
            [FAA_IMPORT_STATUS_FILTER.MERGE_ALL_STATUS]: faaMergeAllStatus.name,
          },
          this.isStatusFilter || this.isMergeAllStatusFilter
        );
      },
    };
  }

  /* istanbul ignore next */
  private onRequestImportFile(): void {
    const { airportStore } = this.props as Required<Props>;
    ModalStore.open(
      <ImportFAAFile
        onImportFileData={file => {
          const { faaImportFileType } = this.form.values();
          return airportStore?.importFAAFile(file, faaImportFileType?.id);
        }}
        onImportDone={() => this.loadInitialData()}
        title="Import FAA File"
        successMessage="FAA File Imported Successfully!"
        form={this.form}
        inputControl={{
          fieldKey: 'faaImportFileType',
          type: EDITOR_TYPES.DROPDOWN,
          options: importFileTypeOptions
        }}
      />
    );
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this.setSelectedOption(selectedOption as FAA_IMPORT_STATUS_FILTER)}
          options={
            this.isStatusFilter ? faaImportStatusOptions : this.isMergeAllStatusFilter ? faaMergeAllStatusOptions : []
          }
          isChipInputControl={this.isStatusFilter || this.isMergeAllStatusFilter}
          chipValue={this.searchChips}
          onChipAddOrRemove={(chips: ISelectOption[]) => this.onChipAddOrRemove(chips)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={this.rightContent}
          expandCollapse={() => this.autoSizeColumns()}
        />
        <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default FAAImport;

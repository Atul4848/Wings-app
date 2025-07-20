import React, { ReactNode } from 'react';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  ICellEditorParams,
  RowEditingStartedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { finalize, takeUntil, debounceTime } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { VIEW_MODE } from '@wings/shared';
import {
  AirportFrequencyModel,
  AirportStore,
  AirportSettingsStore,
  AirportModuleSecurity,
  AirportModel,
} from '../../../Shared';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { NavigateFunction } from 'react-router';
import { withStyles } from '@material-ui/core';
import { styles } from './AirportFrequency.styles';
import { forkJoin } from 'rxjs';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Logger } from '@wings-shared/security';
import {
  Utilities,
  withRouter,
  regex,
  UIStore,
  IClasses,
  ISelectOption,
  ViewPermission,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmDialog } from '@wings-shared/layout';
import {
  AgGridCellEditor,
  AgGridActions,
  AgGridAutoComplete,
  BaseGrid,
  CustomAgGridReact,
  AgGridGroupHeader,
  AgGridStatusBadge
} from '@wings-shared/custom-ag-grid';
import AssociatedRunways from './AssociatedRunways';

interface Props {
  classes?: IClasses;
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  viewMode?: VIEW_MODE;
  params?: { viewMode: VIEW_MODE; airportId: string };
  navigate?: NavigateFunction;
}

@inject('airportStore', 'airportSettingsStore')
@observer
class AirportFrequency extends BaseGrid<Props, AirportFrequencyModel> {
  private readonly alertMessageId: string = 'FrequencyAlertMessage';
  @observable private hasFrequencyValue: boolean = false;
  @observable private hasPhoneValue: boolean = false;
  @observable protected viewMode: VIEW_MODE;
  @observable protected isChildRowEditing: boolean = false;

  constructor(p: Props) {
    super(p);
    this.viewMode = this.props.params?.viewMode || VIEW_MODE.NEW;
  }

  /* istanbul ignore next */
  componentDidMount() {
    const { airportFrequencies } = this.selectedAirport;
    this.data = airportFrequencies;
    this.isRowEditingStarted$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
      this.setRequiredRules();
      this.hasError = true;
    });
  }

  /* istanbul ignore next */
  private get airportId(): number {
    return Utilities.getNumberOrNullValue(this.props.params?.airportId) as number;
  }

  /* istanbul ignore next */
  private get selectedAirport(): AirportModel {
    return this.props.airportStore?.selectedAirport as AirportModel;
  }

  /* istanbul ignore next */
  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  /* istanbul ignore next */
  private loadSettingsData(): void {
    UIStore.setPageLoader(true);
    forkJoin([ this.airportSettingsStore.loadFrequencyTypes(), this.airportSettingsStore.loadSectors() ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        this._startEditingCell(rowIndex, this.columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        this.upsertAirportFrequency(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        this.confirmRemoveRecord(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  private confirmRemoveRecord(rowIndex: number): void {
    const model: AirportFrequencyModel = this._getTableItem(rowIndex);
    if (model.id === 0) {
      this.deleteAirportFrequency(model);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this record?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.deleteAirportFrequency(model)}
      />
    );
  }

  /* istanbul ignore next */
  private deleteAirportFrequency(model: AirportFrequencyModel): void {
    ModalStore.close();
    UIStore.setPageLoader(true);
    this.props.airportStore
      ?.removeAirportFrequency(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: string) => {
          this._removeTableItems([ model ]);
          this.data = this._getAllTableRows();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  // Called from Ag Grid Component
  @action
  public onInputChange({ colDef, data }: ICellEditorParams, value: string): void {
    this.setRequiredRules();
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  // Called from Ag Grid Component
  @action
  public onDropDownChange({ colDef, data }: ICellEditorParams, value: ISelectOption): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  private addAirportFrequency(): void {
    this._setColumnVisible('actionRenderer', true);
    const model: AirportFrequencyModel = new AirportFrequencyModel({ id: 0, airportId: this.airportId });
    this._addNewItems([ model ], { startEditing: true, colKey: 'frequencyType' });
    this.hasError = true;
  }

  /* istanbul ignore next */
  private upsertAirportFrequency(rowIndex: number): void {
    const model = this._getTableItem(rowIndex);
    if (this.isAlreadyExists(model)) {
      return;
    }
    this.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    this.props.airportStore
      ?.upsertAirportFrequency(model, this.selectedAirport.runways)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportFrequencyModel) => {
          this._updateTableItem(rowIndex, response);
          this.setSelectedAirport(response, !Boolean(model.id));
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  }

  private setSelectedAirport(updatedFrequency: AirportFrequencyModel, isNew: boolean): void {
    const { airportFrequencies, ...rest } = this.selectedAirport;
    const frequencies: AirportFrequencyModel[] = isNew
      ? [ ...airportFrequencies, updatedFrequency ]
      : airportFrequencies.map(a => (a.id === updatedFrequency.id ? updatedFrequency : a));
    this.props.airportStore?.setSelectedAirport(new AirportModel({ ...rest, airportFrequencies: frequencies }));
  }

  @action
  private setRequiredRules(): void {
    this.hasFrequencyValue = Boolean(this.getInstanceValue('frequency'));
    this.hasPhoneValue = Boolean(this.getInstanceValue('phone'));
    this.getComponentInstance('frequency')?.setRules(!this.hasPhoneValue ? 'required|string|max:25' : 'string|max:25');
    this.getComponentInstance('phone')?.setRules(!this.hasFrequencyValue ? 'required|string|max:20' : 'string|max:20');
  }

  /* istanbul ignore next */
  private isAlreadyExists(data: AirportFrequencyModel): boolean {
    const frequencyTypeId = this.getCellEditorInstance('frequencyType').getValue()?.id;
    const sectorId = this.getCellEditorInstance('sector').getValue()?.id;
    const frequency = this.getCellEditorInstance('frequency').getValue();

    const isExists = this.data
      .filter(x => x.id !== data.id)
      .some(x => {
        if (Utilities.isEqual(x.frequencyType?.id, frequencyTypeId)) {
          const isSectorMatch = sectorId ? Utilities.isEqual(x.sector?.id, sectorId) : !Boolean(x.sector?.id);
          if (isSectorMatch) {
            this.showAlert('Frequency Type and Sector should be unique.', this.alertMessageId);
            return true;
          }
          // implemented as per 94280
          const isFrequencyMatch = frequency ? Utilities.isEqual(x.frequency, frequency) : !Boolean(x.frequency);
          if (isFrequencyMatch) {
            this.showAlert('Frequency Type and Frequency should be unique.', this.alertMessageId);
            return true;
          }
        }

        return false;
      });
    return isExists;
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Frequency Type',
      field: 'frequencyType',
      cellRenderer: 'agGroupCellRenderer',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Frequency Type',
        getAutoCompleteOptions: () => this.airportSettingsStore.frequencyTypes,
      },
    },
    {
      headerName: 'Sector',
      field: 'sector',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        placeHolder: 'Sector',
        getAutoCompleteOptions: () => this.airportSettingsStore.sectors,
      },
    },
    {
      headerName: 'Frequency',
      field: 'frequency',
      valueFormatter: ({ value }: ValueFormatterParams) => (!this.isRowEditing && value ? `${value} MHz` : value),
      cellEditorParams: {
        placeHolder: 'Frequency',
      },
    },
    {
      headerName: 'Phone',
      field: 'phone',
      cellEditorParams: {
        placeHolder: 'Phone',
        validators: ({ field }) => {
          return [
            Boolean(field.value) ? regex.phoneNumberWithHyphen.test(field.value) : true,
            'Please enter valid Phone Number',
          ];
        },
      },
    },
    {
      headerName: 'Comments',
      field: 'comments',
      cellEditorParams: {
        placeHolder: 'Comments',
        rules: 'string|max:100',
      },
    },
    {
      headerName: 'FAA Comments',
      field: 'faaComments',
      cellEditorParams: {
        placeHolder: 'FAA Comments',
        rules: 'string|max:100',
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      editable: false,
      cellRenderer: 'statusRenderer',
      comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value?.name || '',
    },
    ...this.auditFields,
    {
      headerName: '',
      field: 'actionRenderer',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 150,
      minWidth: 130,
      suppressSizeToFit: true,
      suppressNavigable: true,
      suppressMenu: true,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: AirportModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: false,
        hideActionButtons: !AirportModuleSecurity.isEditable,
        getTooltip: () => this.commonErrorMessage,
        getDisabledState: () => this.hasError,
        getVisibleState: () => !this.isChildRowEditing,
        onAction: this.gridActions.bind(this),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      detailCellRenderer: 'customDetailCellRenderer',
      suppressScrollOnNewData: true,
      detailCellRendererParams: {
        isMasterDetails: true,
        isEditable: AirportModuleSecurity.isEditable,
        isParentRowEditing: () => this.isRowEditing,
        airportStore: this.props.airportStore,
        onChildRowEditing: (isChildRowEditing: boolean) => {
          this.isChildRowEditing = isChildRowEditing;
        },
        onRunwayUpdate: (rowIndex, updatedData) => {
          this._updateTableItem(rowIndex, updatedData);
          this.setSelectedAirport(updatedData, !Boolean(updatedData.id));
          this.gridApi.redrawRows();
        },
      },
      frameworkComponents: {
        customCellEditor: AgGridCellEditor,
        actionRenderer: AgGridActions,
        customAutoComplete: AgGridAutoComplete,
        customHeader: AgGridGroupHeader,
        customDetailCellRenderer: AssociatedRunways,
        statusRenderer: AgGridStatusBadge,
      },
      onGridReady: (param: GridReadyEvent) => {
        this._onGridReady(param);
        this._setColumnVisible('actionRenderer', AirportModuleSecurity.isEditable && this.selectedAirport?.isActive);
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        this._onRowEditingStarted(event);
        this.loadSettingsData();
      },
    };
  }

  private get headerActions(): ReactNode {
    return (
      <DetailsEditorHeaderSection
        title={this.selectedAirport?.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;

    if (this.loader.isLoading) {
      return this.loader.spinner;
    }

    const _disabled =
      this.isChildRowEditing ||
      this.isProcessing ||
      !AirportModuleSecurity.isEditable ||
      !this.selectedAirport?.isActive;

    return (
      <DetailsEditorWrapper headerActions={this.headerActions} isEditMode={false}>
        <div className={classes.buttonContainer}>
          <ViewPermission hasPermission={AirportModuleSecurity.isEditable}>
            <PrimaryButton
              variant="contained"
              startIcon={<AddIcon />}
              disabled={_disabled}
              onClick={() => this.addAirportFrequency()}
            >
              Add Airport Frequency
            </PrimaryButton>
          </ViewPermission>
        </div>
        <div className={classes.gridWrapper}>
          <CustomAgGridReact rowData={this.data} gridOptions={this.gridOptions} isRowEditing={this.isRowEditing} />
        </div>
      </DetailsEditorWrapper>
    );
  }
}

export default withRouter(withStyles(styles)(AirportFrequency));
export { AirportFrequency as PureAirportFrequency };

import React, { FC, ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import {
  PermitDocumentFarTypeModel,
  PermitDocumentModel,
  PermitSettingsStore,
  PermitStore,
  usePermitModuleSecurity,
} from '../../../Shared';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { BaseAirportStore, BaseCountryStore, VIEW_MODE } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  ICellRendererParams,
  ICellEditorParams,
  RowEditingStartedEvent,
  ICellEditor,
  RowNode,
} from 'ag-grid-community';
import { useParams } from 'react-router';
import {
  DATE_FORMAT,
  ENTITY_STATE,
  EntityMapModel,
  GRID_ACTIONS,
  IOptionValue,
  IdNameCodeModel,
  SelectOption,
  SettingsTypeModel,
  UIStore,
  Utilities,
  getStringToYesNoNull,
  getYesNoNullToBoolean,
  regex,
} from '@wings-shared/core';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import { Chip, debounce } from '@material-ui/core';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { observable } from 'mobx';
import PermitDocumentValueEditor, { IChildRef } from './PermitDocumentValueEditor';
import PermitConditionValueRenderer from './PermitConditionValueRenderer';

interface Props extends ICellRendererParams {
  permitSettingsStore?: PermitSettingsStore;
  permitStore?: PermitStore;
  onDataSave: (response: PermitDocumentModel[]) => void;
  permitDocuments: PermitDocumentModel[];
  isEditable?: boolean;
  onRowEditing: (isEditing: boolean) => void;
  params?: { permitId: number; viewMode: VIEW_MODE };
}

const PermitDocument: FC<Props> = ({
  permitSettingsStore,
  permitStore,
  isEditable,
  onRowEditing,
  onDataSave,
  permitDocuments,
}) => {
  const gridState = useGridState();
  const params = useParams();
  const baseAirportStore = new BaseAirportStore();
  const baseCountryStore = new BaseCountryStore();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<'', PermitDocumentModel>([], gridState);
  const alertMessageId: string = 'PermitDocumentId';
  const _permitSettingsStore = permitSettingsStore as PermitSettingsStore;
  const _permitStore = permitStore as PermitStore;
  const disabledFarType = observable({
    disabledColumns: [],
  });
  const disabledCountryState = observable({
    disabledColumns: [],
  });
  const _useConfirmDialog = useConfirmDialog();
  const optionalColumns = [ 'permitDocumentFarType' ];
  const airport: EntityMapModel[] = observable({
    data: [],
  });
  const state: EntityMapModel[] = observable({
    data: [],
  });
  const conditionValue = observable({
    hasRuleConditionalOperator: false,
    hasRuleField: false,
    hasRuleEntityType: false,
  });
  const permitModuleSecurity = usePermitModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    gridState.setGridData(permitDocuments);
    gridState.isRowEditingStarted$.pipe(debounceTime(300), takeUntil(unsubscribe.destroy$)).subscribe(() => {
      hasConditionValueError();
      gridState.setHasError(true);
      setConditionRules();
    });
  }, [ permitDocuments ]);

  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', isEditable as boolean);
  }, [ isEditable ]);

  /* istanbul ignore next */
  const hasConditionValueError = () => {
    const conditionValues = agGrid.getComponentInstance<IChildRef>('ruleValues');
    conditionValues?.setConditionOperator(agGrid.getInstanceValue('ruleConditionalOperator')?.label);
    agGrid.getComponentInstance('ruleValues')?.setEditorType(agGrid.getInstanceValue('ruleField')?.label);
    conditionValues?.setRules(conditionValue.hasRuleConditionalOperator ? 'required' : '');
    setEditorFlags();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid._getAllTableRows().map(
        doc =>
          new PermitDocumentModel({
            ...doc,
            id: doc.id || Utilities.getTempId(true),
            entityState: ENTITY_STATE.NEW,
          })
      )
    );

    onDataSave(gridState.data);
  };

  const setEditorFlags = (): void => {
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi) || hasConditionValue();
    gridState.commonErrorMessage = hasConditionValue()
      ? 'Value is Required'
      : Utilities.getErrorMessages(gridState.gridApi).toString();
  };

  /* istanbul ignore next */
  const isAlreadyExists = (id: number, document: any): boolean => {
    const isDuplicateData = gridState.data.some(a => Utilities.isEqual(a.document.id, document?.id) && id !== a.id);

    if (isDuplicateData) {
      agGrid.showAlert(`Permit Document already exists with Code:${document.code}`, alertMessageId);
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertDocument = (rowIndex: number) => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({
      columns: [ 'document', 'isApplicableToAllFarTypes', 'permitDocumentFarType' ],
    });
    const doc = editorInstance[0].getValue();
    const isApplicableToAll = editorInstance[1].getValue();
    const farTypes = editorInstance[2].getValue();

    const data: PermitDocumentModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id, doc)) {
      return;
    }
    if (isApplicableToAll === false && !farTypes.length) {
      agGrid.showAlert('FAR Type is required', 'farTypes');
      return;
    }

    if (doc?.id) {
      gridState.gridApi.stopEditing();
      updateTableData();
      onRowEditing(false);
      return;
    }
    onRowEditing(true);
    agGrid.showAlert('Document is required', 'permitDocument');
  };

  const viewRenderer = (chips: PermitDocumentFarTypeModel[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    const numTags = chips.length;
    const limitTags = 1;
    const chipsList = [ ...chips ].slice(0, limitTags);

    return (
      <div>
        {chipsList.map((type: PermitDocumentFarTypeModel, index) => {
          return (
            <Chip
              key={type.id}
              label={type.code || type.label}
              {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
            />
          );
        })}
        {numTags > limitTags && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  const viewRendererAirport = (chips: EntityMapModel[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    const numTags = chips?.length || 0;
    const limitTags = 1;
    const chipsList = [ ...chips ].slice(0, limitTags);
    return (
      <div>
        {chipsList.map((data: EntityMapModel, index) => {
          return (
            <Chip
              key={data.id}
              label={data?.code}
              {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
            />
          );
        })}
        {numTags > limitTags && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  const viewRendererPermitClassification = (
    chips: EntityMapModel[],
    getTagProps?: AutocompleteGetTagProps
  ): ReactNode => {
    const numTags = chips?.length || 0;
    const limitTags = 1;
    const chipsList = [ ...chips ].slice(0, limitTags);
    return (
      <div>
        {chipsList.map((data: EntityMapModel, index) => {
          return (
            <Chip
              key={data.id}
              label={data?.label}
              {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
            />
          );
        })}
        {numTags > limitTags && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  const setConditionRules = (): void => {
    conditionValue.hasRuleConditionalOperator = Boolean(
      agGrid.getInstanceValue<SettingsTypeModel>('ruleConditionalOperator')?.value
    );
    conditionValue.hasRuleField = Boolean(agGrid.getInstanceValue<SettingsTypeModel>('ruleField')?.label);
    conditionValue.hasRuleEntityType = Boolean(agGrid.getInstanceValue<SettingsTypeModel>('ruleEntityType')?.value);
  };

  const hasConditionValue = (): boolean => {
    const instance = agGrid.getComponentInstance<IChildRef>('ruleValues');
    const conditionValues = instance.getValue() ? instance.getValue()[0]?.label?.toString() : '';
    return conditionValue?.hasRuleConditionalOperator && !Boolean(conditionValues);
  };

  const farTypeOptions = (): IdNameCodeModel[] => {
    const options = _permitSettingsStore.farTypes.map(
      x =>
        new IdNameCodeModel({
          id: x.id,
          name: x.name,
          code: x.cappsCode,
        })
    );

    return options;
  };

  const classificationOptions = (): EntityMapModel[] => {
    const options = _permitSettingsStore.permitClassifications.map(
      x =>
        new EntityMapModel({
          name: x.name,
          entityId: x.id,
        })
    );

    return options;
  };

  const ruleFieldOption = () => {
    const options = _permitSettingsStore.ruleEntityParameterConfigs
      .filter(x => x.ruleEntityType?.name === agGrid.getInstanceValue('ruleEntityType')?.label)
      .map(x => new SettingsTypeModel({ id: x.id, name: x.entityParameter }));

    return options;
  };

  const conditionalOpertorOptions = () => {
    const options = _permitSettingsStore.ruleEntityParameterConfigs
      .filter(x => x.entityParameter === agGrid.getInstanceValue('ruleField')?.label)
      .map(x => x.supportedOperators)
      .flat();

    return options;
  };

  /* istanbul ignore next */
  const searchAirports = (propertyValue = ''): void => {
    baseAirportStore
      .searchWingsAirports(propertyValue)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe({
        next: airports =>
          (airport.data = airports.map(
            x =>
              new EntityMapModel({
                name: x.name,
                entityId: x.id,
                code: x.displayCode,
              })
          )),
      });
  };

  /* istanbul ignore next */
  const searchState = (propertyValue = ''): void => {
    baseCountryStore
      .searchStates({ searchValue: propertyValue })
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe({
        next: states =>
          (state.data = states.map(
            x =>
              new EntityMapModel({
                name: x.commonName,
                entityId: x.id,
                code: x.isoCode || x.code || x.cappsCode,
              })
          )),
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Document',
      field: 'document',
      headerTooltip: 'Document',
      cellEditor: 'customAutoComplete',
      minWidth: 180,
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'label'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Document',
        getAutoCompleteOptions: () => _permitSettingsStore.documents,
        valueGetter: (option: IdNameCodeModel) => option.value,
        formatValue: value => value,
      },
    },
    {
      headerName: 'Is Applicable to All Far Types',
      field: 'isApplicableToAllFarTypes',
      cellEditor: 'customSelect',
      minWidth: 150,
      sortable: false,
      headerTooltip: 'Is Applicable to All Far Types',
      valueFormatter: ({ value }) => getStringToYesNoNull(value?.label || value),
      cellEditorParams: {
        placeHolder: '',
        isBoolean: true,
        formatValue: value => getYesNoNullToBoolean(value?.label ?? value),
      },
    },
    {
      headerName: 'FAR Type',
      field: 'permitDocumentFarType',
      cellEditor: 'customAutoComplete',
      filter: false,
      sortable: false,
      minWidth: 180,
      headerTooltip: 'FAR Type',
      cellRenderer: 'agGridChipView',
      cellRendererParams: {
        chipLabelField: 'code',
      },
      cellEditorParams: {
        multiSelect: true,
        disableCloseOnSelect: true,
        placeHolder: 'FAR Type',
        getAutoCompleteOptions: () => farTypeOptions(),
        renderTags: (values: PermitDocumentFarTypeModel[], getTagProps: AutocompleteGetTagProps) =>
          viewRenderer(values, getTagProps),
        getDisableState: () => disabledFarType.disabledColumns.includes('permitDocumentFarType'),
      },
    },
    {
      headerName: 'Oracle Modified Date',
      headerTooltip: 'Modified By',
      field: 'oracleModifiedDate',
      minWidth: 150,
      editable: false,
      sortable: true,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
    },
    {
      headerName: 'Permit Classification',
      field: 'appliedPermitClassifications',
      headerTooltip: 'Permit Classification',
      cellEditor: 'customAutoComplete',
      filter: false,
      minWidth: 180,
      sortable: false,
      cellRenderer: 'agGridChipView',
      cellEditorParams: {
        multiSelect: true,
        disableCloseOnSelect: true,
        placeHolder: 'Permit Classification',
        getAutoCompleteOptions: () => classificationOptions(),
        renderTags: (values: EntityMapModel[], getTagProps: AutocompleteGetTagProps) =>
          viewRendererPermitClassification(values, getTagProps),
      },
    },
    {
      headerName: 'State',
      field: 'appliedPermitDocumentStates',
      cellEditor: 'customAutoComplete',
      filter: false,
      sortable: false,
      headerTooltip: 'State',
      cellRenderer: 'agGridChipView',
      minWidth: 250,
      cellRendererParams: {
        chipLabelField: 'code',
      },
      cellEditorParams: {
        multiSelect: true,
        disableCloseOnSelect: true,
        placeHolder: 'State',
        onSearch: value => searchState(value),
        getAutoCompleteOptions: () => state?.data,
        useControlledValue: true,
        renderTags: (values: EntityMapModel[], getTagProps: AutocompleteGetTagProps) =>
          viewRendererAirport(values, getTagProps),
        getDisableState: () => disabledCountryState.disabledColumns.includes('appliedPermitDocumentStates'),
      },
    },
    {
      headerName: 'Airport',
      field: 'appliedPermitDocumentAirports',
      cellEditor: 'customAutoComplete',
      filter: false,
      headerTooltip: 'Airport',
      cellRenderer: 'agGridChipView',
      minWidth: 250,
      sortable: false,
      cellRendererParams: {
        chipLabelField: 'code',
      },
      cellEditorParams: {
        multiSelect: true,
        disableCloseOnSelect: true,
        placeHolder: 'Airport',
        onSearch: value => searchAirports(value),
        getAutoCompleteOptions: () => {
          return airport?.data;
        },
        useControlledValue: true,
        renderTags: (values: EntityMapModel[], getTagProps: AutocompleteGetTagProps) =>
          viewRendererAirport(values, getTagProps),
        getDisableState: () => disabledCountryState.disabledColumns.includes('appliedPermitDocumentAirports'),
      },
    },
    {
      headerName: 'Entity Type',
      field: 'ruleEntityType',
      cellEditor: 'customAutoComplete',
      headerTooltip: 'Entity Type',
      minWidth: 140,
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'label'),
      cellEditorParams: {
        placeHolder: 'Entity Type',
        getAutoCompleteOptions: () => _permitSettingsStore.ruleEntities,
      },
    },
    {
      headerName: 'Field',
      field: 'ruleField',
      minWidth: 180,
      headerTooltip: 'Field',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'label'),
      valueFormatter: ({ value }) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Field',
        getAutoCompleteOptions: () => ruleFieldOption(),
        isRequired: () => agGrid.getInstanceValue('ruleEntityType')?.label,
        getDisableState: (node: RowNode) => !conditionValue.hasRuleEntityType,
      },
    },
    {
      headerName: 'Conditional Operator',
      field: 'ruleConditionalOperator',
      cellEditor: 'customAutoComplete',
      headerTooltip: 'Conditional Operator',
      minWidth: 190,
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'label'),
      cellEditorParams: {
        placeHolder: 'Conditional Operator',
        getAutoCompleteOptions: () => conditionalOpertorOptions(),
        isRequired: () =>
          agGrid.getInstanceValue('ruleField')?.label && agGrid.getInstanceValue('ruleEntityType')?.label,
        getDisableState: (node: RowNode) => !conditionValue.hasRuleField,
      },
    },
    {
      headerName: 'Value',
      headerTooltip: 'Value',
      field: 'ruleValues',
      minWidth: 150,
      cellRenderer: 'conditionValueRenderer',
      cellEditor: 'conditionValueEditor',
      sortable: false,
      cellEditorParams: {
        getDisableState: (node: RowNode) => !conditionValue.hasRuleConditionalOperator,
        isRequired: (node: RowNode) => {
          return (
            conditionValue.hasRuleConditionalOperator && conditionValue.hasRuleField && conditionValue.hasRuleEntityType
          );
        },
        settingsStore: _permitSettingsStore,
        permitStore: _permitStore,
        isLoading: () => UIStore.pageLoading,
      },
    },

    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
            },
            {
              title: 'Delete',
              action: GRID_ACTIONS.DELETE,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const deleteDocument = (model: PermitDocumentModel): void => {
    ModalStore.close();
    agGrid._removeTableItems([ model ]);
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  const confirmRemoveDocument = (rowIndex: number): void => {
    const model: PermitDocumentModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteDocument(model);
      return;
    }

    _useConfirmDialog.confirmAction(() => deleteDocument(model), {
      isDelete: true,
    });
  };

  const setDisableColumns = (isApplicableToAll: IOptionValue) => {
    if (
      Utilities.isEqual((isApplicableToAll as SelectOption)?.label, 'Yes') ||
      Utilities.isEqual(isApplicableToAll as boolean, true)
    ) {
      disabledFarType.disabledColumns = [ 'permitDocumentFarType' ];
      return;
    }
    disabledFarType.disabledColumns = [];
    return;
  };

  const cancelEditing = (rowIndex): void => {
    agGrid.cancelEditing(rowIndex);

    const tableData = agGrid._getAllTableRows();
    if (!tableData.length) {
      onRowEditing(false);
      return;
    }

    const data: PermitDocumentModel = agGrid._getTableItem(rowIndex);
    if (data?.id) {
      setDisableColumns(data?.isApplicableToAllFarTypes);
      onRowEditing(false);
    }
  };

  const startEditing = (index: number, field: string) => {
    const data = agGrid._getTableItem(index);
    const { isApplicableToAllFarTypes } = data;
    setDisableColumns(isApplicableToAllFarTypes);
    agGrid._startEditingCell(index, field);
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        startEditing(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertDocument(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        cancelEditing(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveDocument(rowIndex);
        break;
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const hasConditionValueEdittor = (field: any, value: any): void => {
    const conditionValues = agGrid.getComponentInstance<IChildRef>('ruleValues');
    const checkEntityField =
      !agGrid.getInstanceValue('ruleField')?.label && !agGrid.getInstanceValue('ruleConditionalOperator')?.label;
    switch (field) {
      case 'isApplicableToAllFarTypes':
        if (value) {
          agGrid.getComponentInstance('permitDocumentFarType').setValue([]);
          disabledFarType.disabledColumns = optionalColumns;
          return;
        }
        disabledFarType.disabledColumns = [];
        break;
      case 'ruleEntityType':
        agGrid.getComponentInstance('ruleField').setValue(null);
        agGrid.getComponentInstance('ruleConditionalOperator').setValue(null);
        agGrid.getComponentInstance('ruleValues')?.setValue([]);
        setConditionRules();
        break;
      case 'ruleField':
        agGrid.getComponentInstance('ruleConditionalOperator').setValue(null);
        agGrid.getComponentInstance('ruleValues')?.setValue([]);
        setConditionRules();
        break;
      case 'ruleConditionalOperator':
        conditionValues?.setConditionOperator(agGrid.getInstanceValue('ruleConditionalOperator')?.label);
        agGrid.getComponentInstance('ruleValues')?.setEditorType(agGrid.getInstanceValue('ruleField')?.label);
        agGrid.getComponentInstance('ruleValues')?.setValue([]);
        setConditionRules();
        break;
      case 'ruleValues':
        if (!checkEntityField) {
          const ruleFieldValue = agGrid.getInstanceValue('ruleField')?.label;
          switch (ruleFieldValue) {
            case 'FIRAirways':
              const isValidFirAirways = regex.firAirwaysFormat.test(value[0]?.ruleValue?.toString().trim());
              conditionValues?.setRules(isValidFirAirways);
              conditionValues?.setCustomError(!isValidFirAirways ? 'Value format should be like ZJSA(A1)' : '');
              gridState.setHasError(!isValidFirAirways || checkEntityField);
              break;
            case 'MinFlightLevelInCountry':
            case 'MaxFlightLevelInCountry':
              const isValidMaxMin = regex.minMaxFlightLevelInCountry.test(value[0]?.ruleValue?.toString().trim());
              conditionValues?.setRules(isValidMaxMin);
              conditionValues?.setCustomError(!isValidMaxMin ? 'The field must be between -999999 and 99999.' : '');
              gridState.setHasError(!isValidMaxMin || checkEntityField);
              break;
          }
        }
        break;
      case 'appliedPermitDocumentStates':
        if (value?.length) {
          disabledCountryState.disabledColumns = [ 'appliedPermitDocumentAirports' ];
          return;
        }
        disabledCountryState.disabledColumns = [];
        break;
      case 'appliedPermitDocumentAirports':
        if (value?.length) {
          disabledCountryState.disabledColumns = [ 'appliedPermitDocumentStates' ];
          return;
        }
        disabledCountryState.disabledColumns = [];
        break;
      default:
        break;
    }
  };

  const onDropDownChange = (params: ICellEditorParams, value: any): void => {
    hasConditionValueEdittor(params.colDef.field, value);
    // Need Some delay to prepare editor components inside Grid
    debounce(() => hasConditionValueError(), 200)();
  };

  const onInputChange = ({ colDef }: ICellEditorParams, value: string): void => {
    hasConditionValueEdittor(colDef.field, value);
    setEditorFlags();
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onDropDownChange, onInputChange },
      columnDefs: columnDefs,
      isEditable: true,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => isEditable,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(event);
        onRowEditing(true);
        _permitSettingsStore.getPermitClassifications().subscribe();
        _permitSettingsStore.getRuleEntities().subscribe();
        _permitSettingsStore.getRuleEntityParameterConfigs().subscribe();
        const data: PermitDocumentModel = agGrid._getTableItem(event.rowIndex);
        const states = data?.appliedPermitDocumentStates ?? [];
        const airports = data?.appliedPermitDocumentAirports ?? [];

        if (states.length) {
          disabledCountryState.disabledColumns = [ 'appliedPermitDocumentAirports' ];
          return;
        }
        if (airports.length) {
          disabledCountryState.disabledColumns = [ 'appliedPermitDocumentStates' ];
          return;
        }
        disabledCountryState.disabledColumns = [];
      },
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!isEditable) {
          return;
        }
        agGrid._startEditingCell(Number(rowIndex), colDef.field || '');
      },
      onGridReady: param => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', isEditable as boolean);
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        conditionValueEditor: PermitDocumentValueEditor,
        conditionValueRenderer: PermitConditionValueRenderer,
      },
      suppressClickEdit: true,
    };
  };

  const addPermitDocument = (): void => {
    const permitId = params?.permitId;
    disabledFarType.disabledColumns = [];
    const model: PermitDocumentModel = new PermitDocumentModel({ id: 0, permitId: Number(permitId) });
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'document' });
    agGrid.setColumnVisible('actionRenderer', true);
    gridState.setHasError(true);
  };

  return (
    <CollapsibleWithButton
      title="Documents"
      buttonText="Add Document"
      isButtonDisabled={
        gridState.isRowEditing || UIStore.pageLoading || !(permitModuleSecurity.isEditable && isEditable)
      }
      onButtonClick={() => addPermitDocument()}
      onExpandButtonClick={() => agGrid.autoSizeColumns()}
    >
      <ChildGridWrapper hasAddPermission={false}>
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={gridState.data}
          gridOptions={gridOptions()}
          disablePagination={gridState.isRowEditing}
        />
      </ChildGridWrapper>
    </CollapsibleWithButton>
  );
};

export default inject('permitSettingsStore', 'permitStore')(observer(PermitDocument));

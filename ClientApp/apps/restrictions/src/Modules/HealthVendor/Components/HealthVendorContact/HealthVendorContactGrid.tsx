import React, { FC, useEffect } from 'react';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams, RowEditingStartedEvent } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { UIStore, Utilities, GRID_ACTIONS, SettingsTypeModel, regex, ENTITY_STATE } from '@wings-shared/core';
import { CollapsibleWithButton, ConfirmDialog } from '@wings-shared/layout';
import { CONTACT_TYPE, HealthVendorContactModel, HealthVendorStore } from '../../../Shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { useStyles } from './HealthVendorContact.style';

interface Props {
  isEditable: boolean;
  contacts: HealthVendorContactModel[];
  type: CONTACT_TYPE;
  healthVendorStore?: HealthVendorStore;
  onUpdate: (contacts: HealthVendorContactModel, removeModal?: boolean) => void;
  onContactEditing: (isEditing: boolean) => void;
}

const HealthVendorContactGrid: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const agGrid = useAgGrid<any, HealthVendorContactModel>([], gridState);
  const _healthVendorStore = props.healthVendorStore as HealthVendorStore;

  /* istanbul ignore next */
  useEffect(() => {
    UIStore.setPageLoader(true);
    _healthVendorStore
      .getContactLevels()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  }, []);

  const isPhoneType = (): boolean => {
    return Utilities.isEqual(props.type, CONTACT_TYPE.PHONE);
  };

  const contactRegex = (): RegExp => {
    return isPhoneType() ? regex.all : regex.email;
  };

  /* istanbul ignore next */
  const isAlreadyExists = (model: HealthVendorContactModel): boolean => {
    gridState.data = props.contacts;
    const contact: string = agGrid.getCellEditorInstance('contact').getValue();
    const contactLevel: SettingsTypeModel = agGrid.getCellEditorInstance('contactLevel').getValue();
    const isExists = gridState.data.some(x => {
      return (
        Utilities.isEqual(x.contact, contact) &&
        Utilities.isEqual(x.contactLevel?.id, contactLevel?.id) &&
        !x.isSameData(model)
      );
    });
    if (isExists) {
      agGrid.showAlert('Country level and Contact should be unique.', 'healthVendorContactId');
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertContactType = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model)) {
      return;
    }
    gridState.gridApi.stopEditing();
    props.onContactEditing(false);
    props.onUpdate(model);
  };

  const confirmDelete = (rowIndex: number): void => {
    const model: HealthVendorContactModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      agGrid._removeTableItems([ model ]);
      props.onUpdate(model, true);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message={`Are you sure you want to remove this ${props.type}?`}
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          deleteRequirement(rowIndex);
          props.onContactEditing(false);
        }}
      />
    );
  };

  const deleteRequirement = (rowIndex: number): void => {
    ModalStore.close();
    const model: HealthVendorContactModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    _healthVendorStore.healthVendor.healthVendorContacts = _healthVendorStore.healthVendor.healthVendorContacts.filter(
      x => x.id !== model.id
    );
    props.onUpdate(model, true);
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertContactType(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        const model = agGrid._getTableItem(rowIndex);
        agGrid.cancelEditing(rowIndex, Utilities.isEqual(model.entityState || '', ENTITY_STATE.UNCHNAGED));
        props.onContactEditing(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmDelete(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Contact Level',
      field: 'contactLevel',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Contact Level',
        getAutoCompleteOptions: () => _healthVendorStore.contactLevels,
        valueGetter: (option: SettingsTypeModel) => option,
      },
    },
    {
      headerName: 'Contact',
      field: 'contact',
      cellEditorParams: {
        rules: `required|string|between:1,50|regex:${contactRegex()}`,
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        rules: 'string|between:1,100',
        ignoreNumber: true,
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: false,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs: columnDefs,
      isEditable: true,
      gridActionProps: {
        showDeleteButton: true,
        hideActionButtons: !props.isEditable,
        getEditableState: () => props.isEditable,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        if (gridState.isProcessing || UIStore.pageLoading || !props.isEditable) {
          gridState.gridApi.stopEditing();
          return;
        }
        gridState.hasError = true;
        agGrid.startEditingRow(event);
        props.onContactEditing(true);
      },
    };
  };

  const addNewType = () => {
    const contactType = new SettingsTypeModel({ id: isPhoneType() ? 1 : 2 });
    agGrid.addNewItems(
      [
        new HealthVendorContactModel({
          contactType,
        }),
      ],
      {
        startEditing: false,
        colKey: 'contactLevel',
      }
    );
    gridState.setHasError(true);
  };

  return (
    <CollapsibleWithButton
      title={props.type}
      buttonText={`Add ${props.type}`}
      onButtonClick={addNewType}
      isButtonDisabled={gridState.isRowEditing || UIStore.pageLoading || !props.isEditable}
    >
      <div className={classes.root}>
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={props.contacts}
          gridOptions={gridOptions()}
          key={`healthVendorContactGrid-${props.isEditable}`}
          disablePagination={gridState.isRowEditing}
        />
      </div>
    </CollapsibleWithButton>
  );
};

export default inject('healthVendorStore')(observer(HealthVendorContactGrid));

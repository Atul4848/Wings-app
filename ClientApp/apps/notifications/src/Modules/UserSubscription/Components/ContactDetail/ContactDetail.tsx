import React, { ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { AgGridActions, BaseGrid, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import {
  ChannelStore,
  ContactModel,
  ContactStore,
  IAPIUpsertContactRequest,
  SubscriptionStore,
  UserModel,
} from '../../../Shared';
import { observer } from 'mobx-react';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { withStyles, Typography } from '@material-ui/core';
import { AddCircle, ArrowBack } from '@material-ui/icons';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { styles } from './ContactDetail.styles';
import { action } from 'mobx';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import UpsertContact from '../UpsertContact/UpsertContact';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { IClasses, UIStore, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomLinkButton, ConfirmDialog } from '@wings-shared/layout';

interface Props {
  classes: IClasses;
  userSubScriptionRoute: string;
  fullName: string;
  contactStore: ContactStore;
  subscriptionStore: SubscriptionStore;
  channelStore: ChannelStore;
}

@observer
class ContactDetail extends BaseGrid<Props, ContactModel> {
  componentDidMount() {
    if (this.selectedCustomerNumber) {
      this.loadInitialData();
    }
  }

  private get selectedCustomerNumber(): string {
    const customerNumber = this.props.subscriptionStore?.selectedUser?.customerNumber || '';
    return customerNumber;
  }

  /* istanbul ignore next */
  @action
  private loadInitialData(): void {
    const { contactStore } = this.props;
    UIStore.setPageLoader(true);
    contactStore
      .loadContacts(this.selectedCustomerNumber)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((contacts: ContactModel[]) => (this.data = contacts));
  }

  /* istanbul ignore next */
  @action
  private upsertContact(upsertContactRequest: IAPIUpsertContactRequest): void {
    const { contactStore } = this.props;
    UIStore.setPageLoader(true);
    contactStore
      .upsertContact(upsertContactRequest)
      .pipe(
        switchMap(() => contactStore.loadContacts(this.selectedCustomerNumber)),
        takeUntil(this.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => (this.data = response),
        error: (error: AxiosError) => AlertStore.info(error.message),
      });
  }

  /* istanbul ignore next */
  @action
  private deleteContact(contact: ContactModel): void {
    const { contactStore } = this.props;
    UIStore.setPageLoader(true);
    contactStore
      .deleteContact(contact.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        }),
        filter((isDeleted: boolean) => isDeleted)
      )
      .subscribe(
        () => {
          this._removeTableItems([ contact ]);
          AlertStore.info('Contact deleted successfully');
          this.loadInitialData();
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  /* istanbul ignore next */
  private colDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
    },
    {
      headerName: 'Value',
      field: 'value',
    },
    {
      headerName: 'Delivery Type',
      field: 'deliveryTypeName',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      width: 60,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      valueGetter: params => {
        return params.data || null;
      },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          { title: 'Edit', action: GRID_ACTIONS.EDIT },
          { title: 'Delete', action: GRID_ACTIONS.DELETE },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          this.gridActions(action, rowIndex);
        },
      },
    },
  ];

  private openUpsertContactDialog(mode: VIEW_MODE, contactId: number = 0): void {
    const { contactStore, channelStore, subscriptionStore } = this.props;
    ModalStore.open(
      <UpsertContact
        contactStore={contactStore}
        channelStore={channelStore}
        subscriptionStore={subscriptionStore}
        viewMode={mode}
        contactId={contactId}
        upsertContact={(upsertContactRequest: IAPIUpsertContactRequest) => this.upsertContact(upsertContactRequest)}
      />
    );
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }

    const contact = this._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      this.openUpsertContactDialog(VIEW_MODE.EDIT, contact.id);
    }

    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Delete"
          message="Are you sure you want to delete this contact?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => this.deleteContact(contact)}
        />
      );
    }
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    return {
      ...this._gridOptionsBase({
        context: this,
        columnDefs: this.colDefs,
        isEditable: true,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => this.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      frameworkComponents: {
        actionRenderer: AgGridActions,
      },
    };
  }

  render(): ReactNode {
    const { classes, userSubScriptionRoute, fullName } = this.props;
    return (
      <>
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <CustomLinkButton to={userSubScriptionRoute} title="User Subscriptions" startIcon={<ArrowBack />} />
            <div>
              <Typography variant="h6" color="textPrimary" className={classes.contactsHeader}>
                Contacts for {fullName}
              </Typography>
            </div>
          </div>
          <PrimaryButton
            variant="contained"
            color="primary"
            startIcon={<AddCircle />}
            onClick={() => this.openUpsertContactDialog(VIEW_MODE.NEW)}
          >
            Add Contact
          </PrimaryButton>
        </div>
        <div className={classes.root}>
          <div className={classes.gridContainer}>
            <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
          </div>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(ContactDetail);

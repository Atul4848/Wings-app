import React, { ReactNode } from 'react';
import { action, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { VIEW_MODE } from '@wings/shared';
import { AgGridActions, AgGridSwitch, BaseGrid, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import {
  UserModel,
  SubscriptionStore,
  IAPIUpdtateSubscriptionRequest,
  EventTypeStore,
  ContactStore,
  IAPIAddUserSubscriptionRequest,
  UserSubscriptionModel,
  USER_SUBSCRIPTION_FILTER,
  CategoryStore,
} from '../../../Shared';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions } from 'ag-grid-community';
import { styles } from './UserSubscription.styles';
import { AddCircle } from '@material-ui/icons';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AddUserSubscription } from '../index';
import { AlertStore } from '@uvgo-shared/alert';
import {
  IClasses,
  UIStore,
  Utilities,
  ViewPermission,
  SORTING_DIRECTION,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
} from '@wings-shared/core';
import { CustomLinkButton } from '@wings-shared/layout';
import { AutoCompleteControl, SelectInputControl } from '@wings-shared/form-controls';

interface Props {
  classes: IClasses;
  subscriptionStore?: SubscriptionStore;
  contactStore?: ContactStore;
  eventTypeStore?: EventTypeStore;
  categoryStore?: CategoryStore;
}

const filterSetup: IBaseGridFilterSetup<USER_SUBSCRIPTION_FILTER> = {
  defaultPlaceHolder: 'Search User',
  defaultFilterType: USER_SUBSCRIPTION_FILTER.USERNAME,
  filterTypesOptions: [
    USER_SUBSCRIPTION_FILTER.USERNAME,
    USER_SUBSCRIPTION_FILTER.FIRST_NAME,
    USER_SUBSCRIPTION_FILTER.LAST_NAME,
    USER_SUBSCRIPTION_FILTER.CSD_USER_ID,
    USER_SUBSCRIPTION_FILTER.CUSTOMER_NUMBER,
  ],
  apiFilterDictionary: [
    { columnId: 'username', apiPropertyName: 'username', uiFilterType: USER_SUBSCRIPTION_FILTER.USERNAME },
    { columnId: 'firstName', apiPropertyName: 'firstName', uiFilterType: USER_SUBSCRIPTION_FILTER.FIRST_NAME },
    { columnId: 'lastName', apiPropertyName: 'lastName', uiFilterType: USER_SUBSCRIPTION_FILTER.LAST_NAME },

    { columnId: 'csdUserId', apiPropertyName: 'csdUserId', uiFilterType: USER_SUBSCRIPTION_FILTER.CSD_USER_ID },
    {
      columnId: 'customerNumber',
      apiPropertyName: 'customerNumber',
      uiFilterType: USER_SUBSCRIPTION_FILTER.CUSTOMER_NUMBER,
    },
  ],
  defaultSortFilters: [{ sort: SORTING_DIRECTION.ASCENDING, colId: 'username' }],
};

@inject('subscriptionStore', 'contactStore', 'eventTypeStore', 'categoryStore')
@observer
class UserSubscription extends BaseGrid<Props, UserSubscriptionModel, USER_SUBSCRIPTION_FILTER> {
  readonly pageSize: number = 200;

  constructor(props) {
    super(props, filterSetup);
  }

  private get subscriptionStore(): SubscriptionStore {
    return this.props.subscriptionStore as SubscriptionStore;
  }

  componentDidMount() {
    this.data = this.subscriptionStore.selectedUserSubscriptions;
    if (this.subscriptionStore.selectedUser?.id) {
      this.loadUserSubscriptions(this.subscriptionStore.selectedUser);
    }
    if (!this.subscriptionStore.isContactPage) {
      this.subscriptionStore.users = [];
      this.subscriptionStore.selectedUser = new UserModel();
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.subscriptionStore.isContactPage = false;
  }

  /* istanbul ignore next */
  @action
  private loadUsers(searchValue: string): void {
    this.subscriptionStore.selectedUser = new UserModel({ searchStr: searchValue });
    if (searchValue.length <= 2) {
      return;
    }
    UIStore.setPageLoader(true);

    // api property name
    const property = this.filterSetup.apiFilterDictionary?.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as USER_SUBSCRIPTION_FILTER, this.selectedOption)
    );
    const request = {
      limit: this.pageSize,
      searchCollection: JSON.stringify([{ propertyName: property?.apiPropertyName, propertyValue: searchValue }]),
    };
    this.subscriptionStore
      .loadUsers(request)
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(csdUsers => {
        this.subscriptionStore.users = csdUsers.filter(x => x.csdUserId !== 0);
      });
  }

  /* istanbul ignore next */
  @action
  private loadUserSubscriptions(selectedUser: UserModel): void {
    if (!selectedUser) {
      this.subscriptionStore.selectedUser = new UserModel();
      this.subscriptionStore.selectedUserSubscriptions = [];
      return;
    }
    this.subscriptionStore.selectedUser = selectedUser;
    UIStore.setPageLoader(true);
    this.subscriptionStore
      .userSubscriptions(selectedUser.customerNumber)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((subscriptions: UserSubscriptionModel[]) => {
        runInAction(() => {
          this.data = subscriptions;
        });
      });
  }

  /* istanbul ignore next */
  private colDefs: ColDef[] = [
    {
      headerName: 'Enable/Disable',
      field: 'isEnabled',
      cellRenderer: 'switchRenderer',
      cellRendererParams: {
        isReadOnly: false,
      },
    },
    {
      headerName: 'Customer Number',
      field: 'customerNumber',
    },
    {
      headerName: 'Event Type',
      field: 'eventTypeName',
    },
    {
      headerName: 'Category',
      field: 'subscriptionCategory',
    },
    {
      headerName: 'Subscription Type',
      field: 'subscriptionType',
    },
    {
      headerName: 'Contact Name',
      field: 'contactName',
    },
    {
      headerName: 'Contact Value',
      field: 'contactValue',
    },
    {
      headerName: 'Verification Status',
      field: 'status',
    },
  ];

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
        switchRenderer: AgGridSwitch,
      },
    };
  }

  // called form AgGridSwitch
  /* istanbul ignore next */
  @action
  public onSwitchChangeHandler(rowIndex: number, isActive: boolean): void {
    const subscription = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    const request: IAPIUpdtateSubscriptionRequest = {
      SubscriptionId: subscription.id,
      CSDUserId: Number(this.subscriptionStore.selectedUser?.csdUserId),
      IsEnabled: isActive,
    };
    this.subscriptionStore
      .toggleSubscriptionActivation(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(updatedSubScription => this._updateTableItem(rowIndex, updatedSubScription));
  }

  /* istanbul ignore next */
  @action
  private addUserSubscription(request: IAPIAddUserSubscriptionRequest): void {
    UIStore.setPageLoader(true);
    this.subscriptionStore
      .addUserSubscription(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(
        () => {
          this.loadUserSubscriptions(this.subscriptionStore.selectedUser as UserModel);
          AlertStore.info('Subscription added successfully.');
        },
        err => AlertStore.critical(err.message)
      );
  }

  /* istanbul ignore next */
  private openAddSubscriptionDialog(mode: VIEW_MODE): void {
    const { contactStore, eventTypeStore, categoryStore } = this.props;
    ModalStore.open(
      <AddUserSubscription
        subscriptionStore={this.subscriptionStore}
        contactStore={contactStore}
        eventTypeStore={eventTypeStore}
        categoryStore={categoryStore}
        addUserSubscription={(addUserSubscriptionRequest: IAPIAddUserSubscriptionRequest) =>
          this.addUserSubscription(addUserSubscriptionRequest)
        }
        viewMode={mode}
      />
    );
  }

  @action
  private onSelection(option: string) {
    this.subscriptionStore.users = [];
    this.subscriptionStore.selectedUser = null;
    this.selectedOption = option as USER_SUBSCRIPTION_FILTER;
  }

  render(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <>
        <div className={classes.root}>
          <div className={classes.userCard}>
            <AutoCompleteControl
              placeHolder="Search by Name, Username, Email"
              options={this.subscriptionStore.users}
              value={this.subscriptionStore.selectedUser as UserModel}
              onDropDownChange={selectedOption => this.loadUserSubscriptions(selectedOption as UserModel)}
              onSearch={(searchValue: string) => this.loadUsers(searchValue)}
            />
            <SelectInputControl
              containerClass={classes.selectInputControl}
              value={this.selectedOption}
              selectOptions={this._selectOptions}
              onOptionChange={option => this.onSelection(option)}
            />
            <div className={classes.btnContainer}>
              <PrimaryButton
                className={classes.marginRight}
                variant="contained"
                color="primary"
                startIcon={<AddCircle />}
                onClick={() => this.openAddSubscriptionDialog(VIEW_MODE.NEW)}
                disabled={!Boolean(this.subscriptionStore.selectedUser?.id)}
              >
                Add User Subscription
              </PrimaryButton>
              <CustomLinkButton
                variant="contained"
                to="/notifications/user-subscriptions/contacts"
                title="Contacts"
                disabled={!Boolean(this.subscriptionStore.selectedUser?.id)}
              />
            </div>
          </div>
          <ViewPermission hasPermission={Boolean(this.subscriptionStore.selectedUser?.id)}>
            <div className={classes.gridContainer}>
              <div className={classes.mainContent}>
                <CustomAgGridReact
                  isRowEditing={this.isRowEditing}
                  rowData={this.data}
                  gridOptions={this.gridOptions}
                />
              </div>
            </div>
          </ViewPermission>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(UserSubscription);

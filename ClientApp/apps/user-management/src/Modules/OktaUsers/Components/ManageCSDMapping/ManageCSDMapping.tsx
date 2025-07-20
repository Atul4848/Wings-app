import { Typography, withStyles } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { styles } from './ManageCSDMapping.styles';
import { CSDUserModel, UserResponseModel, UserStore, IAPICSDMappingRequest } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Groups } from '../index';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { IClasses, Utilities, Loader, UnsubscribableComponent } from '@wings-shared/core';
import { SearchInputControl } from '@wings-shared/form-controls';

type Props = {
  classes: IClasses;
  user?: UserResponseModel;
  userStore?: UserStore;
  updateUser: (user: UserResponseModel) => void;
  refreshUserGroups: () => void;
};

@inject('userStore')
@observer
class ManageCSDMapping extends UnsubscribableComponent<Props> {
  @observable private csdUsers: CSDUserModel[] = [];
  @observable private loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
  @observable private csdMappedUser: CSDUserModel = new CSDUserModel();
  @observable private searchValue: string = '';

  componentDidMount() {
    const { user } = this.props;
    if (user?.csdUserId) {
      this.loadMappedCsdUser(Number(user.csdUserId));
    }
  }

  /* istanbul ignore next */
  @action
  private loadMappedCsdUser(userId: number): void {
    const { userStore } = this.props;
    this.loader.showLoader();
    userStore
      .loadCsdUsers('', [ userId ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loader.hideLoader())
      )
      .subscribe(response => (this.csdMappedUser = response[0]));
  }

  /* istanbul ignore next */
  @action
  private loadCsdUsers(key: string): void {
    if (!(Utilities.isEqual(key.toLowerCase(), 'enter') && this.searchValue.length > 1)) {
      return;
    }
    const { userStore } = this.props;
    this.loader.showLoader();
    userStore
      .loadCsdUsers(this.searchValue)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loader.hideLoader())
      )
      .subscribe(response => (this.csdUsers = response));
  }

  /* istanbul ignore next */
  @action
  private addRemoveCsdUser(csdUserId?: number, csdUsername?: string): void {
    const { user, userStore, updateUser, refreshUserGroups } = this.props;
    const request: IAPICSDMappingRequest = {
      OktaUserId: user.id,
      CSDUserId: csdUserId,
      CSDUsername: csdUsername,
    };
    this.loader.showLoader();
    userStore
      .addRemoveCsduser(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loader.hideLoader())
      )
      .subscribe({
        next: () => {
          refreshUserGroups();
          updateUser(new UserResponseModel({ ...user, csdUserId: csdUserId || 0, legacyUsername: csdUsername || '' }));
          if (csdUserId) {
            this.csdMappedUser = this.csdUsers.find(x => x.id === csdUserId);
            return;
          }
          this.csdMappedUser = new CSDUserModel();
        },
        error: (error: AxiosError) => AlertStore.critical(error.response.data.Errors[0].Message),
      });
  }

  private setSearchValue(searchValue: string): void {
    if (!searchValue) {
      this.csdUsers = [];
    }
    this.searchValue = searchValue;
  }

  private get filteredUsers(): CSDUserModel[] {
    return this.csdUsers.filter(x => x.id !== this.csdMappedUser.id);
  }

  private get renderCsdUser(): ReactNode {
    if (this.loader.isLoading) {
      return this.loader.spinner;
    }

    return (
      <Groups
        isDisabled={Boolean(this.csdMappedUser.id)}
        groups={this.filteredUsers}
        onAction={(id, name) => this.addRemoveCsdUser(Number(id), name)}
      />
    );
  }

  private get dialogContent(): ReactNode {
    const { classes } = this.props;
    return (
      <div className={classes.modalDetail}>
        <div className={classes.mappedSection}>
          <div className={classes.mappedHeading}>
            <Typography variant="h6" component="h2" className={classes.modalHeading}>
              Mapped CSD User
            </Typography>
          </div>
          {this.csdMappedUser?.id && (
            <Groups
              groups={[ this.csdMappedUser ]}
              onAction={id => this.addRemoveCsdUser()}
              isUserGroups={true}
            />
          )}
        </div>
        <div className={classes.selectedMapped}>
          <div className={classes.mappedHeading}>
            <Typography variant="h6" component="h2" className={classes.modalHeading}>
              Search CSD Users
            </Typography>
            <div className={classes.selectMapped}>
              <SearchInputControl
                onSearch={(searchValue: string) => this.setSearchValue(searchValue)}
                onKeyUp={key => this.loadCsdUsers(key)}
                placeHolder="Search CSD Users"
              />
            </div>
          </div>
          {this.renderCsdUser}
        </div>
      </div>
    );
  }

  public render(): ReactNode {
    const { classes, user } = this.props;
    return (
      <Dialog
        title={`Manage CSD Mapping for: ${user?.username}`}
        open={true}
        classes={{
          dialogWrapper: classes.modalRoot,
          paperSize: classes.userMappedWidth,
          header: classes.headerWrapper,
          content: classes.content,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />
    );
  }
}
export default withStyles(styles)(ManageCSDMapping);

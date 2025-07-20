import { Typography, withStyles } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { styles } from './ManageUserGroups.styles';
import { GroupStore, UserGroupModel, UserResponseModel, UserStore } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Groups } from '../index';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { IClasses, Loader, UnsubscribableComponent } from '@wings-shared/core';
import { SearchInputControl } from '@wings-shared/form-controls';

type Props = {
  classes: IClasses;
  user?: UserResponseModel;
  groupStore?: GroupStore;
  userStore?: UserStore;
};

@inject('groupStore', 'userStore')
@observer
class ManageUserGroups extends UnsubscribableComponent<Props> {
  @observable private groups: UserGroupModel[] = [];
  @observable private loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
  @observable private searchValue: string = '';

  constructor(p: Props) {
    super(p);
  }

  componentDidMount() {
    this.loadGroups();
  }

  /* istanbul ignore next */
  @action
  private loadGroups(query?: string): void {
    const { groupStore } = this.props;
    this.loader.showLoader();
    groupStore
      .loadGroups(query)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loader.hideLoader()))
      )
      .subscribe((groups: UserGroupModel[]) => {
        this.groups = groups;
      });
  }

  private get filteredGroups(): UserGroupModel[] {
    if (this.searchValue) {
      return this.groups.filter(
        item => !this.props.userStore.userGroups.some(x => x.id === item.id)
          && item.name?.toLowerCase().includes(this.searchValue)
      );
    }
    return this.groups.filter(item => !this.props.userStore.userGroups.some(x => x.id === item.id));
  }

  /* istanbul ignore next */
  @action
  private assignGroup(groupId: string): void {
    const { user, userStore } = this.props;
    this.loader.showLoader();
    userStore
      .assignGroup(user.id, groupId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => userStore.loadUserGroups(user.id)),
        finalize(() => (this.loader.hideLoader()))
      )
      .subscribe();
  }

  /* istanbul ignore next */
  @action
  private removeGroup(groupId: string): void {
    const { user, userStore } = this.props;
    this.loader.showLoader();
    userStore
      .removeGroup(user.id, groupId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loader.hideLoader()))
      )
      .subscribe();
  }

  private get renderGroups(): ReactNode {
    if (this.loader.isLoading) {
      return this.loader.spinner
    }
    return <Groups groups={this.filteredGroups} onAction={(id) => this.assignGroup(id.toString())} />;
  }

  private get dialogContent(): ReactNode {
    const { classes, userStore, user } = this.props;
    return (
      <div className={classes.modaldetail}>
        <div className={classes.groupsection}>
          <div className={classes.groupSubHeader}><b>Manage Groups for:</b> {user?.username}</div>
          <div className={classes.groupheading}>
            <Typography variant="h6" component="h2" className={classes.modalheading}>
              User's Group Management
            </Typography>
          </div>
          <Groups
            groups={userStore.userGroups}
            onAction={(id) => this.removeGroup(id.toString())}
            isUserGroups={true}
          />
        </div>
        <div className={classes.selectedgroup}>
          <div className={classes.groupheading}>
            <Typography variant="h6" component="h2" className={classes.modalheading}>
              Available Groups
            </Typography>
            <div className={classes.selectgroup}>
              <SearchInputControl
                onSearch={(searchValue: string) => (this.searchValue = searchValue)}
                placeHolder="Search Groups"
              />
            </div>
          </div>
          {this.renderGroups}
        </div>
      </div>
    );
  }

  public render(): ReactNode {
    const { classes } = this.props;
    return (
      <Dialog
        title='MANAGE GROUPS'
        open={true}
        classes={{
          dialogWrapper: classes.modalRoot,
          paperSize: classes.userGroupWidth,
          header: classes.headerWrapper,
          content: classes.content,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />
    );
  }
}
export default withStyles(styles)(ManageUserGroups);

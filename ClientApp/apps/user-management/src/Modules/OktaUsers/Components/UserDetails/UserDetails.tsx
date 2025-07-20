import { withStyles } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { styles } from './UserDetails.styles';
import { CSDUserModel, UserResponseModel, UserStore } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { filter, finalize } from 'rxjs/operators';
import UserServiceNProduct from '../UserServiceNProduct/UserServiceNProduct';
import { IClasses, Loader, UnsubscribableComponent } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';

type Props = {
  classes: IClasses;
  user: UserResponseModel;
  userStore: UserStore;
};

@inject('userStore')
@observer
class UserDetails extends UnsubscribableComponent<Props> {
  @observable private loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
  @observable userDetails: CSDUserModel = new CSDUserModel();

  componentDidMount() {
    const { user, userStore } = this.props;
    this.loader.showLoader();
    userStore
      .loadCsdUsers(null, [ user.csdUserId ], true)
      .pipe(
        filter((result: CSDUserModel[]) => Boolean(result.length)),
        finalize(() => this.loader.hideLoader())
      )
      .subscribe((result: CSDUserModel[]) => (this.userDetails = result[0]));
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    return {
      title: '',
      inputControls: [
        {
          fieldKey: 'fullName',
          label: 'Full Name',
        },
        {
          fieldKey: 'name',
          label: 'User Name',
        },
        {
          fieldKey: 'email',
          label: 'Email',
        },
        {
          fieldKey: 'customerNumber',
          label: 'Customer Number',
        },
      ],
    };
  }

  /* istanbul ignore next */
  private get dialogContent(): ReactNode {
    const { classes } = this.props;
    return (
      <>
        {this.loader.spinner}
        <div className={classes.modalDetail}>
          {this.groupInputControls.inputControls.map((field, index) => (
            <ViewInputControl
              key={index}
              type={EDITOR_TYPES.TEXT_FIELD}
              classes={{ textInput: classes.nameInput }}
              field={{ value: this.userDetails[field.fieldKey], label: field.label }}
              isEditable={false}
            />
          ))}
        </div>
        {this.userDetails.servicesNProducts.length > 0 && (
          <UserServiceNProduct servicesNProducts={this.userDetails.servicesNProducts} />
        )}
      </>
    );
  }

  public render(): ReactNode {
    const { classes } = this.props;
    return (
      <Dialog
        title="CSD User Mapping Details"
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

export default withStyles(styles)(UserDetails);

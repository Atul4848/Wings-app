import React, { ReactNode } from 'react';
import { withStyles } from '@material-ui/core';
import { BaseGrid } from '@wings-shared/custom-ag-grid';
import { styles } from './Contact.styles';
import { inject, observer } from 'mobx-react';
import { ChannelStore, ContactModel, ContactStore, SubscriptionStore } from '../../../Shared';
import ContactDetail from '../ContactDetail/ContactDetail';
import UserWarning from '../UserWarning/UserWarning';
import { IClasses, ViewPermission } from '@wings-shared/core';

interface Props {
  classes: IClasses;
  contactStore: ContactStore;
  subscriptionStore: SubscriptionStore;
  channelStore: ChannelStore;
}

@inject('contactStore', 'subscriptionStore', 'channelStore')
@observer
class Contact extends BaseGrid<Props, ContactModel> {
  private readonly userSubScriptionRoute: string = '/notifications/user-subscriptions';

  componentDidMount() {
    const { subscriptionStore } = this.props;
    subscriptionStore.isContactPage = true;
  }

  render(): ReactNode {
    const { subscriptionStore, contactStore, channelStore } = this.props;
    return (
      <>
        <ViewPermission hasPermission={Boolean(subscriptionStore.selectedUser?.id)}>
          <ContactDetail
            userSubScriptionRoute={this.userSubScriptionRoute}
            fullName={subscriptionStore.selectedUser?.fullName || ''}
            contactStore={contactStore}
            subscriptionStore={subscriptionStore}
            channelStore={channelStore}
          />
        </ViewPermission>
        <ViewPermission hasPermission={!Boolean(subscriptionStore.selectedUser?.id)}>
          <UserWarning
            message="In order to see user contacts you first need to select a user from the User Subscription Screen."
            severity="error"
            userSubScriptionRoute={this.userSubScriptionRoute}
          />
        </ViewPermission>
      </>
    );
  }
}

export default withStyles(styles)(Contact);

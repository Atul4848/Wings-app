import React, { ReactNode } from 'react';
import { withStyles } from '@material-ui/core';
import { TabsLayout, getTabsStyles } from '@wings-shared/layout';
import TabPanel from '@material-ui/lab/TabPanel';
import { observable } from 'mobx';
import { UserSubscription, SearchSubscription } from './Components';
import { observer } from 'mobx-react';
import { IClasses, withRouter, UnsubscribableComponent } from '@wings-shared/core';

type Props = {
  classes: IClasses;
  searchParams: URLSearchParams;
};

@observer
class UserSubscriptionTabs extends UnsubscribableComponent<Props> {
  private readonly tabs: string[] = [ 'User Subscriptions', 'Search Contacts' ];
  @observable private activeTab: string;

  constructor(props) {
    super(props);
    const searchContact = this.props.searchParams.get('searchContact');
    this.activeTab = searchContact ? this.tabs[1] : this.tabs[0];
  }

  render(): ReactNode {
    const { classes } = this.props;
    return (
      <TabsLayout
        tabs={this.tabs}
        headingTitle=""
        activeTab={this.activeTab}
        onTabChange={(nextTab: string) => (this.activeTab = nextTab)}
      >
        <TabPanel key={this.tabs[0]} className={classes.tabPanel} value={this.tabs[0]}>
          <UserSubscription key={this.tabs[0]} />
        </TabPanel>
        <TabPanel key={this.tabs[1]} className={classes.tabPanel} value={this.tabs[1]}>
          <SearchSubscription searchContact={this.props.searchParams.get('searchContact') || ''} key={this.tabs[1]} />
        </TabPanel>
      </TabsLayout>
    );
  }
}

export default withRouter(withStyles(getTabsStyles)(UserSubscriptionTabs));
export { UserSubscriptionTabs as PureUserSubscriptionTabs };

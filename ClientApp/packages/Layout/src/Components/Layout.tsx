import { withStyles } from '@material-ui/core';
import { AlertList } from '@uvgo-shared/alert';
import { ModalKeeper } from '@uvgo-shared/modal-keeper';
import { Progress, PROGRESS_TYPES } from '@uvgo-shared/progress';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React, { Component, ReactNode, Suspense } from 'react';
import { IClasses, UIStore, Utilities } from '@wings-shared/core';
import { InfoPane, InfoPaneStore } from './InfoPaneController';
import { styles } from './Layout.styles';
import SideNavigation from './SideNavigation/SideNavigation';
import { HubConnection } from '@wings-shared/security';
import SideNavigationV2 from './SideNavigationV2/SideNavigationV2';
interface Props {
  children: any;
  classes?: IClasses;
  showLinks?: Boolean;
  useSideNavigationV2?: boolean; // use to enable nested menu items
}
@observer
class Layout extends Component<Props> {
  @computed
  private get pageLoader(): ReactNode {
    if (!UIStore.pageLoading) {
      return null;
    }

    return <Progress type={PROGRESS_TYPES.LINEAR} />;
  }

  render() {
    return (
      <div className="layout-root">
        <div className="layout-loader">{this.pageLoader}</div>
        <div className="layout-contentWrapper">
          {this.props.useSideNavigationV2 ? (
            <SideNavigationV2 />
          ) : (
            <SideNavigation />
          )}
          <div
            className="layout-content"
            style={{ paddingBottom: InfoPaneStore.infoPaneCurrentHeight }}
          >
            <Suspense fallback={<div>Loading...</div>}>
              {this.props.children}
            </Suspense>
            <ModalKeeper />
            <AlertList />
            <InfoPane />
            <HubConnection />
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles, {
  name: `layout-shared-${Utilities.getTempId()}`,
})(Layout);
export { Layout as PureLayout };
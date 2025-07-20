import { AlertList } from '@uvgo-shared/alert';
import { ModalKeeper } from '@uvgo-shared/modal-keeper';
import { Progress, PROGRESS_TYPES } from '@uvgo-shared/progress';
import { observer } from 'mobx-react-lite';
import React, { ReactNode, Suspense } from 'react';
import { UIStore } from '@wings-shared/core';
import { InfoPane, InfoPaneStore } from './InfoPaneController';
import { styled } from '@mui/material/styles';
import SideNavigation from './SideNavigation/SideNavigation';
import { HubConnection } from '@wings-shared/security';
import SideNavigationV2 from './SideNavigationV2/SideNavigationV2';

interface Props {
  children: any;
  showLinks?: Boolean;
  useSideNavigationV2?: boolean; // use to enable nested menu items
}

const LayoutRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

const LayoutLoader = styled('div')({
  left: 0,
  top: 0,
  width: '100%',
});

const LayoutContentWrapper = styled('div')({
  display: 'flex',
  width: '100%',
  // height: 'calc(100% - 70px)', // minus header height
  height: '100%',
  position: 'relative',
});

const LayoutContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: '100%',
  overflowY: 'auto',
  padding: '10px 25px 10px 25px',
});

const Layout = observer((props: Props) => {
  const pageLoader: ReactNode = UIStore.pageLoading ? (
    <Progress type={PROGRESS_TYPES.LINEAR} />
  ) : null;

  return (
    <LayoutRoot>
      <LayoutLoader>{pageLoader}</LayoutLoader>
      <LayoutContentWrapper>
        {props.useSideNavigationV2 ? <SideNavigationV2 /> : <SideNavigation />}
        <LayoutContent
          style={{ paddingBottom: InfoPaneStore.infoPaneCurrentHeight }}
        >
          <Suspense fallback={<div>Loading...</div>}>{props.children}</Suspense>
          <ModalKeeper />
          <AlertList />
          <InfoPane />
          <HubConnection />
        </LayoutContent>
      </LayoutContentWrapper>
    </LayoutRoot>
  );
});

export default Layout;
export { Layout as PureLayout };

import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import { action, reaction } from 'mobx';
import Drawer from '@mui/material/Drawer';
import {
  Close,
  DragHandleOutlined,
  FullscreenOutlined,
  MinimizeOutlined,
  FullscreenExitOutlined,
  MaximizeOutlined,
} from '@mui/icons-material';
import InfoPaneStore from './InfoPane.store';
import { INFO_PANE_STATE } from './InfoPaneState.enum';
import {
  DrawerPaper,
  InfoPaneContainer,
  Header,
  Dragger,
  IconBtn,
  InfoContainer,
} from './InfoPane.styles';

const InfoPane = observer(() => {
  const [isResizing, setIsResizing] = useState(false);

  const newHeight = useCallback(() => {
    const { maxHeight, minHeight } = InfoPaneStore;
    switch (InfoPaneStore.infoPaneState) {
      case INFO_PANE_STATE.MIN:
        return minHeight;
      case INFO_PANE_STATE.MAX:
        return maxHeight;
      default:
        return InfoPaneStore.infoPaneHeight;
    }
  }, []);

  useEffect(() => {
    const changeHeightListener = reaction(
      () => newHeight(),
      newHeight => (InfoPaneStore.infoPaneCurrentHeight = newHeight)
    );
    return () => changeHeightListener();
  }, [newHeight]);

  useEffect(() => {
    const handleMouseMove = action(e => {
      if (!isResizing) return;
      const offsetBottom = document.body.offsetHeight - e.clientY;
      const { minHeight, maxHeight } = InfoPaneStore;
      if (offsetBottom > minHeight && offsetBottom < maxHeight) {
        InfoPaneStore.infoPaneHeight = offsetBottom;
      }
    });

    const handleMouseUp = action(() => setIsResizing(false));

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = action(() => {
    setIsResizing(true);
    InfoPaneStore.infoPaneState = INFO_PANE_STATE.NONE;
  });

  const toggleMinimize = action(() => {
    InfoPaneStore.infoPaneState =
      InfoPaneStore.infoPaneState === INFO_PANE_STATE.MIN
        ? INFO_PANE_STATE.NONE
        : INFO_PANE_STATE.MIN;
  });

  const toggleMaximize = action(() => {
    InfoPaneStore.infoPaneState =
      InfoPaneStore.infoPaneState === INFO_PANE_STATE.MAX
        ? INFO_PANE_STATE.NONE
        : INFO_PANE_STATE.MAX;
  });

  if (!InfoPaneStore.data) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      open
      anchor="bottom"
      PaperProps={{ style: { height: newHeight() } }}
    >
      <DrawerPaper>
        <InfoPaneContainer>
          <Header>
            <Dragger id="dragger" onMouseDown={handleMouseDown}>
              <DragHandleOutlined color="primary" />
            </Dragger>
            <IconBtn onClick={toggleMinimize} size="small">
              {InfoPaneStore.infoPaneState === INFO_PANE_STATE.MIN ? (
                <MaximizeOutlined />
              ) : (
                <MinimizeOutlined />
              )}
            </IconBtn>
            <IconBtn onClick={toggleMaximize} size="small">
              {InfoPaneStore.infoPaneState === INFO_PANE_STATE.MAX ? (
                <FullscreenExitOutlined />
              ) : (
                <FullscreenOutlined />
              )}
            </IconBtn>
            <IconBtn onClick={InfoPaneStore.close} size="small">
              <Close />
            </IconBtn>
          </Header>
          <InfoContainer>{InfoPaneStore.data}</InfoContainer>
        </InfoPaneContainer>
      </DrawerPaper>
    </Drawer>
  );
});

export default InfoPane;

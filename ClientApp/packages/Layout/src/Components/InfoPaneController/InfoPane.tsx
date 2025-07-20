import { disposeOnUnmount, observer } from 'mobx-react';

import InfoPaneStore from './InfoPane.store';
import { styles } from './InfoPane.styles';
import { withStyles, IconButton, Drawer } from '@material-ui/core';
import React, { Component } from 'react';
import {
  Close,
  DragHandleOutlined,
  FullscreenOutlined,
  MinimizeOutlined,
  FullscreenExitOutlined,
  MaximizeOutlined,
} from '@material-ui/icons';
import { action, observable, reaction } from 'mobx';
import { INFO_PANE_STATE } from './InfoPaneState.enum';
import { Utilities, IClasses } from '@wings-shared/core';

type Props = {
  classes?: IClasses;
};

@observer
export class InfoPane extends Component<Props, any> {
  @observable private isResizing: boolean = false;

  @disposeOnUnmount
  changeHeightListener = reaction(
    () => this.newHeight,
    (newHeight: number) => (InfoPaneStore.infoPaneCurrentHeight = newHeight)
  );

  /* istanbul ignore next */
  componentDidMount() {
    document.addEventListener('mousemove', (e: MouseEvent) =>
      this.handleMouseMove(e)
    );
    document.addEventListener('mouseup', (e: MouseEvent) =>
      this.handleMouseUp(e)
    );
  }

  /* istanbul ignore next */
  componentWillUnmount() {
    document.removeEventListener('mousemove', (e: MouseEvent) =>
      this.handleMouseMove(e)
    );
    document.removeEventListener('mouseup', (e: MouseEvent) =>
      this.handleMouseUp(e)
    );
  }

  private get newHeight(): number {
    const { maxHeight, minHeight } = InfoPaneStore;
    switch (InfoPaneStore.infoPaneState) {
      case INFO_PANE_STATE.MIN:
        return minHeight;
      case INFO_PANE_STATE.MAX:
        return maxHeight;
      default:
        return InfoPaneStore.infoPaneHeight;
    }
  }

  @action
  private handleMouseDown(
    _: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    this.isResizing = true;
    InfoPaneStore.infoPaneState = INFO_PANE_STATE.NONE;
  }

  @action
  private handleMouseMove(e: MouseEvent): void {
    // we don't want to do anything if we aren't resizing.
    if (!this.isResizing) {
      return;
    }

    const offsetBottom =
      document.body.offsetHeight - (e.clientY - document.body.offsetTop);
    const { minHeight, maxHeight } = InfoPaneStore;
    if (offsetBottom > minHeight && offsetBottom < maxHeight) {
      InfoPaneStore.infoPaneHeight = offsetBottom;
    }
  }

  @action
  private handleMouseUp(_: MouseEvent): void {
    this.isResizing = false;
  }

  @action
  private toggleMinimize(): void {
    InfoPaneStore.infoPaneState = this.isMinimized
      ? INFO_PANE_STATE.NONE
      : INFO_PANE_STATE.MIN;
  }

  @action
  private toggleMaximize(): void {
    InfoPaneStore.infoPaneState = this.isMaximized
      ? INFO_PANE_STATE.NONE
      : INFO_PANE_STATE.MAX;
  }

  private get isMaximized(): boolean {
    return Utilities.isEqual(InfoPaneStore.infoPaneState, INFO_PANE_STATE.MAX);
  }

  private get isMinimized(): boolean {
    return Utilities.isEqual(InfoPaneStore.infoPaneState, INFO_PANE_STATE.MIN);
  }

  render() {
    const { classes } = this.props;
    if (!InfoPaneStore.data) {
      return null;
    }

    return (
      <Drawer
        variant="permanent"
        open
        anchor={'bottom'}
        classes={{
          paper: classes.drawerPaper,
        }}
        PaperProps={{ style: { height: this.newHeight } }}
      >
        <div className={classes.infoPane}>
          <div className={classes.header}>
            <div
              id="dragger"
              onMouseDown={(event) => this.handleMouseDown(event)}
              className={classes.dragger}
            >
              <DragHandleOutlined color="primary" />
            </div>

            <IconButton
              onClick={() => this.toggleMinimize()}
              size="small"
              className={classes.iconButton}
            >
              {this.isMinimized ? <MaximizeOutlined /> : <MinimizeOutlined />}
            </IconButton>
            <IconButton
              onClick={() => this.toggleMaximize()}
              size="small"
              className={classes.iconButton}
            >
              {this.isMaximized ? (
                <FullscreenExitOutlined />
              ) : (
                <FullscreenOutlined />
              )}
            </IconButton>
            <IconButton
              onClick={() => InfoPaneStore.close()}
              size="small"
              className={classes.iconButton}
            >
              <Close />
            </IconButton>
          </div>
          <div className={classes.infoContainer}>{InfoPaneStore.data}</div>
        </div>
      </Drawer>
    );
  }
}

export default withStyles(styles)(InfoPane);
export { InfoPane as PureInfoPane };

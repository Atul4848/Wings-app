import React, { Component, ReactNode, RefObject } from 'react';
import { withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { ICellRendererParams, ICellRendererComp, RowNode, ColDef } from 'ag-grid-community';
import { styles } from './AgGridViewRenderer.styles';
import { IClasses } from '@wings-shared/core';

interface Props extends Partial<ICellRendererParams> {
  classes: IClasses;
  getViewRenderer?: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) => ReactNode;
}

@observer
class AgGridViewRenderer extends Component<Props> implements ICellRendererComp {
  private viewRendererRef: RefObject<HTMLInputElement> = React.createRef();

  public refresh(): boolean {
    return true;
  }

  public getGui(): HTMLElement {
    return this.viewRendererRef.current;
  }

  render() {
    const { rowIndex, node, classes, getViewRenderer, colDef } = this.props;
    return getViewRenderer(rowIndex, node, classes, colDef);
  }
}

export default withStyles(styles)(AgGridViewRenderer);

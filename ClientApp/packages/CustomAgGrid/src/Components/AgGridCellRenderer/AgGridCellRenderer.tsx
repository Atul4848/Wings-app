import React from 'react';
import { ITooltipParams } from 'ag-grid-community';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { Tooltip, withStyles } from '@material-ui/core';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { styles } from './AgGridCellRenderer.styles';
import { IClasses } from '@wings-shared/core';

interface Props extends Partial<ITooltipParams> {
  classes?: IClasses;
}

@observer
class AgGridCellRenderer extends AgGridBaseEditor<any> {
  @observable private open: boolean = false;

  public refresh(): boolean {
    return true;
  }

  public getGui(): HTMLElement {
    return this.textFieldRef.current;
  }

  private get value(): string {
    const { colDef, value } = this.props;
    const isCallable = colDef.valueFormatter instanceof Function;
    return isCallable ? colDef.valueFormatter(this.props) : value;
  }

  @action
  private setOpen(open: boolean): void {
    this.open = open;
  }

  render() {
    const { classes } = this.props;
    return (
      <Tooltip
        title={this.value || ''}
        open={this.open}
        onMouseEnter={() => this.setOpen(true)}
        onMouseLeave={() => this.setOpen(false)}
        disableHoverListener
        classes={{ tooltip: classes.tooltip }}
      >
        <span onClick={() => this.setOpen(false)}>{this.value}</span>
      </Tooltip>
    );
  }
}

export default withStyles(styles)(AgGridCellRenderer);
export { AgGridCellRenderer as PureAgGridCellRenderer };

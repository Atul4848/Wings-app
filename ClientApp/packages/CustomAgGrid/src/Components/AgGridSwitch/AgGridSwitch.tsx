import React from 'react';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { ICellEditorReactComp } from 'ag-grid-react';
import { action, observable } from 'mobx';
import { styles } from './AgGridSwitch.style';
import { IBaseEditorProps } from '../../Interfaces';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { IClasses } from '@wings-shared/core';

interface Props extends Partial<IBaseEditorProps> {
  isReadOnly?: boolean;
  classes?: IClasses;
}

@observer
class AgGridSwitch extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  @observable private isActive: boolean = false;

  constructor(props: Props) {
    super(props);
    this.isActive = this.props.value || false;
  }

  public getValue(): boolean {
    return this.isActive;
  }

  @action
  setValue(isActive: boolean): void {
    this.isActive = isActive;
  }

  @action
  public handleChange(isActive: boolean): void {
    const { rowIndex, isReadOnly } = this.props;
    if (isReadOnly) {
      return;
    }
    this.isActive = isActive;
    const { componentParent } = this.props.context;
    if (!componentParent.onSwitchChangeHandler) {
      return;
    }
    componentParent.onSwitchChangeHandler(rowIndex, isActive);
  }

  render() {
    const { classes, isReadOnly } = this.props;
    return (
      <div className={classes.root}>
        <Switch
          checked={this.isActive}
          onChange={(_, isActive) => this.handleChange(isActive)}
          color="primary"
          name="switch"
          inputProps={{ 'aria-label': 'primary checkbox' }}
          disabled={isReadOnly}
        />
      </div>
    );
  }
}

export default withStyles(styles)(AgGridSwitch);

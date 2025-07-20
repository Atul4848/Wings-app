import React from 'react';
import { withStyles, Checkbox } from '@material-ui/core';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { ICellEditorReactComp } from 'ag-grid-react';
import { IBaseEditorProps } from '../../Interfaces';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { RowNode } from 'ag-grid-community';
import { styles } from './AgGridCheckBox.styles';
import { IClasses } from '@wings-shared/core';

interface Props extends Partial<IBaseEditorProps> {
  readOnly?: boolean;
  onChange?: (node: RowNode, checked: boolean) => void;
  classes?: IClasses;
}

@observer
export class AgGridCheckBox extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  @observable private isChecked: boolean = false;

  constructor(props) {
    super(props);
    this.isChecked = this.props.value || false;
  }

  public getValue(): boolean {
    return this.isChecked;
  }

  @action
  public setValue(isChecked: boolean): void {
    this.isChecked = isChecked;
  }

  public refresh(params: any): boolean {
    return true;
  }

  public getGui(): HTMLElement {
    return this.textFieldRef.current;
  }

  @action
  private onChange(checked: boolean): void {
    const { node, onChange, readOnly } = this.props;
    if (readOnly) {
      return;
    }

    this.isChecked = checked;
    const isCallable: boolean = onChange instanceof Function;

    if (isCallable) {
      onChange(node, checked);
      return;
    }
    this.parentOnChange(checked);
  }

  render() {
    const { classes, readOnly } = this.props;
    return (
      <div className={classes.root}>
        <Checkbox
          readOnly={readOnly}
          inputRef={this.textFieldRef}
          checked={this.isChecked}
          disabled={this.isDisable}
          onChange={(_, checked) => this.onChange(checked)}
        />
      </div>
    );
  }
}

export default withStyles(styles)(AgGridCheckBox);

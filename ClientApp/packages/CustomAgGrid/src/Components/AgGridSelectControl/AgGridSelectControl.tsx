import { withStyles } from '@material-ui/core';
import { ICellEditorReactComp } from 'ag-grid-react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { IBaseEditorProps } from '../../Interfaces';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { styles } from './AgGridSelectControl.styles';
import { booleanOptions } from './BooleanControlOptions';
import { RowNode } from 'ag-grid-community';
import { SelectInputControl } from '@wings-shared/form-controls';
import { IOptionValue, SelectOption, getBooleanToString } from '@wings-shared/core';
import AgGridTooltip from '../AgGridTooltip/AgGridTooltip';

interface Props extends Partial<IBaseEditorProps> {
  selectValueFormatter: (value: IOptionValue, node?: RowNode) => any;
  disabled?: boolean;
  isBoolean?: true;
  options?: SelectOption[];
  node?: RowNode;
  excludeEmptyOption?: boolean;
}

@observer
class AgGridSelectControl extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  private readonly requiredMessage: string = 'This field is required';
  static defaultProps = {
    excludeEmptyOption: false,
  };
  @observable selectedOption: IOptionValue;

  constructor(props) {
    super(props);
    this.selectedOption =
      typeof props.formatValue === 'function' ? props.formatValue(props.value, props.node) : props.value;
  }

  public get hasError(): boolean {
    if (!this.isRequired) {
      return false;
    }
    if (!getBooleanToString(this.selectedOption as boolean)) {
      return true;
    }
    return false;
  }

  public getValue(): IOptionValue {
    const isCallable = typeof this.props.selectValueFormatter === 'function';
    return isCallable ? this.props.selectValueFormatter(this.selectedOption, this.props.node) : this.selectedOption;
  }

  @action
  public setValue(selectedOption: IOptionValue): void {
    this.selectedOption = selectedOption;
  }

  @action
  public onOptionChange(value: IOptionValue): void {
    this.setValue(value);
    const { componentParent } = this.props.context;
    if (componentParent && componentParent.onDropDownChange) {
      componentParent.onDropDownChange(this.props, value);
    }
  }

  render() {
    const { isBoolean, options, disabled, classes, excludeEmptyOption } = this.props;
    const _options = isBoolean
      ? excludeEmptyOption
        ? booleanOptions.filter(el => Object.keys(el.value).length)
        : booleanOptions
      : options;
    const _showError = disabled ? false : this.showError && this.hasError;
    return (
      <AgGridTooltip arrow open={_showError} title={this.requiredMessage} placement="bottom-start">
        <SelectInputControl
          classes={{ menuItem: classes.menuItem, root: classes.selectControlRoot }}
          containerClass={classes.selectInputRoot}
          disabled={disabled}
          value={
            isBoolean
              ? this.selectedOption === true
                ? 'Yes'
                : this.selectedOption === false
                  ? 'No'
                  : ''
              : this.selectedOption || ('' as any)
          }
          selectOptions={_options}
          onOptionChange={selectedOption => {
            const value = isBoolean
              ? selectedOption === 'Yes'
                ? true
                : selectedOption === 'No'
                  ? false
                  : null
              : selectedOption;
            this.onOptionChange(value);
          }}
          onFocus={() => (this.showError = false)}
          onBlur={() => (this.showError = true)}
        />
      </AgGridTooltip>
    );
  }
}

export default withStyles(styles)(AgGridSelectControl);

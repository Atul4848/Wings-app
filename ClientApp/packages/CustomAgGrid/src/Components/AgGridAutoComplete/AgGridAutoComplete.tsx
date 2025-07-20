import React, { ReactNode } from 'react';
import { ICellEditorReactComp } from 'ag-grid-react';
import { IBaseEditorProps } from '../../Interfaces';
import { Tooltip, Typography, withStyles } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import AutoComplete, { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';
import { observable, action, toJS } from 'mobx';
import { styles } from './AgGridAutoComplete.styles';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import classNames from 'classnames';
import { RowNode } from 'ag-grid-community';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import AgGridTooltip from '../AgGridTooltip/AgGridTooltip';
import { ISelectOption, ScrollChangeListener, Utilities } from '@wings-shared/core';

interface Props extends Partial<IBaseEditorProps> {
  getAutoCompleteOptions: () => ISelectOption[];
  getIsMultiSelect: (node: RowNode) => boolean;
  // used to format outgoing value into the API format
  autoCompleteParseValue: (selectedOption: ISelectOption | ISelectOption[], node?: RowNode) => any;
  // used to get format incoming value for MUI auto complete component
  autoCompleteFormatValue: (
    selectedOption: ISelectOption | ISelectOption[],
    node?: RowNode
  ) => ISelectOption | ISelectOption[];
  getOptionDisabled?: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => boolean;
  renderTags?: (value: ISelectOption[], getTagProps: AutocompleteGetTagProps) => React.ReactNode;
  onSearch?: (searchValue?: string, node?: RowNode) => void;
  multiSelect?: boolean;
  disableCloseOnSelect?: boolean;
  freeSolo?: boolean;
  isLoading?: () => boolean;
  limitTags: () => number;
  // Return key which we can use to compare the values
  optionCompareKey: (node: RowNode) => string;
  showTooltip?: boolean;
  getOptionTooltip?: (option: ISelectOption) => string; // to show Tooltip for dropdown options
  useControlledValue?: boolean;
}

@observer
class AgGridAutoComplete extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  private readonly requiredMessage: string = 'This field is required';
  @observable selectedOption: ISelectOption | ISelectOption[];
  @observable isOpen = false;
  @observable private controlledValue = (this.props.value as any) || [];

  public static defaultProps = {
    multiSelect: false,
    disableCloseOnSelect: false,
    placeHolder: 'Search',
    getOptionDisabled: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => false,
    isLoading: () => false,
    // Value is used by default to compare selected option
    optionCompareKey: node => 'value',
    useControlledValue: false,
  };

  constructor(props) {
    super(props);
    const { data, colDef, autoCompleteFormatValue, node } = this.props;
    const value = this.getOptionValue(colDef.field, data);
    const isCallable = typeof autoCompleteFormatValue === 'function';
    this.setValue(isCallable ? autoCompleteFormatValue(value, node) : value);
    this.controlledValue = (props.value as any) || [];
  }

  /* istanbul ignore next */
  componentDidMount() {
    this.debounce$
      .pipe(
        debounceTime(this.debounceTime),
        map((searchValue: string) => searchValue.toLowerCase().trim()),
        takeUntil(this.destroy$)
      )
      .subscribe((searchValue: string) => this.props.onSearch(searchValue, this.props.node));
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.value !== this.props.value && this.props.useControlledValue) {
      this.controlledValue = this.props.value || [];
    }
  }

  private onScrollChange = isOpen => {
    this.isOpen = isOpen;
  };

  private get _getIsMultiSelect() {
    const { getIsMultiSelect, node, multiSelect } = this.props;
    const isCallable = typeof getIsMultiSelect === 'function';
    return isCallable ? getIsMultiSelect(node) : multiSelect;
  }

  // Used to Parse values if it's under a dot object cases in ag grid i.e state.name sate.id
  private getOptionValue(fieldKey: string, data): ISelectOption | ISelectOption[] {
    const result = fieldKey.split('.').reduce((a, b) => {
      return typeof a === 'object' ? a[b] : undefined;
    }, data);
    return result;
  }

  // This Get Value method is accessed by the Ag Grid internally so this' why it's public
  public getValue(): ISelectOption | ISelectOption[] {
    const { autoCompleteParseValue, node } = this.props;
    const isCallable = typeof autoCompleteParseValue === 'function';
    return isCallable ? autoCompleteParseValue(this.selectedOption, node) : this.selectedOption;
  }

  public isCancelAfterEnd(): boolean {
    return this.hasError;
  }

  @action
  public setValue(selectedOption: ISelectOption | ISelectOption[]): void {
    this.selectedOption = selectedOption;
  }

  // Pass data to parent component
  @action
  public onDropDownChange(value: ISelectOption | ISelectOption[]): void {
    this.setValue(value);
    const { componentParent } = this.props.context;
    if (componentParent && componentParent.onDropDownChange) {
      componentParent.onDropDownChange(this.props, value);
    }
  }

  private get getAutoCompleteOptions(): ISelectOption[] {
    return this.props.getAutoCompleteOptions();
  }

  private get limitTags(): number {
    const { limitTags } = this.props;
    return typeof limitTags === 'function' ? limitTags() : -1;
  }

  private get values(): ISelectOption | ISelectOption[] {
    if (Array.isArray(this.selectedOption)) {
      return toJS(this.selectedOption);
    }
    return this.selectedOption && this.selectedOption.value ? this.selectedOption : null;
  }

  // needs to access from parent component
  public get errorMessage(): string {
    return this.hasError ? `${this.props.colDef.headerName} is Required` : '';
  }

  // needs to access from parent component
  public get hasError(): boolean {
    if (!this.isRequired) {
      return false;
    }
    if (!this.selectedOption) {
      return true;
    }
    return Array.isArray(this.selectedOption) ? !this.selectedOption.length : !this.selectedOption?.value;
  }

  private getOptionSelected(currentOption: ISelectOption, values: ISelectOption | ISelectOption[]): boolean {
    if (!values) {
      return false;
    }
    const fieldKey = this.props.optionCompareKey(this.props.node);
    return Array.isArray(values)
      ? values.map(options => options[fieldKey]).includes(currentOption[fieldKey])
      : Utilities.isEqual(currentOption[fieldKey], values[fieldKey]);
  }

  // USED for Multi Select
  private renderTags(values: ISelectOption[], getTagProps: AutocompleteGetTagProps): React.ReactNode {
    if (this.props.renderTags instanceof Function) {
      return this.props.renderTags(values, getTagProps);
    }

    const totalNumOfTags = values.length;

    // If we are limiting tags when show allowed tags only
    const chipsList = this.limitTags > 0 ? [ ...values ].slice(0, this.limitTags) : values;

    const limitedValues =
      totalNumOfTags > this.limitTags
        ? chipsList.concat({ value: '', label: `+${totalNumOfTags - this.limitTags} more` })
        : chipsList;

    return limitedValues.map((option, index) => <Chip {...getTagProps({ index })} size="small" label={option.label} />);
  }

  /* istanbul ignore next */
  private renderOption(option): ReactNode {
    const { classes, getOptionTooltip, showTooltip, getOptionDisabled } = this.props;
    const isDisabled = getOptionDisabled(option, this.selectedOption);
    const tooltip = typeof getOptionTooltip === 'function' ? getOptionTooltip(option) : option.label;
    return (
      <Tooltip title={tooltip} disableHoverListener={!showTooltip} placement="right-end" arrow={true}>
        <Typography
          className={classNames({
            [classes.inActiveText]: option.status?.name === 'InActive',
            [classes.disabledOption]: getOptionDisabled(option, this.selectedOption),
          })}
          onClick={event => {
            // needs to prevent click on disabled options
            if (isDisabled) {
              event.stopPropagation();
            }
          }}
        >
          {option.label}
        </Typography>
      </Tooltip>
    );
  }

  render() {
    const {
      multiSelect,
      placeHolder,
      classes,
      getOptionDisabled,
      disableCloseOnSelect,
      freeSolo,
      onSearch,
      useControlledValue,
    } = this.props;
    const hasError = this.showError && this.hasError;
    return (
      <ScrollChangeListener onScrollChange={isOpen => this.onScrollChange(isOpen)} tagName="UL">
        <AgGridTooltip arrow open={hasError} title={this.requiredMessage} placement="bottom-start">
          <AutoComplete
            fullWidth
            open={this.isOpen}
            onOpen={() => (this.isOpen = true)}
            onClose={() => (this.isOpen = false)}
            multiple={this._getIsMultiSelect}
            value={useControlledValue ? this.controlledValue : this.values}
            disabled={this.isDisable}
            options={this.getAutoCompleteOptions}
            disableCloseOnSelect={disableCloseOnSelect}
            freeSolo={freeSolo}
            loading={this.props.isLoading()}
            getOptionLabel={option => (option as ISelectOption)?.label || ''}
            renderOption={option => this.renderOption(option)}
            getOptionSelected={(currentOption: ISelectOption, values: ISelectOption | ISelectOption[]) =>
              this.getOptionSelected(currentOption, values)
            }
            renderTags={(values: ISelectOption[], tagProps: AutocompleteGetTagProps) =>
              this.renderTags(values, tagProps)
            }
            getOptionDisabled={(currentOption: ISelectOption) => getOptionDisabled(currentOption, this.selectedOption)}
            onChange={(_, value: string | ISelectOption | (string | ISelectOption)[]) => {
              if (useControlledValue) {
                this.controlledValue = value;
              }

              this.onDropDownChange(value as ISelectOption);
            }}
            classes={{ root: classes.root, inputRoot: classes.inputRoot }}
            onInputChange={(_, value, reason) => {
              if (freeSolo) {
                const selectOption: ISelectOption = { label: value, value };
                if (useControlledValue) {
                  this.controlledValue = selectOption;
                }
                this.setValue(selectOption);
                this.onDropDownChange(selectOption);
              }
              onSearch && reason === 'input' && this.debounce$.next(value);
            }}
            renderInput={params => (
              <TextField
                {...params}
                inputRef={this.textFieldRef}
                error={hasError}
                inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
                onFocus={() => (this.showError = false)}
                onBlur={() => (this.showError = true)}
                placeholder={placeHolder}
              />
            )}
          />
        </AgGridTooltip>
      </ScrollChangeListener>
    );
  }
}

export default withStyles(styles)(AgGridAutoComplete);
export { AgGridAutoComplete as PureAgGridAutoComplete };

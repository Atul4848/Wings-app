import React, { ReactNode } from 'react';
import { withStyles, Typography, Chip, Popper, PopperPlacementType, PopperProps } from '@material-ui/core';
import AutoComplete, { AutocompleteGetTagProps, AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';
import { styles } from './AutoComplete.styles';
import { Field } from 'mobx-react-form';
import Tooltip from '@material-ui/core/Tooltip';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { IClasses, ISelectOption, Utilities, UnsubscribableComponent } from '@wings-shared/core';
import { action, observable, toJS } from 'mobx';
import classNames from 'classnames';
import { FilterOptionsState } from '@material-ui/lab';
import { IPagination } from '../../Interfaces';

interface Props {
  classes?: IClasses;
  options: ISelectOption[];
  onDropDownChange: (option: ISelectOption | ISelectOption[]) => void;
  onSearch?: (searchValue: string, pagination?: IPagination) => void;
  placeHolder?: string;
  disabled?: boolean;
  value: ISelectOption;
  field?: Field;
  autoSelect?: boolean;
  showTooltip?: boolean;
  isLoading?: boolean;
  multiple?: boolean;
  isExists?: boolean;
  hasError?: boolean;
  renderTags?: (value: ISelectOption[], getTagProps: AutocompleteGetTagProps) => React.ReactNode;
  disableCloseOnSelect?: boolean;
  getOptionDisabled?: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => boolean;
  getOptionSelected?: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => boolean;
  filterOption?: (option: ISelectOption[], state: FilterOptionsState<ISelectOption>) => ISelectOption[];
  onFocus: (fieldKey: string) => void;
  customErrorMessage?: string;
  freeSolo?: boolean;
  showChipTooltip?: boolean; // show or hide tooltips for autocomplete chip
  onBlur?: (fieldKey: string) => void;
  getChipLabel?: (field: ISelectOption) => string; // chip label using this key
  getChipTooltip?: (field: ISelectOption) => string; // chip tooltip using this key
  getChipDisabled?: (option: ISelectOption) => boolean;
  label?: ReactNode | string; // get custom label
  getOptionLabel?: (field: ISelectOption) => string; // chip tooltip using this key
  startAdornment?: React.ReactNode;
  showLabel?: boolean;
  debounceTime?: number;
  getOptionTooltip?: (field: ISelectOption) => string; // option tooltip using this key
  useControlledValue?: boolean;
  useFitToContentWidth?: boolean; // Show options text without ellipsis --dropdown will auto adjust width if true
  isServerSideSearch?: boolean;
  popperPlacement?: PopperPlacementType;
  pagination?: IPagination; // For handling the server side pagination
}

@observer
class AutoCompleteControl extends UnsubscribableComponent<Props> {
  private readonly requiredMessage: string = `This ${this.props.field?.label} is required`;
  private readonly existsMessage: string = `The ${this.props.field?.label} is already exists`;
  @observable private searchValue: string = '';
  @observable private isOpen = false;
  @observable private controlledValue = (this.props.value as any) || [];
  @observable private page = 1;

  constructor(props: Props) {
    super(props);
    this.controlledValue = (props.value as any) || [];
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.value !== this.props.value && this.props.useControlledValue) {
      this.controlledValue = this.props.value || [];
    }
  }

  /* istanbul ignore next */
  static defaultProps = {
    autoSelect: false,
    onSearch: (searchValue: string) => '',
    multiple: false,
    disableCloseOnSelect: false,
    getOptionDisabled: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => false,
    getChipDisabled: (option: ISelectOption) => false,
    onFocus: (fieldKey: string) => null,
    onBlur: (fieldKey: string) => null,
    getChipLabel: (value: ISelectOption) => value.label,
    getChipTooltip: (value: ISelectOption) => value.label,
    getOptionLabel: (value: ISelectOption) => value.label,
    filterOption: (value: ISelectOption[], state: FilterOptionsState<ISelectOption>) => {
      const { inputValue } = state;
      return value.filter(a => a.label?.toLowerCase().includes(inputValue?.toLowerCase()));
    },
    debounceTime: 400,
    showLabel: true,
    useControlledValue: false,
    isServerSideSearch: false,
    popperPlacement: 'bottom-start' as PopperPlacementType,
    disablePagination: true,
  };

  /* istanbul ignore next */
  componentDidMount() {
    this.debounce$
      .pipe(
        debounceTime(this.props.debounceTime),
        map((searchValue: string) => searchValue.toLowerCase().trim()),
        takeUntil(this.destroy$)
      )
      .subscribe((searchValue: string) => {
        this.page = 1;
        this.props.onSearch(searchValue, { pageNumber: 1 });
        this.searchValue = searchValue;
      });
  }

  private renderPopper = (props: PopperProps) => {
    return (
      <Popper
        {...props}
        style={{
          width:
            this.props.useFitToContentWidth && Boolean(this.props.options.length)
              ? 'min-content'
              : '' || props.style?.width,
        }}
        placement={this.props.popperPlacement}
      />
    );
  };

  private getOptionSelected(currentOption: ISelectOption, values: ISelectOption | ISelectOption[]): boolean {
    const isCallable: boolean = typeof this.props.getOptionSelected === 'function';

    // If user needs to control it from Parent
    if (isCallable) {
      return this.props.getOptionSelected(currentOption, values);
    }

    if (!values) {
      return false;
    }
    if (Array.isArray(values)) {
      return values.map(options => options.value).includes(currentOption.value);
    }
    return Utilities.isEqual(currentOption.value, values.value);
  }

  private get value(): ISelectOption | ISelectOption[] {
    const { options, value, multiple } = this.props;

    if ((!value && multiple) || (value instanceof Array && multiple)) {
      return toJS(value) || [];
    }
    if (value instanceof Object || !value) {
      return value || null;
    }
    return options.find(option => option.value === value) || null;
  }

  public get hasError(): boolean {
    const { field, hasError } = this.props;

    if (!field) {
      return false;
    }
    return (field.hasError && field.blurred) || hasError;
  }

  //93340 Inconsistent data displaying
  private get noOptionText() {
    if (this.searchValue) {
      if (this.props.isServerSideSearch) {
        return this.props.options.length ? 'Loading...' : 'No Options';
      }
      return 'No Values Found';
    }
    return 'Type Something to search';
  }

  // Function to handle scroll to bottom for pagination
  private onScroll = event => {
    const listboxNode = event.currentTarget;
    const { pagination } = this.props;
    if (pagination) {
      const disablePagination =
        pagination.pageNumber > Math.ceil(pagination.totalNumberOfRecords / pagination.pageSize);
      if (
        Math.ceil(listboxNode.scrollTop) + listboxNode.clientHeight >= listboxNode.scrollHeight &&
        Boolean(this.searchValue) &&
        !disablePagination
      ) {
        const nextPage = this.page + 1;
        // Call the search function with the next page
        this.props.onSearch(this.searchValue, { pageNumber: nextPage });
        this.page = nextPage;
      }
    }
  };

  // USED for Multi Select
  private renderTags(values: ISelectOption[], getTagProps: AutocompleteGetTagProps): React.ReactNode {
    if (this.props.renderTags instanceof Function) {
      return this.props.renderTags(values, getTagProps);
    }
    return values.map((option, index) => (
      <Tooltip
        key={index}
        title={this.props.getChipTooltip(option) || ''}
        disableHoverListener={!this.props.showChipTooltip}
      >
        <Chip
          {...getTagProps({ index })}
          label={this.props.getChipLabel(option)}
          classes={{ root: this.props.classes.chip }}
          disabled={this.props.getChipDisabled(option)}
        />
      </Tooltip>
    ));
  }

  /* istanbul ignore next */
  private renderOption(option): ReactNode {
    const { getOptionLabel, showTooltip, classes, getOptionTooltip } = this.props;
    const label = getOptionLabel(option);
    // showOptionTooltip is using if need to display additional info for option in dropdown list -- User Story 101170
    const tooltip = typeof getOptionTooltip === 'function' ? getOptionTooltip(option) : label;
    return (
      <Tooltip title={tooltip} disableHoverListener={!showTooltip}>
        <Typography
          className={classNames({
            [classes.inActiveText]: option.status?.name === 'InActive',
          })}
        >
          {label}
        </Typography>
      </Tooltip>
    );
  }

  /* istanbul ignore next */
  @action
  private setOpen(value: boolean) {
    this.isOpen = value;
  }

  render() {
    const {
      placeHolder,
      disableCloseOnSelect,
      options,
      multiple,
      disabled,
      classes,
      field,
      autoSelect,
      getOptionDisabled,
      isLoading,
      isExists,
      onFocus,
      customErrorMessage,
      freeSolo,
      onBlur,
      showLabel,
      label,
      filterOption,
      useControlledValue,
    } = this.props;
    const inputRoot = classNames({ [classes.inputRoot]: true, [classes.multiple]: multiple });
    return (
      <AutoComplete
        PopperComponent={this.renderPopper}
        disabled={disabled}
        autoSelect={autoSelect}
        autoHighlight={true}
        multiple={multiple}
        open={this.isOpen}
        onOpen={() => this.setOpen(true)}
        onClose={() => this.setOpen(false)}
        disableCloseOnSelect={disableCloseOnSelect}
        options={options}
        value={useControlledValue ? this.controlledValue : this.value}
        loading={isLoading}
        freeSolo={freeSolo}
        noOptionsText={this.noOptionText}
        renderTags={(values: ISelectOption[], tagProps: AutocompleteGetTagProps) => this.renderTags(values, tagProps)}
        getOptionLabel={option => this.props.getOptionLabel(option as ISelectOption)}
        renderOption={option => this.renderOption(option)}
        filterOptions={(option, state) => filterOption(option as ISelectOption[], state)}
        getOptionSelected={(currentOption: ISelectOption, values: ISelectOption | ISelectOption[]) =>
          this.getOptionSelected(currentOption, values)
        }
        getOptionDisabled={option =>
          getOptionDisabled(option as ISelectOption, useControlledValue ? this.controlledValue : this.value)
        }
        onChange={(_, selectedValue: ISelectOption | string | (string | ISelectOption)[]) => {
          this.searchValue = '';
          if (useControlledValue) {
            this.controlledValue = selectedValue;
          }
          this.props.onDropDownChange(selectedValue as ISelectOption | ISelectOption[]);
        }}
        onInputChange={(event, newInputValue, reason) => {
          if (!newInputValue && !disableCloseOnSelect) {
            this.setOpen(false);
          }
          if (freeSolo) {
            const selectOption: ISelectOption = { label: newInputValue, value: newInputValue };
            if (useControlledValue) {
              this.controlledValue = selectOption;
            }
            this.props.onDropDownChange(selectOption);
            return;
          }
          Utilities.isEqual(reason, 'input') && this.debounce$.next(newInputValue);
        }}
        // Scroll to bottom detection for pagination
        ListboxProps={{
          onScroll: this.onScroll,
        }}
        onFocus={() => onFocus(field?.key)}
        onBlur={() => onBlur(field?.key)}
        renderInput={(params: AutocompleteRenderInputParams) => (
          <div className={classes.inputWrapper}>
            {this.props.startAdornment && this.props.startAdornment}
            <TextField
              {...field?.bind({ onChange: () => {} })}
              {...params}
              label={(showLabel && label) || field?.label?.replace('*', '')}
              disabled={disabled}
              type="text"
              variant="outlined"
              className={classNames({ [classes.textRoot]: true, ['--large']: true })}
              placeholder={placeHolder}
              error={this.hasError || isExists}
              helperText={customErrorMessage || (isExists ? this.existsMessage : this.hasError && this.requiredMessage)}
              inputProps={{ ...params.inputProps, autoComplete: 'off' }}
              InputLabelProps={{ required: field?.rules?.includes('required') }}
            />
          </div>
        )}
        classes={{ option: classes.option, popper: classes.popper, root: classNames({ [classes.root]: true }) }}
      />
    );
  }
}

export default withStyles(styles)(AutoCompleteControl);
export { AutoCompleteControl as PureAutoCompleteControl };

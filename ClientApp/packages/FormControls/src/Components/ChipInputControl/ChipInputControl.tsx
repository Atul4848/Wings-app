import React, { ChangeEvent, RefAttributes } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Chip, InputAdornment, TextField, withStyles, Typography } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { action, observable, toJS } from 'mobx';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { observer } from 'mobx-react';
import { IClasses, ISelectOption, Utilities, UnsubscribableComponent } from '@wings-shared/core';
import { styles } from './ChipInputControl.styles';
import classNames from 'classnames';

interface Props extends RefAttributes<ChipInputControl> {
  classes?: IClasses;
  value?: ISelectOption[];
  placeHolder?: string;
  onChipAddOrRemove?: (selectedChips: ISelectOption[]) => void;
  onSearch?: (searchValue: string) => void;
  options?: ISelectOption[];
  isLoading?: boolean;
  label?: string;
  hasError?: boolean;
  freeSolo?: boolean;
  customErrorMessage?: string;
  onFocus?: () => void;
  onBlur?: (value: ISelectOption[]) => void;
  disableCloseOnSelect?: boolean;
  isDisabled?: boolean;
  getChipLabel?: (field: ISelectOption) => string; // chip label using this key
  getChipTooltip?: (field: ISelectOption) => string; // chip tooltip using this key
  getOptionLabel?: (field: ISelectOption) => string; // chip tooltip using this key
  allowOnlySingleSelect?: boolean;
}

@observer
class ChipInputControl extends UnsubscribableComponent<Props> {
  @observable private inputValue: string = '';
  // Needs to use for avoid flicker in dropdown options
  @observable private hasSearchValue: boolean = false;

  /* istanbul ignore next */
  static defaultProps = {
    options: [],
    hasError: false,
    freeSolo: false,
    allowOnlySingleSelect: false,
    label: '',
    customErrorMessage: '',
    onFocus: () => {},
    onBlur: (value: ISelectOption[]) => {},
    isDisabled: false,
    getChipLabel: (value: ISelectOption) => value?.label,
    getChipTooltip: (value: ISelectOption) => value?.label,
    getOptionLabel: (value: ISelectOption) => value?.label,
  };

  /* istanbul ignore next */
  componentDidMount() {
    this.debounce$
      .pipe(
        debounceTime(this.debounceTime),
        map((searchValue: string) => searchValue.toLowerCase().trim()),
        takeUntil(this.destroy$)
      )
      .subscribe((searchValue: string) => {
        this.props.onSearch(searchValue);
        this.hasSearchValue = Boolean(searchValue);
      });
  }

  /* istanbul ignore next */
  private updateFreeSoloValue(chips: ISelectOption[]): void {
    const values: ISelectOption[] = chips.reduce<ISelectOption[]>((acc: ISelectOption[], current: ISelectOption) => {
      if (!current.hasOwnProperty('name')) {
        Boolean(this.inputValue.trim()) &&
          acc.push({ label: this.inputValue.trim(), value: Utilities.getTempId(true) });
        return acc;
      }
      acc.push(current);
      return acc;
    }, []);

    this.props.onChipAddOrRemove(values);
    this.inputValue = '';
  }

  // Return dropdown options by removing duplicate options
  // need concat with value as we need to display selected values in options
  private get dropdownOptions(): ISelectOption[] {
    return this.props.options.concat(this.props.value).reduce((acc, current) => {
      if (current) {
        if (!acc.some(({ value }) => Utilities.isEqual(value, current.value))) {
          acc.push(current);
        }
      }
      return acc;
    }, []);
  }

  // Clear input value from parent
  @action
  public clearInputValue(): void {
    this.inputValue = '';
  }

  @action
  private addOrRemoveChips(chips: ISelectOption[]): void {
    if (!this.props.freeSolo) {
      if (!chips.length) {
        this.debounce$.next('');
      }
      this.inputValue = '';
      const _chips = this.props.allowOnlySingleSelect && chips.length > 1 ? [].concat(chips?.pop()) : chips;
      this.props.onChipAddOrRemove(_chips);
      return;
    }
    this.updateFreeSoloValue(chips);
  }

  render() {
    const {
      placeHolder,
      isLoading,
      value,
      label,
      hasError,
      customErrorMessage,
      classes,
      freeSolo,
      isDisabled,
    } = this.props;
    return (
      <Autocomplete
        multiple
        freeSolo={freeSolo}
        disabled={isDisabled}
        loading={isLoading}
        options={this.dropdownOptions}
        value={(toJS(value) as any) || []}
        inputValue={this.inputValue}
        className="--large"
        disableCloseOnSelect={this.props.disableCloseOnSelect}
        noOptionsText={this.hasSearchValue ? 'No Options' : 'Start typing to search'}
        getOptionLabel={option => this.props.getOptionLabel(option)}
        getOptionSelected={(option, value) => option?.value === value?.value}
        renderTags={(value: ISelectOption[], getTagProps) =>
          value.map((chip: ISelectOption, index: number) => (
            <Chip
              label={this.props.getChipLabel(chip)}
              {...getTagProps({ index })}
              onDelete={() => this.addOrRemoveChips(value.filter(_chip => _chip.value !== chip.value))}
            />
          ))
        }
        onChange={(_, value: ISelectOption[]) => this.addOrRemoveChips(value)}
        onFocus={() => this.props.onFocus()}
        onBlur={() => this.props.onBlur(value)}
        onInputChange={(_, value: string, reason: string) => {
          if (freeSolo || Utilities.isEqual(reason, 'reset')) {
            return;
          }
          this.inputValue = value;
          this.debounce$.next(value);
        }}
        renderOption={(props, option) => (
          <Typography
            className={classNames({
              [classes.inActiveText]: props.status?.name === 'InActive',
            })}
          >
            {this.props.getOptionLabel(props)}
          </Typography>
        )}
        renderInput={params => (
          (params.InputProps.startAdornment = (
            <>
              {!Boolean(value?.length) && (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )}
              {params.InputProps.startAdornment}
            </>
          )),
          (
            <TextField
              {...params}
              label={label?.replace('*', '') || ''}
              placeholder={placeHolder}
              variant="outlined"
              error={hasError}
              className={classNames({ [classes.textRoot]: true, ['--large']: true })}
              helperText={customErrorMessage || ''}
              onChange={({ target }: ChangeEvent<HTMLInputElement>) => (this.inputValue = target.value)}
              inputProps={{ ...params.inputProps, autoComplete: 'new-chipInputControl' }}
              InputLabelProps={{ required: label?.includes('*') }}
            />
          )
        )}
      />
    );
  }
}

export default withStyles(styles)(ChipInputControl);
export { ChipInputControl as PureChipInputControl };

import React, { RefAttributes } from 'react';
import { withStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import { CloseIcon, SearchIcon } from '@uvgo-shared/icons';
import { styles } from './SearchInputControl.styles';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { IClasses, UnsubscribableComponent } from '@wings-shared/core';

interface Props extends RefAttributes<{ setInputValue: Function }> {
  classes?: IClasses;
  placeHolder?: string;
  isDisabled?: boolean;
  searchValue?: string;
  ignoreCase?: boolean;
  onSearch?: (searchValue: string) => void;
  onKeyUp?: (key: string) => void;
  onClear?:()=> void;
}

@observer
class SearchInputControl extends UnsubscribableComponent<Props> {

  readonly debounceTime: number = 600;
  public debounce$: Subject<string> = new Subject<string>();
  public debounceKeyUp$: Subject<string> = new Subject<string>();

  @observable public searchValue: string = '';

  static defaultProps = {
    onKeyUp: (field: string) => null,
    ignoreCase: false,
    onClear:()=> null,
  }

  componentDidMount() {
    this.debounce$
      .pipe(
        debounceTime(this.debounceTime),
        map((searchValue: string) => this.props.ignoreCase ? searchValue.trim() : searchValue.toLowerCase().trim()),
        takeUntil(this.destroy$))
      .subscribe((searchValue: string) => this.props.onSearch(searchValue));

    this.debounceKeyUp$
      .pipe(
        map((keyValue: string) => keyValue.toLowerCase()),
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$))
      .subscribe((keyValue: string) => this.props.onKeyUp(keyValue));

  }

  @action
  private onInputChange(searchValue: string): void {
    this.searchValue = searchValue;
    this.debounce$.next(searchValue);
  }

  // Clear input value from parent
  @action
  public clearInputValue(): void {
    this.searchValue = '';
  }

  @action
  public setInputValue(searchValue: string): void {
    this.searchValue = searchValue;
  }

  render() {
    const { classes, placeHolder, isDisabled, onClear } = this.props;
    return (
      <FormControl disabled={isDisabled} fullWidth className={classes.formControl} variant="outlined">
        <OutlinedInput
          placeholder={placeHolder}
          value={this.searchValue}
          onChange={e => this.onInputChange(e.target.value)}
          className={classes.textRoot}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon size="large" />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment
              position="end"
              className={classes.closeButton}
              onClick={() => {
                this.onInputChange('');
                onClear();
              }}
            >
              {this.searchValue && <CloseIcon size="small" />}
            </InputAdornment>
          }
          labelWidth={60}
          onKeyUp={({ key }) => this.debounceKeyUp$.next(key)}
        />
      </FormControl>
    );
  }
}

export default withStyles(styles)(SearchInputControl);
export { SearchInputControl as PureSearchInputControl };

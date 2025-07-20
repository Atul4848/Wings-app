import {
  Chip,
  Popper,
  PopperPlacementType,
  PopperProps,
  TextField,
  Tooltip,
  Typography,
  debounce,
} from '@material-ui/core';
import AutoComplete, { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { FilterOptionsState } from '@material-ui/lab';
import React, { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useStyles } from './AutoCompleteV2.styles';
import { observer } from 'mobx-react';
import { ISelectOption, Utilities } from '@wings-shared/core';
import classNames from 'classnames';
import { Field } from 'mobx-react-form';
import { IPagination } from '../../Interfaces';

interface Props {
  value: any;
  options: any[];
  isRequired?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  freeSolo?: boolean;
  multiple?: boolean;
  disableCloseOnSelect?: boolean;
  showTooltip?: boolean;
  field?: Field;
  label?: string;
  customErrorMessage?: string;
  isExists?: boolean;
  useFitToContentWidth?: boolean;
  popperPlacement?: PopperPlacementType;
  isServerSideSearch?: boolean;
  autoSelect?: boolean;
  showChipTooltip?: boolean; // show or hide tooltips for autocomplete chip
  pagination?: IPagination; // For handling the server side pagination
  startAdornment?: React.ReactNode;
  showLabel?: boolean;
  placeHolder?: string;
  debounceTime?: number;
  onSearch?: (searchValue: string, pagination?: IPagination) => void;
  onDropDownChange: (option: ISelectOption | ISelectOption[]) => void;
  onFocus?: (fieldKey: string) => void;
  onBlur?: (fieldKey: string) => void;
  getOptionDisabled?: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => boolean;
  getOptionSelected?: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => boolean;
  getOptionLabel?: (value: ISelectOption) => string; // chip tooltip using this key
  getOptionTooltip?: (field: ISelectOption) => string; // option tooltip using this key
  renderTags?: (value: ISelectOption[], getTagProps: AutocompleteGetTagProps) => React.ReactNode;
  getChipLabel?: (field: ISelectOption) => string; // chip label using this key
  getChipTooltip?: (field: ISelectOption) => string; // chip tooltip using this key
  getChipDisabled?: (option: ISelectOption) => boolean;
  filterOption?: (option: ISelectOption[], state: FilterOptionsState<ISelectOption>) => ISelectOption[];
  customRenderOption?: (option: ISelectOption) => ReactNode;
}

// Note : please do not over load with props
const AutoCompleteV2 = (
  {
    debounceTime = 300,
    popperPlacement = 'bottom-start' as PopperPlacementType,
    onSearch = (searchValue: string) => '',
    getOptionDisabled = (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => false,
    getChipDisabled = (option: ISelectOption) => false,
    onFocus = (fieldKey: string) => null,
    onBlur = (fieldKey: string) => null,
    getChipLabel = (value: ISelectOption) => value.label,
    getChipTooltip = (value: ISelectOption) => value.label,
    getOptionLabel = (value: ISelectOption) => value.label,
    filterOption = (value: ISelectOption[], state: FilterOptionsState<ISelectOption>) => {
      const { inputValue } = state;
      return value.filter(a => a.label?.toLowerCase().includes(inputValue?.toLowerCase()));
    },
    ...props
  }: Props,
  ref
) => {
  const classes = useStyles();
  const [ value, setValue ] = useState<any>(props.multiple ? props.value || [] : props.value);
  const [ searchValue, setSearchValue ] = useState<string>('');
  const [ page, setPage ] = useState<number>(1);
  const [ isOpen, setOpen ] = useState<boolean>(false);
  const requiredMessage: string = `This ${props.field?.label} is required`;
  const existsMessage: string = `The ${props.field?.label} already exists`;
  // Components which can be accessed by Parent Components
  useImperativeHandle(ref, () => {
    return { getValue: () => value };
  });

  // If value changes from Parent Then change in local field as well
  useEffect(() => {
    setValue(props.multiple ? props.value || [] : props.value);
  }, [ props.value ]);

  const hasError = () => {
    if (!props.field) {
      return false;
    }
    return (props.field.hasError && props.field.blurred) || Boolean(props.customErrorMessage);
  };

  /* istanbul ignore next */
  const updateFreeSoloValue = (chips: ISelectOption[]): void => {
    const values: ISelectOption[] = chips.reduce<ISelectOption[]>(
      (acc: ISelectOption[], current: ISelectOption | string) => {
        if (typeof current === 'string' && !current.hasOwnProperty('name')) {
          const value = (current as string).trim();
          const isDuplicate = chips.some(item => item.label?.toLowerCase() === value.toLowerCase());
          if (!isDuplicate) {
            Boolean(value) && acc.push({ label: value, value: value });
          }
          return acc;
        }
        acc.push(current as ISelectOption);
        return acc;
      },
      []
    );
    props.onDropDownChange(values);
    setValue('');
  };

  // When user change dropdown data then
  const onChange = (event, value: any | any[]) => {
    if (props.freeSolo) {
      updateFreeSoloValue(value);
      return;
    }
    setValue(value);
    setSearchValue('');
    props.onDropDownChange(value);
  };

  const getOptionSelected = (currentOption: ISelectOption, values: ISelectOption | ISelectOption[]): boolean => {
    const isCallable: boolean = typeof props.getOptionSelected === 'function';

    // If user needs to control it from Parent
    if (isCallable) {
      return props.getOptionSelected(currentOption, values);
    }

    if (!values) {
      return false;
    }
    if (Array.isArray(values)) {
      return values.map(options => options.value).includes(currentOption.value);
    }
    return Utilities.isEqual(currentOption.value, values.value);
  };

  // Function to handle scroll to bottom for pagination
  const onScroll = event => {
    if (props.pagination) {
      const listboxNode = event.currentTarget;
      const disablePagination =
        props.pagination.pageNumber >= Math.ceil(props.pagination.totalNumberOfRecords / props.pagination.pageSize);
      if (
        Math.ceil(listboxNode.scrollTop) + listboxNode.clientHeight >= listboxNode.scrollHeight &&
        Boolean(searchValue) &&
        !disablePagination
      ) {
        const nextPage = page + 1;
        // Call the search function with the next page
        onSearch(searchValue, { pageNumber: nextPage });
        setPage(nextPage);
      }
    }
  };

  //93340 Inconsistent data displaying
  const noOptionText = () => {
    if (searchValue) {
      if (props.isServerSideSearch) {
        return props.options.length ? 'Loading...' : 'No Options';
      }
      return 'No Values Found';
    }
    return 'Type Something to search';
  };

  /* istanbul ignore next */
  const renderOption = (option): ReactNode => {
    const label = getOptionLabel(option);
    // showOptionTooltip is using if need to display additional info for option in dropdown list -- User Story 101170
    const tooltip = typeof props.getOptionTooltip === 'function' ? props.getOptionTooltip(option) : label;
    return (
      <Tooltip title={tooltip} disableHoverListener={!props.showTooltip}>
        <Typography
          className={classNames({
            [classes.inActiveText]: option.status?.name === 'InActive',
          })}
        >
          {label}
        </Typography>
      </Tooltip>
    );
  };

  const getHelperText = () => {
    if (Boolean(props.customErrorMessage?.length)) {
      return props.customErrorMessage;
    }
    if (props.isExists) return existsMessage;
    if (hasError()) return requiredMessage;
    return '';
  };

  const renderPopper = useCallback(
    (p: PopperProps) => (
      <Popper
        {...p}
        style={{
          width: props.useFitToContentWidth && Boolean(props.options.length) ? 'min-content' : '' || p.style?.width,
        }}
        placement={popperPlacement}
      />
    ),
    [ props.useFitToContentWidth, popperPlacement, Boolean(props.options.length) ]
  );

  // USED for Multi Select
  const renderTags = (values: ISelectOption[], getTagProps: AutocompleteGetTagProps): React.ReactNode => {
    if (props.renderTags instanceof Function) {
      return props.renderTags(values, getTagProps);
    }
    return values.map((option, index) => (
      <Tooltip key={index} title={getChipTooltip(option) || ''} disableHoverListener={!props.showChipTooltip}>
        <Chip
          {...getTagProps({ index })}
          label={getChipLabel(option)}
          classes={{ root: classes.chip }}
          disabled={getChipDisabled(option)}
        />
      </Tooltip>
    ));
  };

  const inputRoot = classNames({ [classes.inputRoot]: true, [classes.multiple]: props.multiple });
  return (
    <AutoComplete
      PopperComponent={renderPopper}
      disabled={props.disabled}
      autoSelect={props.autoSelect}
      autoHighlight={true}
      multiple={props.multiple}
      open={isOpen}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      disableCloseOnSelect={props.disableCloseOnSelect}
      options={props.options || []}
      value={props.multiple ? value || [] : value || null}
      loading={props.isLoading}
      freeSolo={props.freeSolo}
      noOptionsText={noOptionText()}
      renderTags={renderTags}
      getOptionLabel={getOptionLabel}
      renderOption={props.customRenderOption || renderOption}
      filterOptions={(option, state) => filterOption(option as ISelectOption[], state)}
      getOptionSelected={(currentOption: ISelectOption, values: ISelectOption | ISelectOption[]) =>
        getOptionSelected(currentOption, values)
      }
      getOptionDisabled={option => getOptionDisabled(option as ISelectOption, value)}
      onChange={onChange}
      onInputChange={debounce((e, value, reason) => {
        if (!value && !props.disableCloseOnSelect) {
          setOpen(false);
        }
        if (props.freeSolo) {
          return;
        }
        if ([ 'input' ].includes(reason)) {
          setPage(1);
          setSearchValue(value);
          onSearch(value, { pageNumber: 1 });
        }
      }, debounceTime)}
      ListboxProps={{
        onScroll: onScroll,
      }}
      onFocus={() => onFocus(props.field?.key)}
      onBlur={() => {
        if (props.field) {
          props.field.$blurred = true;
        }
        setOpen(false);
        onBlur(props.field?.key);
      }}
      renderInput={params => (
        <div className={classes.inputWrapper}>
          {props.startAdornment && props.startAdornment}
          <TextField
            {...props.field?.bind({ onChange: () => {} })}
            {...params}
            label={(props.showLabel && props.label) || props.field?.label?.replace('*', '')}
            disabled={props.disabled}
            type="text"
            variant="outlined"
            className={classNames({ [classes.textRoot]: true, ['--large']: true })}
            placeholder={props.placeHolder}
            error={hasError() || props.isExists}
            helperText={getHelperText()}
            inputProps={{ ...params.inputProps, autoComplete: 'off' }}
            InputLabelProps={{ required: props.field?.rules?.includes('required') }}
          />
        </div>
      )}
      classes={{ option: classes.option, popper: classes.popper }}
    />
  );
};

export default observer(forwardRef(AutoCompleteV2));

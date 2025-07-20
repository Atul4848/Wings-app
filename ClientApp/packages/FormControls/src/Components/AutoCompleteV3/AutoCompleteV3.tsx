import {
  PopperPlacementType,
  AutocompleteGetTagProps,
  FilterOptionsState,
  PopperProps,
  ThemeProvider,
  createTheme,
  Autocomplete,
  ThemeOptions,
} from '@mui/material';
import React, { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { observer } from 'mobx-react';
import { ISelectOption, THEMES, Utilities } from '@wings-shared/core';
import { Field } from 'mobx-react-form';
import { IPagination } from '../../Interfaces';
import Tooltip from '@mui/material/Tooltip';
import { unstable_debounce } from '@mui/utils';
import { StyledChip, StyledPopper, StyledTextField } from './AutoCompleteV3.styles';
import { DarkTheme, LightTheme, ThemeStore } from '@wings-shared/layoutv2';

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

export const themes = {
  [THEMES.LIGHT]: LightTheme.LightThemeOptions,
  [THEMES.DARK]: DarkTheme.DarkThemeOptions,
};

// Note : please do not over load with props
const AutoCompleteV3 = (
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
  const renderOption = (option, theme): ReactNode => {
    const label = getOptionLabel(option);
    // showOptionTooltip is using if need to display additional info for option in dropdown list -- User Story 101170
    const tooltip = typeof props.getOptionTooltip === 'function' ? props.getOptionTooltip(option) : label;
    return (
      <Tooltip title={tooltip} disableHoverListener={!props.showTooltip}>
        <span
          style={{
            color:
              option.status?.name === 'InActive'
                ? theme.palette.error.main
                : theme.palette?.menuItem?.textColor?.default,
          }}
        >
          {label}
        </span>
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
      <StyledPopper
        {...p}
        style={{
          width: props.useFitToContentWidth && Boolean(props.options.length) ? 'auto' : p.style?.width,
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
        <StyledChip {...getTagProps({ index })} label={getChipLabel(option)} disabled={getChipDisabled(option)} />
      </Tooltip>
    ));
  };

  const _theme = createTheme(themes[ThemeStore.currentTheme] as ThemeOptions);
  return (
    <ThemeProvider theme={_theme}>
      <Autocomplete
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
        renderOption={(liProps, option: ISelectOption, state) => {
          return <li {...liProps}>{props.customRenderOption?.(option) ?? renderOption(option, _theme)}</li>;
        }}
        filterOptions={(option, state) => filterOption(option as ISelectOption[], state)}
        isOptionEqualToValue={(currentOption: ISelectOption, values: ISelectOption | ISelectOption[]) =>
          getOptionSelected(currentOption, values)
        }
        getOptionDisabled={option => getOptionDisabled(option as ISelectOption, value)}
        onChange={onChange}
        onInputChange={unstable_debounce((e, value, reason) => {
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
        slots={{
          popper: renderPopper,
        }}
        slotProps={{
          listbox: {
            onScroll: onScroll,
          },
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
          <div>
            {props.startAdornment && props.startAdornment}
            <StyledTextField
              {...props.field?.bind({ onChange: () => {} })}
              {...params}
              label={(props.showLabel && props.label) || props.field?.label?.replace('*', '')}
              disabled={props.disabled}
              placeholder={props.placeHolder}
              error={hasError() || props.isExists}
              helperText={getHelperText()}
              slotProps={{
                input: {
                  ...params.InputProps,
                  autoComplete: 'off',
                },
                inputLabel: {
                  required: props.field?.rules?.includes('required'),
                },
              }}
            />
          </div>
        )}
      />
    </ThemeProvider>
  );
};

export default observer(forwardRef(AutoCompleteV3));

import React, { ReactNode, useRef, useImperativeHandle, useState, useEffect, forwardRef } from 'react';
import { IconButton } from '@material-ui/core';
import { useStyles } from './SearchHeader.styles';
import ChipInputControl, { PureChipInputControl } from '../ChipInputControl/ChipInputControl';
import SearchInputControl, { PureSearchInputControl } from '../SearchInputControl/SearchInputControl';
import { RefreshOutlined } from '@material-ui/icons';
import { observer } from 'mobx-react';
import { useEffectAfterMount } from '@wings-shared/hooks';
import SelectInputControl from '../SelectInputControl/SelectInputControl';
import { ISelectOption, ViewPermission, SelectOption } from '@wings-shared/core';
import ExpandCollapseButton from '../ExpandCollapseButton/ExpandCollapseButton';
import { IFilters } from './UseSearchHeader';

export interface ISearchHeaderRef {
  resetInputs: () => void;
  setSearchValue: (searchValue: any) => void;
  selectInputsValues: Map<any, any>;
  searchValue: string;
  hasSearchValue: boolean;
  selectedOption: any;
  getSelectedOption: (key: string) => any;
  setupDefaultFilters: (filter: IFilters) => void;
  getFilters: () => IFilters;
  hasSelectInputsValues?: boolean;
}

interface IChipInputProps {
  getChipLabel?: (field: ISelectOption) => string; // chip label using this key
  getChipTooltip?: (field: ISelectOption) => string; // chip tooltip using this key
  getOptionLabel?: (field: ISelectOption) => string; // chip tooltip using this key
  onChipAddOrRemove?: (searchValue: ISelectOption[]) => void;
  options: ISelectOption[];
  allowOnlySingleSelect?: boolean;
}

interface ISearchInputProps {
  ignoreCase?: boolean;
}

interface ISelectInputProps {
  value?: string | number;
  defaultValue: string | number;
  selectOptions: SelectOption[];
  onOptionChange?: (item: string) => void;
  onFocus?: () => void;
  fieldKey: string;
}

interface Props {
  placeHolder?: string;
  onSearch?: (searchValue: string) => void;
  rightContent?: (props?: Props) => ReactNode;
  backButton?: ReactNode;
  // Search Input Control Type
  isChipInputControl?: boolean;
  isLoading?: boolean;
  disableControls?: boolean;
  onExpandCollapse?: () => void;
  onResetFilterClick?: () => void;
  onKeyUp?: (key: string) => void;
  onClear?: () => void;
  // Props Used By Chip Input Control
  chipInputProps?: IChipInputProps;
  // Props Used By Chip Input Control
  searchInputProps?: ISearchInputProps;
  // Props used By Select Input Controls
  selectInputs: ISelectInputProps[];
  onFilterChange: (isInitEvent: boolean) => void;
  hideSelectionDropdown?: boolean;
}

interface RefProps {
  resetInputs: () => void;
  setSearchValue: (searchValue: string) => void;
}

const SearchHeader = (
  {
    placeHolder = 'Start typing to search',
    onSearch = (a: string) => null,
    rightContent = () => null,
    hasSelectInputsValues = true,
    hideSelectionDropdown = false,
    ...props
  },
  ref
) => {
  const classes = useStyles();
  const [selectInputsValues, setSelectInputsValues] = useState(new Map());
  const [searchValue, setSearchValue] = useState('');
  const [chipValue, setChipValue] = useState([]);

  // Ignore on filter change event if it's a initial setup
  const [isInitEvent, setIsInitEvent] = useState(false);

  const chipInputRef = useRef<PureChipInputControl>();
  const searchInputRef = useRef<PureSearchInputControl>();

  // Expose Function to Parent Component
  /* istanbul ignore next */
  useImperativeHandle(
    ref,
    () => ({
      resetInputs,
      setSearchValue: searchValue => searchInputRef.current?.setInputValue(searchValue),
      selectInputsValues,
      searchValue,
      hasSearchValue: Boolean(searchValue),
      selectedOption: selectInputsValues.get('defaultOption'),
      getSelectedOption: (key: string) => selectInputsValues.get(key),
      getFilters: () => ({ searchValue, chipValue, selectInputsValues }),
      setupDefaultFilters: (filters: IFilters) => {
        if (hasSelectInputsValues) {
          if (!filters.selectInputsValues.size) {
            return;
          }
        }
        setIsInitEvent(true);
        searchInputRef.current?.setInputValue(filters.searchValue);
        setSearchValue(filters.searchValue);
        setChipValue(filters.chipValue);
        setSelectInputsValues(filters.selectInputsValues);
      },
    }),
    [searchValue, chipValue, selectInputsValues]
  );

  // Set Default Selected values
  /* istanbul ignore next */
  useEffect(() => {
    const _mapValue = new Map();
    props.selectInputs.forEach(control => _mapValue.set(control.fieldKey, control.defaultValue));
    setSelectInputsValues(_mapValue);
  }, []);

  // Call On filter change when user search any value
  /* istanbul ignore next */
  useEffectAfterMount(() => {
    props.onFilterChange(isInitEvent);
    setIsInitEvent(false);
  }, [searchValue, chipValue]);

  // Reset Input Controls Values
  /* istanbul ignore next */
  const resetInputs = (): void => {
    setSearchValue('');
    setChipValue([]);
    chipInputRef.current?.clearInputValue();
    searchInputRef.current?.clearInputValue();
  };

  // When user change the Values
  /* istanbul ignore next */
  const onSelectionChange = (fieldKey: string, value: string): void => {
    resetInputs();
    setSelectInputsValues(() => new Map(selectInputsValues.set(fieldKey, value)));
    setTimeout(props.onFilterChange, 500);
  };

  const searchControl = (): ReactNode => {
    const { isChipInputControl, isLoading, onKeyUp, onClear } = props;
    if (isChipInputControl) {
      return (
        <ChipInputControl
          ref={chipInputRef}
          placeHolder={placeHolder}
          isLoading={isLoading}
          isDisabled={props.disableControls}
          value={chipValue}
          onSearch={setSearchValue}
          onChipAddOrRemove={setChipValue}
          {...props.chipInputProps}
        />
      );
    }

    return (
      <SearchInputControl
        ref={searchInputRef}
        placeHolder={placeHolder}
        isDisabled={props.disableControls}
        onKeyUp={onKeyUp}
        onClear={onClear}
        onSearch={setSearchValue}
        searchValue={searchValue}
        {...props.searchInputProps}
      />
    );
  };
  const { backButton } = props;
  return (
    <div className={classes.root}>
      <div className={classes.searchContainer}>
        {backButton && <div className={classes.backButton}>{backButton}</div>}
        <div className={classes.searchInput}>{searchControl()}</div>
        {props.selectInputs.map((control, idx) => (
          <SelectInputControl
            key={idx}
            containerClass={hideSelectionDropdown ? classes.hideSelectInputControl : classes.selectInputControl}
            selectOptions={control.selectOptions}
            value={selectInputsValues.get(control.fieldKey)}
            disabled={props.disableControls}
            onOptionChange={updatedValue => onSelectionChange(control.fieldKey, updatedValue)}
          />
        ))}
        <ViewPermission hasPermission={typeof props.onResetFilterClick === 'function'}>
          <IconButton onClick={() => props.onResetFilterClick()}>
            <RefreshOutlined color="primary" />
          </IconButton>
        </ViewPermission>
        <ViewPermission hasPermission={typeof props.onExpandCollapse === 'function'}>
          <ExpandCollapseButton onExpandCollapse={() => props.onExpandCollapse()} />
        </ViewPermission>
      </div>
      <ViewPermission hasPermission={typeof rightContent === 'function'}>
        <div className={classes.rightContent}>{rightContent()}</div>
      </ViewPermission>
    </div>
  );
};
export default observer(forwardRef<RefProps, Props>(SearchHeader));

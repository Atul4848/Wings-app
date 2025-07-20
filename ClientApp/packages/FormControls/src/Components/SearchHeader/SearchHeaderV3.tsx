import { debounce, IconButton } from '@material-ui/core';
import { RefreshOutlined } from '@material-ui/icons';
import { ISelectOption, SelectOption, ViewPermission } from '@wings-shared/core';
import { observer } from 'mobx-react';
import React, { forwardRef, ReactNode, useEffect } from 'react';
import ChipInputControl from '../ChipInputControl/ChipInputControl';
import ExpandCollapseButton from '../ExpandCollapseButton/ExpandCollapseButton';
import SearchInputControl from '../SearchInputControl/SearchInputControl';
import SelectInputControl from '../SelectInputControl/SelectInputControl';
import { useStyles } from './SearchHeader.styles';
import { SEARCH_HEADER_EVENTS, IUseSearchHeader } from './UseSearchHeader';
import { useEffectAfterMount } from '@wings-shared/hooks';

interface IChipInputProps {
  getChipLabel?: (field: ISelectOption) => string; // chip label using this key
  getChipTooltip?: (field: ISelectOption) => string; // chip tooltip using this key
  getOptionLabel?: (field: ISelectOption) => string; // chip tooltip using this key
  onChipAddOrRemove?: (searchValue: ISelectOption[]) => void;
  options: ISelectOption[];
  allowOnlySingleSelect?: boolean;
  onFocus?: () => void;
}

interface ISearchInputProps {
  ignoreCase?: boolean;
  onKeyUp?: (key: string) => void;
  onClear?: () => void;
}

interface ISelectInputProps {
  value?: string | number;
  defaultValue: string | number;
  selectOptions: SelectOption[];
  onOptionChange?: (item: string) => void;
  onFocus?: () => void;
  fieldKey: string;
  isHidden?: boolean;
}

interface Props {
  placeHolder?: string;
  backButton?: ReactNode; // In some nested screens we needs to show back button
  isChipInputControl?: boolean; // Used to identify the input control  either chip input or simple text field
  isLoading?: boolean;
  disableControls?: boolean;
  onExpandCollapse?: () => void; // Expand the grid columns
  onResetFilterClick?: () => void; // rest filters with one click
  rightContent?: (props?: Props) => ReactNode;
  onSearch?: (searchValue: string) => void;
  onSelectionChange?: (fieldKey, updatedValue) => void; // if Needs to perform any actions on selection change
  onFiltersChanged?: () => void;

  // Props Used By Chip Input Control
  chipInputProps?: IChipInputProps;
  // Props Used By Chip Input Control
  searchInputProps?: ISearchInputProps;
  // created as array As we needs to use more then one dropdowns i.e FAA Imports screens
  selectInputs: ISelectInputProps[];
  // If we needs to use only search values not search type options i.e the nested grid in edit screens
  hideSearchTypeOption?: boolean;
  // suppress reset on selection change
  suppressResetEventOnSelectionChange?: boolean;
  // custom hook to store search values
  useSearchHeader: IUseSearchHeader;
}

interface RefProps {
  resetInputs: () => void;
  setSearchValue: (searchValue: string) => void;
}

const SearchHeader = ({
  placeHolder = 'Start typing to search',
  rightContent = () => null,
  // hasSelectInputsValues = true,
  // hideSelectionDropdown = false,
  useSearchHeader,
  ...props
}: Props) => {
  const classes = useStyles();

  // Set Default Selected values
  useEffect(() => {
    const _mapValue = new Map();
    props.selectInputs.forEach(control => _mapValue.set(control.fieldKey, control.defaultValue));
    useSearchHeader.setSelectInputsValues(_mapValue);
  }, []);

  useEffectAfterMount(
    debounce(() => {
      switch (useSearchHeader.eventType) {
        case SEARCH_HEADER_EVENTS.ON_SEARCH:
          props.onSearch(useSearchHeader.searchValue);
          return;
        case SEARCH_HEADER_EVENTS.ON_CHIP_ADD_REMOVE:
        case SEARCH_HEADER_EVENTS.ON_RESTORE_FILTERS:
          props.onFiltersChanged();
          return;
        case SEARCH_HEADER_EVENTS.ON_SELECTION_CHANGE:
          // if don't want to reset then pass this as true
          if (props.suppressResetEventOnSelectionChange) {
            return;
          }
          props.onFiltersChanged();
      }
    }),
    [ useSearchHeader.refreshFiltersKey ]
  );

  const onSearch = sv => {
    useSearchHeader.setSearchValue(sv);
    useSearchHeader.triggerEvent(SEARCH_HEADER_EVENTS.ON_SEARCH);
  };

  const onChipAddOrRemove = chips => {
    useSearchHeader.setChipValue(chips);
    useSearchHeader.triggerEvent(SEARCH_HEADER_EVENTS.ON_CHIP_ADD_REMOVE);
  };

  // When user change the search type
  const onSelectionChange = (fieldKey, updatedValue) => {
    if (typeof props.onSelectionChange === 'function') {
      props.onSelectionChange(fieldKey, updatedValue);
      return;
    }
    useSearchHeader.onSelectionChange(fieldKey, updatedValue);
  };

  const searchControl = (): ReactNode => {
    const { isChipInputControl, isLoading } = props;
    if (isChipInputControl) {
      return (
        <ChipInputControl
          placeHolder={placeHolder}
          isLoading={isLoading}
          isDisabled={props.disableControls}
          ref={useSearchHeader.chipInputRef}
          value={useSearchHeader.chipValue}
          onSearch={onSearch}
          onChipAddOrRemove={onChipAddOrRemove}
          {...props.chipInputProps}
        />
      );
    }

    return (
      <SearchInputControl
        placeHolder={placeHolder}
        isDisabled={props.disableControls}
        ref={useSearchHeader.searchInputRef}
        onSearch={onSearch}
        searchValue={useSearchHeader.searchValue}
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
            // containerClass={hideSelectionDropdown ? classes.hideSelectInputControl : classes.selectInputControl}
            containerClass={classes.selectInputControl}
            selectOptions={control.selectOptions}
            value={useSearchHeader.selectInputsValues.get(control.fieldKey)}
            disabled={props.disableControls}
            onOptionChange={option => onSelectionChange(control.fieldKey, option)}
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

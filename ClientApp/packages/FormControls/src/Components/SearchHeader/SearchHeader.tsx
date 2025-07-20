import React, { Component, RefObject, ReactNode, ReactElement, RefAttributes } from 'react';
import { withStyles, IconButton } from '@material-ui/core';
import { styles } from './SearchHeader.styles';
import ChipInputControl, { PureChipInputControl } from '../ChipInputControl/ChipInputControl';
import SearchInputControl, { PureSearchInputControl } from '../SearchInputControl/SearchInputControl';
import SelectInputControl from '../SelectInputControl/SelectInputControl';
import { RefreshOutlined } from '@material-ui/icons';
import { IClasses, ISelectOption, SelectOption } from '@wings-shared/core';
import ExpandCollapseButton from '../ExpandCollapseButton/ExpandCollapseButton';

interface Props extends RefAttributes<SearchHeader> {
  classes?: IClasses;
  chipValue?: ISelectOption[];
  searchPlaceHolder?: string;
  searchTypeValue: string;
  searchTypeOptions: SelectOption[];
  otherSearchTypeValue?: string;
  otherSearchTypeOptions?: SelectOption[];
  onOtherSearchTypeChange?: (searchValue: string) => void;
  onSearchTypeChange: (searchValue: string) => void;
  onSearch: (searchValue: string) => void;
  onChipAddOrRemove?: (searchValue: ISelectOption[]) => void;
  rightContent?: ReactNode;
  backButton?: ReactNode;
  isChipInputControl?: boolean;
  isHideSearchSelectControl?: boolean;
  isOtherSelectControl?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  ignoreCase?: boolean;
  options?: ISelectOption[];
  expandCollapse?: () => void;
  onResetFilterClick?: () => void;
  onKeyUp?: (key: string) => void;
  getChipLabel?: (field: ISelectOption) => string; // chip label using this key
  getChipTooltip?: (field: ISelectOption) => string; // chip tooltip using this key
  getOptionLabel?: (field: ISelectOption) => string; // chip tooltip using this key
  onClear?: () => void;
}

class SearchHeader extends Component<Props> {
  public chipInputRef: RefObject<PureChipInputControl> = React.createRef<PureChipInputControl>();
  public searchInputRef: RefObject<PureSearchInputControl> = React.createRef<PureSearchInputControl>();

  static defaultProps = {
    searchPlaceHolder: 'Start typing to search',
    onChipAddOrRemove: () => null,
    onSearch: () => {},
    onKeyUp: () => null,
    onClear: () => null,
    ignoreCase: false,
    isOtherSelectControl: false,
  };

  private onSearchTypeChange(searchType: string): void {
    this.chipInputRef.current?.clearInputValue();
    this.searchInputRef.current?.clearInputValue();
    this.props.onSearchTypeChange(searchType);
  }

  private onOtherSearchTypeChange(searchType: string): void {
    this.chipInputRef.current?.clearInputValue();
    this.searchInputRef.current?.clearInputValue();
    this.props.onOtherSearchTypeChange(searchType);
  }

  // to reset searchValue from parent
  public resetSearchInput(): void {
    this.searchInputRef.current?.clearInputValue();
  }

  public setSearchValue(searchValue): void {
    this.searchInputRef.current?.setInputValue(searchValue);
  }

  private get searchControl(): ReactNode {
    const {
      isChipInputControl,
      searchPlaceHolder,
      chipValue,
      isLoading,
      options,
      onSearch,
      onKeyUp,
      onClear,
    } = this.props;

    if (isChipInputControl) {
      return (
        <ChipInputControl
          ref={this.chipInputRef}
          placeHolder={searchPlaceHolder}
          value={chipValue}
          onChipAddOrRemove={(chips: ISelectOption[]) => this.props.onChipAddOrRemove(chips)}
          isLoading={isLoading}
          options={options}
          onSearch={onSearch}
          getChipLabel={this.props.getChipLabel}
          getChipTooltip={this.props.getChipTooltip}
          getOptionLabel={this.props.getOptionLabel}
        />
      );
    }

    return (
      <SearchInputControl
        ref={this.searchInputRef}
        placeHolder={searchPlaceHolder}
        isDisabled={this.props.isDisabled}
        ignoreCase={this.props.ignoreCase}
        onKeyUp={onKeyUp}
        onSearch={(searchValue: string) => onSearch(searchValue)}
        onClear={onClear}
      />
    );
  }

  private get expandCollapseControl(): ReactElement {
    const { expandCollapse } = this.props;
    if (!(typeof expandCollapse === 'function')) {
      return null;
    }
    return (
      <ExpandCollapseButton onExpandCollapse={() => this.props.expandCollapse()} />
    );
  }

  private get resetSearchFilterButton(): ReactNode {
    const { onResetFilterClick } = this.props;
    if (!(typeof onResetFilterClick === 'function')) {
      return null;
    }
    return (
      <IconButton onClick={() => this.props.onResetFilterClick()}>
        <RefreshOutlined color="primary" />
      </IconButton>
    );
  }

  public render(): ReactNode {
    const {
      classes,
      searchTypeValue,
      otherSearchTypeValue,
      searchTypeOptions,
      otherSearchTypeOptions,
      rightContent,
      backButton,
      isHideSearchSelectControl,
      isDisabled,
      isOtherSelectControl,
    } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.searchContainer}>
          {backButton && <div className={classes.backButton}>{backButton}</div>}
          <div className={classes.searchInput}>{this.searchControl}</div>
          {!isHideSearchSelectControl && (
            <SelectInputControl
              containerClass={classes.selectInputControl}
              value={searchTypeValue}
              selectOptions={searchTypeOptions}
              disabled={isDisabled}
              onOptionChange={option => this.onSearchTypeChange(option)}
            />
          )}
          {isOtherSelectControl && (
            <SelectInputControl
              containerClass={classes.selectInputControl}
              value={otherSearchTypeValue}
              selectOptions={otherSearchTypeOptions}
              disabled={isDisabled}
              onOptionChange={option => this.onOtherSearchTypeChange(option)}
            />
          )}
          {this.resetSearchFilterButton}
          {this.expandCollapseControl}
        </div>
        <div className={classes.rightContent}>{rightContent}</div>
      </div>
    );
  }
}
export default withStyles(styles)(SearchHeader);
export { SearchHeader as PureSearchHeader };

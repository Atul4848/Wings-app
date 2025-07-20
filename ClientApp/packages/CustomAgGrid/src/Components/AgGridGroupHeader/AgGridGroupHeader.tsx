import React, { Component, ReactNode } from 'react';
import { withStyles } from '@material-ui/core';
import { ColumnApi, Column, ColGroupDef, ProvidedColumnGroup } from 'ag-grid-community';
import {
  ArrowDownwardOutlined,
  MenuRounded,
  ArrowUpwardOutlined,
  ChevronRightRounded,
  ChevronLeftRounded,
} from '@material-ui/icons';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { styles } from './AgGridGroupHeader.styles';
import { FilterOn } from '../../Assets/FilterOn';
import { FilterOff } from '../../Assets/FilterOff';
import { IClasses, SORTING_DIRECTION } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  enableSorting?: boolean;
  enableMenu?: boolean;
  displayName?: string;
  showColumnMenu?: Function;
  column?: Column;
  setSort?: Function;
  columnApi?: ColumnApi;
}

@observer
class AgGridGroupHeader extends Component<Props> {
  private menuButton: HTMLDivElement;
  @observable private isMouseHovering: boolean;
  @observable private sortingState: string = '';
  @observable private isGroupExpanded: boolean = false;
  @observable private isFilterActive: boolean = false;

  constructor(props) {
    super(props);
    props.column.addEventListener('filterChanged', () => this.updateFilterState());
    props.column.addEventListener('sortChanged', () => this.updateSortingState());
    if (this.isNestedColumn) {
      props.column.getOriginalParent().addEventListener('expandedChanged', () => this.updateGroupExpandState());
      return;
    }
    this.originalParentGroup.addEventListener('expandedChanged', () => this.updateGroupExpandState());
  }

  componentDidMount() {
    this.updateSortingState();
    this.updateFilterState();
    this.updateGroupExpandState();
  }

  componentWillUnmount() {
    this.props.column.removeEventListener('filterChanged', () => this.updateFilterState());
    this.props.column.removeEventListener('sortChanged', () => this.updateSortingState());
    if (this.isNestedColumn) {
      this.props.column.getOriginalParent().removeEventListener('expandedChanged', () => this.updateGroupExpandState());
      return;
    }
    this.originalParentGroup.removeEventListener('expandedChanged', () => this.updateGroupExpandState());
  }

  @action
  private onMouseHover(isHovering: boolean): void {
    this.isMouseHovering = isHovering;
  }

  @action
  private updateFilterState(): void {
    this.isFilterActive = this.props.column.isFilterActive();
  }

  @action
  private updateSortingState(): void {
    this.sortingState = this.props.column.isSortAscending()
      ? SORTING_DIRECTION.ASCENDING
      : this.props.column.isSortDescending()
        ? SORTING_DIRECTION.DESCENDING
        : SORTING_DIRECTION.NO_SORT;
  }

  private get nextSortState(): string {
    return this.sortingState === SORTING_DIRECTION.ASCENDING
      ? SORTING_DIRECTION.DESCENDING
      : this.sortingState === SORTING_DIRECTION.DESCENDING
        ? SORTING_DIRECTION.NO_SORT
        : SORTING_DIRECTION.ASCENDING;
  }

  private onSortRequested(event): void {
    const { enableSorting, setSort } = this.props;
    enableSorting && setSort(this.nextSortState, event.shiftKey);
  }

  private get nestedParentGroup(): ColGroupDef {
    return this.props.column
      .getParent()
      .getOriginalColumnGroup()
      .getColGroupDef();
  }

  private get originalParentGroup(): ProvidedColumnGroup {
    return this.props.column
      .getParent()
      .getOriginalColumnGroup()
      .getOriginalParent();
  }

  private get parentGroupId(): string {
    return this.nestedParentGroup?.groupId || this.originalParentGroup.getGroupId();
  }

  private get isNestedColumn(): boolean {
    return Boolean(Object.keys(this.nestedParentGroup).length);
  }

  private get getGroupExpand(): boolean {
    const { column } = this.props;
    return this.isNestedColumn ? column.getOriginalParent().isExpanded() : this.originalParentGroup.isExpanded();
  }

  private toggleGroup(): void {
    const { columnApi } = this.props;
    const isExpanded = this.getGroupExpand;
    columnApi.setColumnGroupOpened(this.parentGroupId, !isExpanded);
  }

  @action
  private updateGroupExpandState(): void {
    this.isGroupExpanded = this.getGroupExpand;
  }

  private onMenuClicked(): void {
    this.props.showColumnMenu(this.menuButton);
  }

  private get renderMenu(): ReactNode {
    const { classes } = this.props;
    if (this.props.enableMenu) {
      return (
        <div
          ref={menuButton => (this.menuButton = menuButton)}
          className={classes.customHeaderMenuButton}
          onClick={() => this.onMenuClicked()}
        >
          {this.isMouseHovering && <MenuRounded fontSize="small" className={classes.menuIcon} />}
        </div>
      );
    }
    return null;
  }

  private get renderSortIcon(): ReactNode {
    const { classes } = this.props;
    if (this.sortingState.length) {
      return (
        <div className={classes.customSortIcon}>
          {this.sortingState === SORTING_DIRECTION.DESCENDING ? (
            <ArrowDownwardOutlined fontSize="small" className={classes.menuIcon} />
          ) : (
            <ArrowUpwardOutlined fontSize="small" className={classes.menuIcon} />
          )}
        </div>
      );
    }
    return null;
  }

  private get renderFilterIcon(): ReactNode {
    const { classes, column } = this.props;
    const colDef = column.getColDef();
    if (colDef?.filter) {
      return (
        <div>
          {this.isFilterActive ? (
            <img src={FilterOn} className={classes.customFilterIcon} />
          ) : (
            <img src={FilterOff} className={classes.customFilterIcon} />
          )}
        </div>
      );
    }
    return null;
  }

  private get renderGroupIcon(): ReactNode {
    const { classes, enableMenu } = this.props;

    if (!enableMenu) {
      return null;
    }

    return (
      <div onClick={() => this.toggleGroup()} className={classes.customHeaderMenuButton}>
        {this.isGroupExpanded ? <ChevronLeftRounded fontSize="small" /> : <ChevronRightRounded fontSize="small" />}
      </div>
    );
  }

  render() {
    const { classes, displayName } = this.props;
    return (
      <div
        className={classes.root}
        onMouseEnter={() => this.onMouseHover(true)}
        onMouseLeave={() => this.onMouseHover(false)}
      >
        <div className={classes.headerLabelContainer} onClick={e => this.onSortRequested(e)}>
          <span className={classes.customHeaderLabel}>{displayName}</span>
          {this.renderFilterIcon}
          {this.renderSortIcon}
        </div>
        {this.renderGroupIcon}
        {this.renderMenu}
      </div>
    );
  }
}

export default withStyles(styles)(AgGridGroupHeader);
export { AgGridGroupHeader as PureAgGridGroupHeader };

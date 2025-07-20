import React, { Component, ReactNode } from 'react';
import { withStyles } from '@material-ui/core';
import { ColumnApi, Column } from 'ag-grid-community';
import { ArrowDownwardOutlined, ArrowUpwardOutlined, MenuRounded } from '@material-ui/icons';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { styles } from './AgColumnHeader.styles';
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
class AgColumnHeader extends Component<Props> {
  private menuButton: HTMLDivElement;
  @observable private sortingState: string = '';
  @observable private isFilterActive: boolean = false;
  @observable private isMouseHovering: boolean;

  constructor(props) {
    super(props);
    props.column.addEventListener('filterChanged', () => this.updateFilterState());
    props.column.addEventListener('sortChanged', () => this.updateSortingState());
  }

  componentDidMount(): void {
    this.updateSortingState();
    this.updateFilterState();
  }

  componentWillUnmount() {
    this.props.column.removeEventListener('filterChanged', () => this.updateFilterState());
    this.props.column.removeEventListener('sortChanged', () => this.updateSortingState());
  }

  /* istanbul ignore next */
  @action
  private updateSortingState(): void {
    this.sortingState = this.props.column.isSortAscending()
      ? SORTING_DIRECTION.ASCENDING
      : this.props.column.isSortDescending()
        ? SORTING_DIRECTION.DESCENDING
        : SORTING_DIRECTION.NO_SORT;
  }

  /* istanbul ignore next */
  @action
  private updateFilterState(): void {
    this.isFilterActive = this.props.column.isFilterActive();
  }

  @action
  private onMouseHover(isHovering: boolean): void {
    this.isMouseHovering = isHovering;
  }

  private onMenuClicked(): void {
    this.props.showColumnMenu(this.menuButton);
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
        <div onClick={() => null} className={classes.customSortIcon}>
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
        {this.renderMenu}
      </div>
    );
  }
}

export default withStyles(styles)(AgColumnHeader);
export { AgColumnHeader as PureAgColumnHeader };

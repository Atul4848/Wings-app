import React, { Component, ReactNode, RefObject } from 'react';
import { observer } from 'mobx-react';
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';
import { Popover, withStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { Dropdown } from '@uvgo-shared/dropdown';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IActionMenuItem, IBaseActionProps } from '../../Interfaces';
import { DropdownItem } from '@wings-shared/form-controls';
import { styles } from './AgGridActionMenu.styles';
import { observable } from 'mobx';
import { ViewPermission, GRID_ACTIONS } from '@wings-shared/core';

interface Props extends IBaseActionProps {
  dropdownItems: () => IActionMenuItem[];
  onMenuItemClick: (action: GRID_ACTIONS, title?: string) => void;
}

@observer
class AgGridActionMenu extends Component<Props> {
  @observable isOpen = false;
  @observable dropRef: RefObject<Dropdown> = React.createRef<Dropdown>();

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, true);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, true);
  }

  private handleScroll = (): void => {
    this.isOpen = false;
  };

  private dropDownItem(item: IActionMenuItem): ReactNode {
    const isCallable: boolean = item.to instanceof Function;

    // check if link provided
    if (isCallable) {
      return (
        <Link to={item.to(this.props.node)} className={this.props.classes.link} onClick={() => this.clickHandler(item)}>
          {item.title}
        </Link>
      );
    }
    return item.title;
  }

  private clickHandler(item: IActionMenuItem): void {
    this.props.onMenuItemClick(item.action, item.title);
  }

  private get dropDownItems(): ReactNode[] {
    return this.props.dropdownItems().map((item: IActionMenuItem, index: number) => (
      <ViewPermission key={index} hasPermission={!item.isHidden}>
        <DropdownItem
          isDisabled={item.isDisabled}
          noPadding={Boolean(item.to)}
          onClick={() => !(item.to instanceof Function) && this.clickHandler(item)}
        >
          {this.dropDownItem(item)}
        </DropdownItem>
      </ViewPermission>
    ));
  }

  public render(): ReactNode {
    return (
      <React.Fragment>
        <PrimaryButton
          ref={this.dropRef as any}
          variant="contained"
          color="primary"
          onClick={() => (this.isOpen = true)}
        >
          More
        </PrimaryButton>
        <Popover
          id={'id'}
          open={this.isOpen}
          anchorEl={this.dropRef.current as any}
          onClick={() => (this.isOpen = false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          PaperProps={{
            classes: { root: this.props.classes.paperRoot },
          }}
        >
          {this.dropDownItems}
        </Popover>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AgGridActionMenu);
export { AgGridActionMenu as PureAgGridActionMenu };

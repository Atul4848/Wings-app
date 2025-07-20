import React, { Component } from 'react';
import { Button, ButtonGroup, Tooltip, withStyles, Menu, MenuItem } from '@material-ui/core';
import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { AirportLogisticsStore } from '../../../Shared';
import { ArrowDropDown, Check, Restore } from '@material-ui/icons';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { styles } from './SurveyReviewStepHeader.styles';
import { IClasses } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  title: string;
  isApproved: boolean;
  approveHandler: () => void;
  classes?: IClasses;
  unSubmitHandler: (param?: boolean) => void;
};

@inject('airportLogisticsStore')
@observer
class SurveyReviewStepHeader extends Component<Props> {
  @observable private menuElement: HTMLElement = null;

  @action
  private handleClick(event: React.MouseEvent<HTMLElement>) {
    this.menuElement = event.currentTarget;
  }

  @action
  private handleClose() {
    this.menuElement = null;
  }

  private menuClickUnSubmit(resetAll: boolean) {
    const { unSubmitHandler } = this.props;

    this.handleClose();
    unSubmitHandler(resetAll);
  }

  @computed
  private get tooltipTitle(): string {
    return !this.props.airportLogisticsStore.hasAccessedAll
      ? 'Approve or Ignore all the fields to enable this button'
      : 'Approve';
  }

  render() {
    const { airportLogisticsStore, title, classes, isApproved, unSubmitHandler, approveHandler } = this.props;

    const isMenuOpened = Boolean(this.menuElement);

    return (
      <div className={classes.container}>
        <h2 className={classes.heading}>{title}</h2>
        {isApproved && (
          <div className={classes.headerContainer}>
            <div className={classes.alert}>
              <div className={classes.alertIcon}>
                <CheckCircleOutlineIcon />
              </div>
              Category data already approved.
            </div>
            <ButtonGroup className={classes.overlay} variant="contained" color="primary" aria-label="split button">
              <Button
                onClick={() => unSubmitHandler(false)}
                color="primary"
                variant="contained"
                size="small"
                startIcon={<Restore />}
                className={classes.unSubmitButtonText}
              >
                un-submit
              </Button>
              <Button
                color="primary"
                size="small"
                aria-controls={isMenuOpened ? 'split-button-menu' : undefined}
                aria-expanded={isMenuOpened ? 'true' : undefined}
                aria-label="select merge strategy"
                aria-haspopup="menu"
                onClick={this.handleClick.bind(this)}
              >
                <ArrowDropDown />
              </Button>
            </ButtonGroup>
            <Menu
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              anchorEl={this.menuElement}
              keepMounted
              open={isMenuOpened}
              onClose={() => this.handleClose()}
            >
              <MenuItem className={classes.menuItemText} onClick={() => this.menuClickUnSubmit(true)}>
                UN-SUBMIT ALL CATEGORIES
              </MenuItem>
            </Menu>
          </div>
        )}
        {!isApproved && (
          <Tooltip title={this.tooltipTitle}>
            <div>
              <Button
                className="btn-approve"
                color="secondary"
                variant="contained"
                size="small"
                startIcon={<Check />}
                disabled={!airportLogisticsStore.hasAccessedAll}
                onClick={() => approveHandler()}
              >
                Approve
              </Button>
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(SurveyReviewStepHeader);

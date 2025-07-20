import React, { Component, Fragment, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import { Button, withStyles } from '@material-ui/core';
import { Restore } from '@material-ui/icons';
import { AirportLogisticsStore } from './../../../Shared/Stores/index';
import SurveyReviewActions from '../../SurveyReviewActions/SurveyReviewActions';
import SurveyReviewLabel from './SurveyReviewLabel/SurveyReviewLabel';
import SurveyReviewNoDataLabel from './SurveyReviewNoDataLabel/SurveyReviewNoDataLabel';
import SurveyReviewList from './SurveyReviewList/SurveyReviewList';
import SurveyReviewListItem from './SurveyReviewListItem/SurveyReviewListItem';
import { LogisticsComponentModel, SurveyReviewStatusModel, ValueUnitPairModel } from './../../../Shared/Models/index';
import { SURVEY_SECTION_TYPES, SURVEY_EDIT_TYPES, LOGISTICS_COMPONENTS } from './../../../Shared/Enums/index';
import {
  SurveyValueEditor,
  SurveySelectionEditor,
  SurveyListEditor,
  SurveyRadioEditor,
  SurveyValueUnitPairEditor,
} from '../../SurveyEditor';
import MainTerminal from '../Ciq/CiqAirport/MainTerminal/MainTerminal';
import CiqMainTerminal from '../Ciq/CiqAirport/CiqMainTerminal/CiqMainTerminal';
import CiqVipAreaTerminal from '../Ciq/CiqAirport/CiqVipAreaTerminal/CiqVipAreaTerminal';
import GeneralAviationTerminal from '../Ciq/CiqAirport/GeneralAviationTerminal/GeneralAviationTerminal';
import FboOperatingHours from '../Ciq/CiqHandler/FboOperatingHours/FboOperatingHours';
import EventReview from '../EventAndPertinent/EventReview/EventReview';
import { Field } from 'mobx-react-form';
import classNames from 'classnames';
import { IClasses } from '@wings-shared/core';

import { styles } from './SurveyReviewSection.styles';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  label?: string;
  approved?: any;
  unApproved?: any;
  type?: SURVEY_EDIT_TYPES;
  sectionType?: SURVEY_SECTION_TYPES;
  field?: Field;
  classes?: IClasses;
  updateHandler?: (status: SurveyReviewStatusModel) => void;
  modifier?: string;
  component?: LOGISTICS_COMPONENTS;
};

@inject('airportLogisticsStore')
@observer
class SurveyReviewSection extends Component<Props> {
  @observable private isShown: boolean = false;
  @observable private isEditMode: boolean = false;
  @observable private isApproved: boolean = false;
  @observable private isIgnored: boolean = false;

  @action
  private actionsHandler(isShown: boolean): void {
    if (this.isApproved || this.isIgnored) {
      this.isShown = false;
      return;
    }

    this.isShown = isShown;
  }

  @action
  private editHandler(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.updateHandler();
    }
  }

  @action
  private cancelHandler(): void {
    this.isEditMode = !this.isEditMode;
  }

  @action
  private resetHandler(): void {
    this.isApproved = false;
    this.isIgnored = false;
    this.updateHandler();
  }

  @action
  private approveHandler(): void {
    this.isApproved = true;
    this.updateHandler();
  }

  @action
  private ignoreHandler(): void {
    this.isIgnored = true;
    this.updateHandler();
  }

  private updateHandler(): void {
    this.props.updateHandler(this.surveyReviewStatus);
  }

  private get surveyReviewStatus(): SurveyReviewStatusModel {
    const { field } = this.props;
    return new SurveyReviewStatusModel({
      key: field?.name,
      isApproved: this.isApproved,
      isIgnored: this.isIgnored,
    });
  }

  @computed
  private get actions(): ReactNode {
    const { airportLogisticsStore, classes, field, unApproved } = this.props;
    if (airportLogisticsStore.isSurveyApproved || !this.isShown) {
      return null;
    }

    return (
      <div className={classes.actions}>
        <SurveyReviewActions
          isValid={field?.isValid}
          isEditMode={this.isEditMode}
          isDisabledApprove={this.hasNoData(unApproved)}
          editHandler={() => this.editHandler()}
          approveHandler={() => this.approveHandler()}
          ignoreHandler={() => this.ignoreHandler()}
          cancelHandler={() => this.cancelHandler()}
        />
      </div>
    );
  }

  @computed
  private get editor(): ReactNode {
    const { component, field, type, sectionType, unApproved } = this.props;

    if (sectionType) {
      return null;
    }

    switch (type) {
      case SURVEY_EDIT_TYPES.LIST:
        return <SurveyListEditor field={field} addHandler={() => field.add()} />;
      case SURVEY_EDIT_TYPES.RADIO:
        return <SurveyRadioEditor field={field} />;
      case SURVEY_EDIT_TYPES.SELECTION:
        return (
          <SurveySelectionEditor
            field={field}
            selected={unApproved as LogisticsComponentModel[]}
            component={component}
          />
        );
      case SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR:
        return <SurveyValueUnitPairEditor field={field} />;
      default:
        return <SurveyValueEditor field={field} />;
    }
  }

  private get listClasses(): string {
    const { classes, modifier } = this.props;
    return classNames({
      [classes.list]: true,
      [classes[modifier]]: Boolean(modifier),
    });
  }

  private getList(value: string | string[] | ValueUnitPairModel | LogisticsComponentModel[]): ReactNode {
    const { type } = this.props;
    switch (type) {
      case SURVEY_EDIT_TYPES.LIST:
        return <SurveyReviewList list={value as string[]} classes={this.listClasses} />;
      case SURVEY_EDIT_TYPES.SELECTION:
        const selections: LogisticsComponentModel[] = value as LogisticsComponentModel[];
        const list: string[] = selections.map(a => a.subComponentName);
        return <SurveyReviewList list={list as string[]} classes={this.listClasses} />;
      case SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR:
        if (typeof value === 'object') {
          const item: ValueUnitPairModel = value as ValueUnitPairModel;
          const itemValue: string = `${item.value} ${item.unit}`;
          return <SurveyReviewListItem item={itemValue as string} />;
        }
        return <SurveyReviewListItem item={value as string} />;
      default:
        return <SurveyReviewListItem item={value as string} />;
    }
  }

  private hasNoData(data: any): boolean {
    return (
      !Boolean(data) ||
      (Array.isArray(data) && !Boolean(data.length)) ||
      (typeof data === 'object' && data?.value === '') ||
      data?.operatingHours?.every(item => !item.timeFrom && !item.timeTo)
    );
  }

  @computed
  private get unApprovedData(): ReactNode {
    const { unApproved, sectionType } = this.props;

    if (this.isEditMode) {
      return <div className={this.listClasses}>{this.editor}</div>;
    }

    if (this.hasNoData(unApproved)) {
      return <SurveyReviewNoDataLabel />;
    }

    if (sectionType) {
      return this.getHourSection(false);
    }

    return (
      <Fragment>
        <SurveyReviewLabel />
        {this.getList(unApproved)}
      </Fragment>
    );
  }

  private getHourSection(isApproved?: boolean): ReactNode {
    const { approved, unApproved, sectionType, field } = this.props;
    const isEditMode: boolean = isApproved ? this.isEditMode : false;
    const data = isApproved ? approved : unApproved;
    const dataProp: string = isApproved ? 'approved' : 'unApproved';
    const props = {
      isEditMode,
      field,
      ...{ [dataProp]: data },
    };

    switch (sectionType) {
      case SURVEY_SECTION_TYPES.MAIN_TERMINAL:
        return <MainTerminal {...props} />;
      case SURVEY_SECTION_TYPES.CIQ_MAIN_TERMINAL:
        return <CiqMainTerminal {...props} />;
      case SURVEY_SECTION_TYPES.VIP_AREA_TERMINAL:
        return <CiqVipAreaTerminal {...props} />;
      case SURVEY_SECTION_TYPES.GENERAL_AVIATION_TERMINAL:
        return <GeneralAviationTerminal {...props} />;
      case SURVEY_SECTION_TYPES.PRIVATE_FBO_OPERATING_HOURS:
        return <FboOperatingHours {...props} />;
      case SURVEY_SECTION_TYPES.CIQ_HOURS_FOR_GAT_OR_FBO:
        return <FboOperatingHours {...props} />;
      case SURVEY_SECTION_TYPES.EVENTS:
        return <EventReview {...props} />;
    }
  }

  @computed
  private get approvedData(): ReactNode {
    const { approved, sectionType } = this.props;

    if (sectionType) {
      return this.getHourSection(true);
    }

    if (this.isEditMode) {
      return null;
    }

    if (this.hasNoData(approved)) {
      return <SurveyReviewNoDataLabel isApproved={true} />;
    }

    return (
      <Fragment>
        <SurveyReviewLabel isApproved={true} />
        {this.getList(approved)}
      </Fragment>
    );
  }

  @computed
  private get resetButton(): ReactNode {
    const { classes } = this.props;
    if (!this.isApproved && !this.isIgnored) {
      return null;
    }

    return (
      <div className={classes.overlay}>
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={() => this.resetHandler()}
          startIcon={<Restore />}
        >
          Reset
        </Button>
      </div>
    );
  }

  private get sectionLabel(): ReactNode {
    const { classes, label } = this.props;
    if (!label) {
      return null;
    }

    return <div className={classes.label}>{label}</div>;
  }

  render() {
    const { classes } = this.props;
    const containerClasses: string = classNames({
      [classes.container]: true,
      [classes.backdrop]: this.isEditMode,
      [classes.isApproved]: this.isApproved,
      [classes.isIgnored]: this.isIgnored,
    });

    return (
      <div
        className={containerClasses}
        onMouseOver={() => this.actionsHandler(true)}
        onMouseLeave={() => this.actionsHandler(false)}
      >
        <div className={classes.editor}>
          {this.sectionLabel}
          <div className={classes.section}>
            {this.unApprovedData}
            {this.approvedData}
          </div>
          {this.actions}
        </div>
        {this.resetButton}
      </div>
    );
  }
}

export default withStyles(styles)(SurveyReviewSection);

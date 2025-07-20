import React, { Fragment, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import { Field } from 'mobx-react-form';
import { takeUntil } from 'rxjs/operators';
import { UnsubscribableComponent } from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import { AirportLogisticsStore } from './../../../Shared/Stores/index';
import { LOGISTICS_COMPONENTS } from './../../../Shared/Enums/index';
import { LogisticsComponentModel } from './../../../Shared/Models/index';
import { AxiosError } from 'axios';
import { Progress, PROGRESS_TYPES } from '@uvgo-shared/progress';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  field: Field;
  selected: LogisticsComponentModel[];
  component: LOGISTICS_COMPONENTS;
};

@inject('airportLogisticsStore')
@observer
class SurveySelectionEditor extends UnsubscribableComponent<Props> {
  @observable private isLoading: boolean = false;
  @observable private selected: LogisticsComponentModel[] = this.props.selected;

  @action
  private changeHandler(changedOption: LogisticsComponentModel): void {
    this.isSelected(changedOption)
      ? (this.selected = this.selected.filter(option => option.subComponentId !== changedOption.subComponentId))
      : this.selected.push(changedOption);
    this.selected = this.selected
      .slice()
      .sort((a: LogisticsComponentModel, b: LogisticsComponentModel) => a.subComponentId - b.subComponentId);
    this.props.field.set('value', this.selected);
  }

  @action
  private changeAllHandler(): void {
    this.selected = this.isAllSelected
      ? []
      : this.currentComponentOptions;
    this.props.field.set('value', this.selected);
  }

  private isSelected(option: LogisticsComponentModel): boolean {
    return this.selected.some(select => select.subComponentId === option.subComponentId);
  }

  private get isAllSelected(): boolean {
    return this.selected.length === this.currentComponentOptions.length;
  }

  private getCheckbox(option: LogisticsComponentModel): ReactNode {
    return (
      <FormControlLabel
        key={option.subComponentId}
        onChange={() => this.changeHandler(option)}
        checked={this.isSelected(option)}
        control={<Checkbox />}
        label={option.subComponentName}
      />
    );
  }

  private get selectAllCheckbox(): ReactNode {
    return (
      <FormControlLabel
        onChange={() => this.changeAllHandler()}
        checked={this.isAllSelected}
        control={<Checkbox />}
        label={this.isAllSelected ? 'Deselect All' : 'Select All'}
      />
    );
  }

  @computed
  private get currentComponentOptions(): LogisticsComponentModel[] {
    const { airportLogisticsStore, component } = this.props;
    return airportLogisticsStore.logisticsComponentOptions[component];
  }

  @action
  private loadOptions(): void {
    const { airportLogisticsStore, component } = this.props;
    if (!this.currentComponentOptions) {
      this.isLoading = true;
      airportLogisticsStore
        .getComponentList(component)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (error: AxiosError) => AlertStore.critical(error.message),
          complete: () => this.isLoading = false,
        });
    }
  }

  componentDidMount(): void {
    this.loadOptions();
  }

  @computed
  private get component(): ReactNode {
    if (this.isLoading || !this.currentComponentOptions?.length) {
      return <Progress type={PROGRESS_TYPES.DOTS} />;
    }

    return (
      <Fragment>
        {this.selectAllCheckbox}
        {this.currentComponentOptions.map(option => this.getCheckbox(option))}
      </Fragment>
    );
  }

  render() {
    return this.component;
  }
}

export default SurveySelectionEditor;

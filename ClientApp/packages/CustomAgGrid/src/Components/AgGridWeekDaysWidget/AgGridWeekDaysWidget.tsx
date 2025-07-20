import React, { ReactNode, RefObject } from 'react';
import { ICellEditorReactComp } from 'ag-grid-react';
import { withStyles, ButtonBase } from '@material-ui/core';
import { action, observable } from 'mobx';
import { IBaseEditorProps } from '../../Interfaces';
import { styles } from './AgGridWeekDaysWidget.styles';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { daysOfWeekOptions, DayOfWeekModel, RECURRENCE_PATTERN_TYPE, SCHEDULE_TYPE } from '@wings-shared/scheduler';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { IClasses, Utilities, SelectOption } from '@wings-shared/core';

interface Props extends Partial<IBaseEditorProps> {
  classes?: IClasses;
  isRowEditing?: boolean;
  isNoSchedule?: () => boolean;
}

@observer
class AgGridWeekDaysWidget extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  protected rootDivRef: RefObject<HTMLDivElement> = React.createRef();
  @observable selectedDays: DayOfWeekModel[] = [];
  @observable recurrencePatternId: number = 0;
  @observable recurrencePatternTypeId: RECURRENCE_PATTERN_TYPE;

  componentDidMount() {
    this.selectedDays = this.props.value || [];
    const patternedRecurrence = this.props.data?.schedule?.patternedRecurrence;
    if (patternedRecurrence) {
      this.recurrencePatternId = patternedRecurrence?.recurrencePattern?.id;
      this.recurrencePatternTypeId = patternedRecurrence?.recurrencePattern?.recurrencePatternTypeId;
    }
  }

  // needs to access from parent component
  public get hasError(): boolean {
    if (this.isNoSchedule || this.isDaily) {
      return false;
    }

    if (!this.selectedDays.length) {
      return true;
    }
    return false;
  }

  // needs to access from parent component
  public get errorMessage(): string {
    return this.hasError ? `${this.props.colDef.headerName} is Required` : '';
  }

  private get isDaily(): boolean {
    if (this.isNoSchedule) {
      return false;
    }
    return Utilities.isEqual(this.recurrencePatternTypeId, RECURRENCE_PATTERN_TYPE.DAILY);
  }

  private get isNoSchedule(): boolean {
    const { isNoSchedule, data } = this.props;
    const isCallable: boolean = typeof isNoSchedule === 'function';
    return isCallable
      ? isNoSchedule()
      : Utilities.isEqual(data.schedule?.scheduleType.id, SCHEDULE_TYPE.SINGLE_INSTANCE) ||
          Utilities.isEqual(data.schedule?.scheduleType.id, SCHEDULE_TYPE.CONTINUES);
  }

  @action
  public setValue(selectedDays: DayOfWeekModel[]): void {
    this.selectedDays = selectedDays;
  }

  public getValue(): DayOfWeekModel[] {
    return this.selectedDays;
  }

  private isExist(_dayOfWeekId: number): boolean {
    return this.selectedDays.some(({ dayOfWeekId }) => Utilities.isEqual(dayOfWeekId, _dayOfWeekId));
  }

  private mapDayOfWeek(dayOfWeekId: number): DayOfWeekModel {
    return new DayOfWeekModel({ dayOfWeekId, recurrencePatternId: this.recurrencePatternId || 0 });
  }

  @action
  private onDaySelection(day: SelectOption): void {
    const dayOfWeekId: number = Number(day.value);

    if (this.isDaily) {
      this.recurrencePatternTypeId = RECURRENCE_PATTERN_TYPE.WEEKLY;
      this.selectedDays = daysOfWeekOptions
        .filter(({ value }) => !Utilities.isEqual(value, dayOfWeekId))
        .map(({ value }) => this.mapDayOfWeek(Number(value)));
      this.parentOnChange(this.selectedDays);
      return;
    }

    const isExist: boolean = this.isExist(dayOfWeekId);
    if (isExist) {
      this.selectedDays = this.selectedDays.filter(day => !Utilities.isEqual(day.dayOfWeekId, dayOfWeekId));
      this.parentOnChange(this.selectedDays);
      return;
    }

    this.selectedDays.push(this.mapDayOfWeek(dayOfWeekId));
    this.parentOnChange(this.selectedDays);
  }

  public render(): ReactNode {
    const { classes, isRowEditing } = this.props;
    return (
      <div
        color="primary"
        ref={this.rootDivRef}
        className={classNames({
          [classes.buttonGroup]: true,
          [classes.disabled]: this.isDisable,
          [classes.editingMode]: isRowEditing,
        })}
      >
        {daysOfWeekOptions.map((day: SelectOption, index) => {
          const isExist = this.isDaily || this.isExist(Number(day.value));
          const buttonClass = classNames({ [classes.button]: true, [classes.buttonActive]: isExist });
          return (
            <ButtonBase
              key={day.name}
              focusRipple={true}
              className={buttonClass}
              disabled={this.isDisable}
              onClick={() => this.onDaySelection(day)}
            >
              {day.name.charAt(0)}
            </ButtonBase>
          );
        })}
      </div>
    );
  }
}

export default withStyles(styles)(AgGridWeekDaysWidget);
export { AgGridWeekDaysWidget as PureAgGridWeekDaysWidget };

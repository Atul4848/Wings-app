import { Typography, withStyles } from '@material-ui/core';
import { VIEW_MODE, BaseUpsertComponent } from '@wings/shared';
import { withRouter, Utilities, DATE_FORMAT, UIStore, IClasses, IOptionValue, GRID_ACTIONS } from '@wings-shared/core';
import {
  EventStore,
  EventModel,
  EventTypeStore,
  MessageLevelOptions,
  MessageLevelModel,
  MESSAGE_LEVEL,
  EventTypeModel,
} from '../../../Shared';
import { NavigateFunction } from 'react-router';
import { inject, observer } from 'mobx-react';
import { styles } from './OneTimeEvent.styles';
import { fields } from './Fields';
import React, { ReactNode } from 'react';
import { action, observable } from 'mobx';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import moment from 'moment';
import { forkJoin, Observable, of } from 'rxjs';
import classNames from 'classnames';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';

interface Props {
  classes?: IClasses;
  eventStore: EventStore;
  eventTypeStore: EventTypeStore;
  viewMode?: VIEW_MODE;
  params?: { id: number };
  navigate?: NavigateFunction;
}

@inject('eventStore', 'eventTypeStore')
@observer
class OneTimeEvent extends BaseUpsertComponent<Props, EventModel> {
  @observable contentLength: number = 0;
  @observable private eventModel: EventModel = new EventModel({ id: 0 });

  constructor(p: Props) {
    super(p, fields);
    this.viewMode = this.props.params?.id ? VIEW_MODE.EDIT : VIEW_MODE.NEW;
  }

  /* istanbul ignore next */
  componentDidMount() {
    const { eventTypeStore } = this.props;
    UIStore.setPageLoader(true);
    forkJoin([ this.loadEventById(), eventTypeStore.getEventTypes() ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ event ]) => {
        if (!this.eventId) {
          this.setFormValues(this.eventModel);
          return;
        }

        this.eventModel = new EventModel(event);
        this.setFormValues(this.eventModel);
        this.calculateContentLength();
      });
  }

  /* istanbul ignore next */
  private upsertEvent(): void {
    const event = new EventModel({
      ...this.eventModel,
      ...this.form.values(),
    });
    UIStore.setPageLoader(true);
    this.props.eventStore
      .upsertEvent(event)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => this.navigateToEvents(),
        error: error => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private loadEventById(): Observable<EventModel> {
    if (!this.eventId) {
      return of(this.eventModel);
    }
    return this.props.eventStore.loadEventById(this.eventId);
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    const { eventTypeStore } = this.props;
    return {
      title: 'Event',
      inputControls: [
        {
          fieldKey: 'eventType',
          type: EDITOR_TYPES.DROPDOWN,
          options: eventTypeStore.eventTypes?.filter(x => x.systemEnabled),
        },
        {
          fieldKey: 'level',
          type: EDITOR_TYPES.DROPDOWN,
          options: MessageLevelOptions.map(x => new MessageLevelModel({ id: x.label as MESSAGE_LEVEL, name: x.label })),
        },
        {
          fieldKey: 'triggerTime',
          type: EDITOR_TYPES.DATE_TIME,
          dateTimeFormat: DATE_FORMAT.GRID_DISPLAY,
          minDate: moment().format(DATE_FORMAT.GRID_DISPLAY),
          allowKeyboardInput: false,
        },
        {
          fieldKey: 'subject',
          type: EDITOR_TYPES.TEXT_FIELD,
          showExpandButton: false,
        },
        {
          fieldKey: 'content',
          type: EDITOR_TYPES.TEXT_FIELD,
          showExpandButton: false,
          isFullFlex: true,
          multiline: true,
          rows: 20,
        },
      ],
    };
  }

  private get eventId(): number {
    return Number(this.props.params?.id);
  }

  private navigateToEvents(): void {
    this.props.navigate && this.props.navigate('/notifications/events');
  }

  private onAction(action: GRID_ACTIONS): void {
    if (action === GRID_ACTIONS.CANCEL) {
      this.navigateToEvents();
      return;
    }
    this.upsertEvent();
  }

  @action
  protected onValueChange(value: IOptionValue | IOptionValue[], fieldKey: string): void {
    this.getField(fieldKey).set(value);
    this.calculateContentLength();
  }

  private calculateContentLength(): void {
    const content = this.getField('content').value;
    this.contentLength = content?.length || 0;
  }

  private get message(): ReactNode {
    const classes = this.props.classes as IClasses;
    const selectedEventType = this.getField('eventType').value as EventTypeModel;
    if (!selectedEventType) {
      return null;
    }
    const messages = classNames({
      [classes.warningText]: this.contentLength > 160 && this.contentLength <= 320,
      [classes.errorText]: this.contentLength > 320,
    });

    if (this.contentLength > 1600) {
      return (
        <Typography className={messages}>
          Sms sending will be failed as content limit exceeded (max:1600): {this.contentLength}
        </Typography>
      );
    }
    return (
      <Typography className={messages}>
        Total content length calculated for sending sms: {this.contentLength}
      </Typography>
    );
  }

  private get hasError(): boolean {
    return this.form.hasError || UIStore.pageLoading;
  }

  private get headerActions(): ReactNode {
    return (
      <EditSaveButtons
        disabled={this.hasError}
        hasEditPermission={true}
        isEditMode={this.isEditable}
        onAction={action => this.onAction(action)}
      />
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;

    return (
      <DetailsEditorWrapper headerActions={this.headerActions} isEditMode={this.isEditable}>
        <h2>{this.viewMode === VIEW_MODE.NEW ? 'Add One Time Event' : 'Edit One Time Event'}</h2>
        <div className={classes.flexRow}>
          <div className={classes.flexWrap}>
            {this.groupInputControls.inputControls.map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={this.getField(inputControl.fieldKey || '')}
                isEditable={this.isEditable}
                classes={{
                  flexRow: classNames({
                    [classes.inputControl]: true,
                    [classes.isFullFlex]: inputControl.isFullFlex,
                  }),
                }}
                onValueChange={(option: IOptionValue, _: string) =>
                  this.onValueChange(option, inputControl.fieldKey || '')
                }
              />
            ))}
          </div>
          <div> {this.message} </div>
        </div>
      </DetailsEditorWrapper>
    );
  }
}
export default withRouter(withStyles(styles)(OneTimeEvent));
export { OneTimeEvent as PureOneTimeEvent };

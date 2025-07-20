import { Typography, withStyles } from '@material-ui/core';
import { VIEW_MODE, BaseUpsertComponent, baseApiPath } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import {
  withRouter,
  Utilities,
  DATE_FORMAT,
  UIStore,
  IClasses,
  IOptionValue,
  ViewPermission,
  GRID_ACTIONS,
} from '@wings-shared/core';
import {
  EventStore,
  EventModel,
  EventTypeStore,
  FieldDefinitionModel,
  EventTypeModel,
  FIELD_TYPE,
  MessageLevelOptions,
  MessageLevelModel,
  MESSAGE_LEVEL,
  TemplateStore,
  DELIVERY_TYPE,
} from '../../../Shared';
import { NavigateFunction } from 'react-router';
import { inject, observer } from 'mobx-react';
import { styles } from './EventEditor.style';
import { fields } from './Fields';
import React, { ReactNode } from 'react';
import { action, observable } from 'mobx';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import EventAttributeInputControl from '../EventAttributeInputControl/EventAttributeInputControl';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import moment from 'moment';
import Handlebars from 'handlebars';
import classNames from 'classnames';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { apiUrls } from '../../../Shared/Stores/API.url';
import {
  DetailsEditorWrapper,
  EditSaveButtons,
  ConfirmDialog,
  Collapsable,
  CollapsibleWithButton,
} from '@wings-shared/layout';

interface Props {
  classes?: IClasses;
  eventStore: EventStore;
  eventTypeStore: EventTypeStore;
  templateStore: TemplateStore;
  viewMode?: VIEW_MODE;
  params?: { id: number; mode: VIEW_MODE };
  navigate?: NavigateFunction;
}

@inject('eventStore', 'eventTypeStore', 'templateStore')
@observer
class EventEditor extends BaseUpsertComponent<Props, EventModel> {
  @observable private eventModel: EventModel = new EventModel({ id: 0 });
  @observable private attributes: FieldDefinitionModel[] = [];
  @observable focusOutFields: string[] = [];
  @observable contentLength: number = 0;
  @observable private attributeInputControls: IGroupInputControls = { title: 'Attributes', inputControls: [] };

  constructor(p: Props) {
    super(p, fields);
    this.viewMode = this.props.params?.id ? VIEW_MODE.EDIT : VIEW_MODE.NEW;
  }

  /* istanbul ignore next */
  componentDidMount() {
    const { eventTypeStore, templateStore } = this.props;
    UIStore.setPageLoader(true);
    forkJoin([ this.loadEventById(), eventTypeStore.getEventTypes(), templateStore.getTemplates() ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ eventType ]) => {
        if (!this.eventId) {
          this.setFormValues(this.eventModel);
          return;
        }

        this.eventModel = new EventModel(eventType);
        this.setAttributesDefinitions(this.eventModel.attributeDefinition);
        this.setFormValues(this.eventModel);
        this.calculateSmsContentLength();
      });
  }

  private getType(type: FIELD_TYPE): EDITOR_TYPES {
    switch (type) {
      case FIELD_TYPE.DATE:
        return EDITOR_TYPES.DATE;
      case FIELD_TYPE.BOOL:
        return EDITOR_TYPES.CHECKBOX;
      case FIELD_TYPE.ZULU_TIME:
        return EDITOR_TYPES.TIME;
      default:
        return EDITOR_TYPES.TEXT_FIELD;
    }
  }

  /* istanbul ignore next */
  private loadEventById(): Observable<EventModel> {
    if (!this.eventId) {
      return of(this.eventModel);
    }
    return this.props.eventStore.loadEventById(this.eventId);
  }

  /* istanbul ignore next */
  private upsertEvent(): void {
    const event = this.getUpsertEventData();
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
  private getUpsertEventData(): EventModel {
    return new EventModel({
      ...this.eventModel,
      ...this.form.values(),
      attributeDefinition: [ ...this.attributes ],
    });
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    return {
      title: 'Event',
      inputControls: [
        {
          fieldKey: 'eventType',
          type: EDITOR_TYPES.DROPDOWN,
          options: this.filterEventTypes,
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
      ],
    };
  }

  private get filterEventTypes(): EventTypeModel[] {
    const { eventTypeStore, templateStore } = this.props;
    const { templates } = templateStore;
    const { eventTypes } = eventTypeStore;
    return eventTypes?.filter(
      x => x.systemEnabled && templates?.some(t => t.defaultTemplate && t.eventType.id === x.id)
    );
  }

  @action
  private setContentLength(contentLength: number = 0): void {
    this.contentLength = contentLength;
  }

  private calculateSmsContentLength(): void {
    const { templateStore } = this.props;
    const selectedEventType = this.getField('eventType').value as EventTypeModel;
    const template = templateStore.templates.find(
      x => x.eventType.id === selectedEventType?.id && x.defaultTemplate && x.deliveryType === DELIVERY_TYPE.SMS
    );
    if (template?.content) {
      let previewData = {};
      this.attributes?.map(x => {
        previewData = {
          ...previewData,
          [x.variableName]: x.value,
        };
      });
      const compiledTemplate = Handlebars.compile(template.content);
      this.setContentLength(compiledTemplate(previewData)?.length);
      return;
    }
    this.setContentLength();
  }

  @action
  protected onValueChange(value: IOptionValue | IOptionValue[], fieldKey: string): void {
    if (Utilities.isEqual(fieldKey, 'eventType')) {
      const eventType = value as EventTypeModel;
      if (this.getField('eventType').value?.label) {
        this.confirmReset(eventType);
        return;
      }
      this.setAttributesDefinitions(eventType?.fieldDefinitions);
    }

    this.getField(fieldKey).set(value);
    this.calculateSmsContentLength();
  }

  private get isEventTypeSelected(): boolean {
    return Boolean(this.getField('eventType').value?.label);
  }

  @action
  private setAttributesDefinitions(fieldDefinitions: FieldDefinitionModel[]): void {
    this.focusOutFields = [];
    this.attributes = [ ...fieldDefinitions ] || [];
    this.attributeInputControls = {
      inputControls:
        this.attributes?.map((x: FieldDefinitionModel) => ({
          fieldKey: x.variableName,
          type: this.getType(x.fieldType.name as FIELD_TYPE),
          label: `${x.displayName}${x.required ? '*' : ''}`,
          isFullFlex: true,
          allowKeyboardInput: false,
          is12HoursFormat: false,
        })) || [],
      title: '',
    };
  }

  private confirmReset(value: EventTypeModel): void {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Change"
        message={'This will reset the Model Properties. Do you want to proceed?'}
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          this.getField('jsonRequest').set('');
          this.getField('eventType').set(value);
          this.setAttributesDefinitions(value?.fieldDefinitions || []);
          this.calculateSmsContentLength();
        }}
      />
    );
  }

  private get eventId(): number {
    return Number(this.props.params?.id);
  }

  private get isIntegrationTab(): boolean {
    if (this.props.params?.mode) {
      return false;
    }
    return !this.props.params?.id;
  }

  private navigateToEvents(): void {
    this.props.navigate && this.props.navigate('/notifications/events');
  }

  private get hasSmsTemplate(): boolean {
    const { templateStore } = this.props;
    const selectedEventType = this.getField('eventType').value as EventTypeModel;
    return templateStore.templates.some(
      x => x.eventType.id === selectedEventType?.id && x.defaultTemplate && x.deliveryType === DELIVERY_TYPE.SMS
    );
  }

  private onAction(action: GRID_ACTIONS): void {
    if (action === GRID_ACTIONS.CANCEL) {
      this.navigateToEvents();
      return;
    }
    this.upsertEvent();
  }

  private get hasError(): boolean {
    return this.form.hasError || UIStore.pageLoading || this.attributes?.some(x => Boolean(x.errorMessage));
  }

  private generateJSONRequest(): void {
    const event: EventModel = this.getUpsertEventData();
    const json = {
      HttpVerb: 'POST',
      Url: `${baseApiPath.events}${apiUrls.event}`,
      Request: event.serialize(),
    };
    this.getField('jsonRequest').set(JSON.stringify(json, null, 2));
  }

  private copyJSONRequest(): void {
    navigator.clipboard.writeText(this.getField('jsonRequest').value);
    AlertStore.info('Copied.!!');
  }

  private get headerActions(): ReactNode {
    if (this.isIntegrationTab) {
      return (
        <PrimaryButton disabled={this.hasError} variant="contained" onClick={() => this.generateJSONRequest()}>
          Generate JSON
        </PrimaryButton>
      );
    }
    return (
      <EditSaveButtons
        disabled={this.hasError}
        hasEditPermission={true}
        isEditMode={this.isEditable}
        onAction={action => this.onAction(action)}
      />
    );
  }

  private get message(): ReactNode {
    const classes = this.props.classes as IClasses;
    if (!this.hasSmsTemplate) {
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
        Total characters calculated from sms based template (includes model properties value): {this.contentLength}
      </Typography>
    );
  }

  private get title(): string {
    if (this.isIntegrationTab) {
      return 'Integration';
    }
    return this.viewMode === VIEW_MODE.NEW ? 'Add Event' : 'Edit Event';
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;

    return (
      <DetailsEditorWrapper headerActions={this.headerActions} isEditMode={this.isEditable}>
        <h1>{this.title}</h1>
        <div className={classes.flexRow}>
          <div className={classes.flexWrap}>
            {this.groupInputControls.inputControls.map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={this.getField(inputControl.fieldKey || '')}
                isEditable={this.isEditable}
                onValueChange={(option: IOptionValue, _: string) =>
                  this.onValueChange(option, inputControl.fieldKey || '')
                }
              />
            ))}
          </div>
          <div>
            <ViewPermission hasPermission={Boolean(this.attributes?.length)}>
              <>
                <Collapsable titleVariant="h6" title="Model Properties">
                  <>
                    <EventAttributeInputControl
                      attributes={this.attributes}
                      focusOutFields={this.focusOutFields}
                      onFocus={(fieldKey: string) => (this.focusOutFields = [ ...this.focusOutFields, fieldKey ])}
                      groupInputControls={this.attributeInputControls}
                      onValueUpdate={(value: IOptionValue, fieldKey: string) => {
                        this.attributes = this.attributes?.map((x: FieldDefinitionModel) =>
                          x.variableName === fieldKey
                            ? new FieldDefinitionModel({ ...x, value: value as string | boolean })
                            : x
                        );
                        this.calculateSmsContentLength();
                      }}
                    />
                    <div> {this.message} </div>
                  </>
                </Collapsable>
              </>
            </ViewPermission>
          </div>
          <ViewPermission hasPermission={this.isIntegrationTab && this.isEventTypeSelected}>
            <div>
              <CollapsibleWithButton
                title="JSON Request"
                titleVariant="h6"
                buttonText="Copy Json"
                hasPermission={Boolean(this.getField('jsonRequest').value)}
                onButtonClick={() => this.copyJSONRequest()}
              >
                <ViewInputControl
                  key="jsonRequest"
                  field={{ label: '', value: this.getField('jsonRequest').value, bind: () => null }}
                  isDisabled={true}
                  isEditable={true}
                  type={EDITOR_TYPES.TEXT_FIELD}
                  showExpandButton={false}
                  multiline={true}
                  rows={20}
                />
              </CollapsibleWithButton>
            </div>
          </ViewPermission>
        </div>
      </DetailsEditorWrapper>
    );
  }
}
export default withRouter(withStyles(styles)(EventEditor));
export { EventEditor as PureEventEditor };

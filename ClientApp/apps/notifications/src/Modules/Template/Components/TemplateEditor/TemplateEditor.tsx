import { withStyles } from '@material-ui/core';
import { VIEW_MODE, BaseUpsertComponent } from '@wings/shared';
import {
  withRouter,
  regex,
  Utilities,
  UIStore,
  IOptionValue,
  ISelectOption,
  IClasses,
  GRID_ACTIONS,
} from '@wings-shared/core';
import classNames from 'classnames';
import {
  ChannelModel,
  ChannelStore,
  DeliveryTypeOptions,
  DELIVERY_TYPE,
  EventTypeModel,
  EventTypeStore,
  TemplateModel,
  TemplateStore,
} from '../../../Shared';
import { NavigateFunction } from 'react-router';
import { inject, observer } from 'mobx-react';
import { styles } from './TemplateEditor.style';
import { fields } from './Fields';
import React, { ReactNode } from 'react';
import { action, observable } from 'mobx';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import HandlerbarFields from '../HandlebarFields/HandlebarFields';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';

interface Props {
  classes?: IClasses;
  channelStore: ChannelStore;
  eventTypeStore: EventTypeStore;
  templateStore: TemplateStore;
  viewMode?: VIEW_MODE;
  params?: { mode: VIEW_MODE; id: number };
  navigate?: NavigateFunction;
}

@inject('channelStore', 'eventTypeStore', 'templateStore')
@observer
class TemplateEditor extends BaseUpsertComponent<Props, TemplateModel> {
  @observable private templateModel: TemplateModel = new TemplateModel({ id: 0, defaultTemplate: false });
  @observable private channelModel: ChannelModel[] = [];
  @observable private filteredChannelModel: ChannelModel[] = [];
  @observable private isSendgridTemplateIdRequired: boolean = false;
  @observable private handlebarFields: string[] = [];
  private tooltipText: string = 'This field supports handlebar variables for example: {{variable}}.';

  constructor(p: Props) {
    super(p, fields);
    const mode: string = this.props.params?.mode?.toUpperCase() || '';
    this.viewMode = VIEW_MODE[mode] || VIEW_MODE.NEW;
  }

  /* istanbul ignore next */
  componentDidMount() {
    const { eventTypeStore, channelStore, templateStore } = this.props;
    UIStore.setPageLoader(true);
    forkJoin([
      this.loadTemplateById(),
      eventTypeStore.getEventTypes(),
      channelStore.getChannels(),
      templateStore.getTemplates(),
    ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        this.channelModel = response[2];
        this.filteredChannelModel = this.channelModel.filter(
          ch => ch.systemEnabled && ch.type.name === response[0].deliveryType
        );
        if (!this.templateId) {
          this.setFormValues(this.templateModel);
          return;
        }
        this.templateModel = new TemplateModel(response[0]);
        this.handlebarFields = this.templateModel.eventType?.fieldDefinitions?.map(x => x.variableName) || [];
        this.setFormValues(this.templateModel);
        this.toggleValidationsByChannelEmail();
      });
  }

  /* istanbul ignore next */
  private loadTemplateById(): Observable<TemplateModel> {
    if (!this.templateId) {
      return of(this.templateModel);
    }
    return this.props.templateStore.loadTemplateById(this.templateId);
  }

  /* istanbul ignore next */
  private upsertTemplate(): void {
    UIStore.setPageLoader(true);
    this.props.templateStore
      .upsertTemplate(this.getUpsertTemplate())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => this.navigateToTemplates(),
        error: error => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    const { eventTypeStore } = this.props;
    return {
      title: 'Template',
      inputControls: [
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
          isExists: this.isExists,
        },
        {
          fieldKey: 'deliveryType',
          type: EDITOR_TYPES.DROPDOWN,
          options: DeliveryTypeOptions.filter(x => x.value !== 'ALL'),
          isDisabled: this.templateModel.id ? true : false,
        },
        {
          fieldKey: 'channel',
          type: EDITOR_TYPES.DROPDOWN,
          options: this.filteredChannelModel,
        },
        {
          fieldKey: 'eventType',
          type: EDITOR_TYPES.DROPDOWN,
          options: eventTypeStore.eventTypes.filter(et => et.systemEnabled),
        },
        {
          fieldKey: 'description',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'defaultTemplate',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'subject',
          type: EDITOR_TYPES.TEXT_FIELD,
          isHidden: !this.isChannelTypeEmail,
          showExpandButton: false,
          isInputCustomLabel: true,
          tooltipText: this.tooltipText,
          customErrorMessage: this.isSubjectValid,
        },
        {
          fieldKey: 'useSendGrid',
          type: EDITOR_TYPES.CHECKBOX,
          isHidden: !this.isChannelTypeEmail,
        },
        {
          fieldKey: 'sendGridTemplateId',
          type: EDITOR_TYPES.TEXT_FIELD,
          isHidden: !this.hasSendGridTemplateId,
          customErrorMessage: this.isSendgridTemplateIdValid,
        },
        {
          fieldKey: 'content',
          type: EDITOR_TYPES.TEXT_FIELD,
          isInputCustomLabel: true,
          isHidden: this.isChannelTypeEmail || this.hasSendGridTemplateId,
          showExpandButton: false,
          multiline: true,
          rows: 20,
          tooltipText: this.tooltipText,
          customErrorMessage: this.isContentValid,
        },
        {
          fieldKey: 'emailContent',
          type: EDITOR_TYPES.RICH_TEXT_EDITOR,
          isInputCustomLabel: true,
          isHidden: !this.isChannelTypeEmail || this.hasSendGridTemplateId,
          showExpandButton: false,
          isExpanded: true,
          tooltipText: this.tooltipText,
          customErrorMessage: this.isEmailContentValid,
        },
        {
          fieldKey: 'handlebarFields',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    };
  }

  private get hasSendGridTemplateId(): boolean {
    return this.getField('useSendGrid').value;
  }

  private get isSendgridTemplateIdValid(): string {
    const sendgridTemplate: string = this.getField('sendGridTemplateId').value;
    return regex.sendgridTemplateId.test(sendgridTemplate) ? '' : 'The Sendgrid Template Id has invalid format.';
  }

  private get isSubjectValid(): string {
    const subject: string = this.getField('subject').value;
    if (!this.isDefaultSelected) return '';

    return regex.alphabetWithOptionalHandlebars.test(subject)
      ? ''
      : 'The Subject* field has invalid handlebars format.';
  }

  private get isEmailContentValid(): string {
    const emailContent: string = this.getField('emailContent').value;
    if (!this.isDefaultSelected || (this.isDefaultSelected && this.hasSendGridTemplateId)) return '';

    return regex.alphabetWithOptionalHandlebars.test(emailContent?.replace(regex.stripedHTML, ''))
      ? ''
      : 'The Content* field has invalid handlebars format.';
  }

  private get isContentValid(): string {
    const content: string = this.getField('content').value;
    if (!this.isDefaultSelected || (this.isDefaultSelected && this.hasSendGridTemplateId)) return '';

    return regex.alphabetWithOptionalHandlebars.test(content?.replace(regex.stripedHTML, ''))
      ? ''
      : 'The Content* field has invalid handlebars format.';
  }

  @action
  protected onValueChange(value: IOptionValue | IOptionValue[], fieldKey: string): void {
    if (Utilities.isEqual(fieldKey, 'useSendGrid')) {
      this.setFormRules('sendGridTemplateId', Boolean(value), 'SendGrid Template Id');
      this.getField('sendGridTemplateId').set(null);
      this.isSendgridTemplateIdRequired = Boolean(value);
    }

    if (Utilities.isEqual(fieldKey, 'sendGridTemplateId')) {
      this.isSendgridTemplateIdRequired = this.getField('useSendGrid').value;
    }

    if (Utilities.isEqual(fieldKey, 'deliveryType')) {
      this.getField('useSendGrid').set(null);
      this.getField('channel').set(null);
      this.filteredChannelModel = this.channelModel.filter(
        ch => ch.systemEnabled && Utilities.isEqual(ch.type.name, (value as ISelectOption)?.value)
      );
    }

    if (Utilities.isEqual(fieldKey, 'emailContent') || Utilities.isEqual(fieldKey, 'content')) {
      const stripedText = (value as string).replace(regex.stripedHTML, '');
      const contentText = Boolean(stripedText) ? value : '';
      this.getField('emailContent').set(contentText);
      this.getField('content').set(contentText);
      return;
    }
    this.getField(fieldKey).set(value);
    this.toggleValidationsByChannelEmail();

    if (Utilities.isEqual(fieldKey, 'channel')) {
      const value = this.getField(this.isChannelTypeEmail ? 'content' : 'emailContent').value;
      if (value) {
        this.getField(this.isChannelTypeEmail ? 'emailContent' : 'content').set(value);
      }
    }

    if (Utilities.isEqual(fieldKey, 'eventType')) {
      const eventType = this.getField('eventType').value as EventTypeModel;
      this.handlebarFields = eventType?.fieldDefinitions.map(x => x.variableName) || [];
    }
  }

  private get isDefaultSelected(): boolean {
    return Boolean(this.getField('defaultTemplate').value);
  }

  private toggleValidationsByChannelEmail() {
    this.setFormRules('emailContent', this.isChannelTypeEmail && !this.hasSendGridTemplateId, 'Content');
    this.setFormRules('content', !this.isChannelTypeEmail && !this.hasSendGridTemplateId, 'Content');
    this.setFormRules('subject', this.isChannelTypeEmail, 'Subject');
    this.form.validate();
  }

  private onAction(action: GRID_ACTIONS): void {
    if (action === GRID_ACTIONS.CANCEL) {
      this.navigateToTemplates();
      return;
    }
    this.upsertTemplate();
  }

  private navigateToTemplates(): void {
    this.props.navigate && this.props.navigate('/notifications/templates');
  }

  private getUpsertTemplate(): TemplateModel {
    const formValues: TemplateModel = this.form.values();
    const template = new TemplateModel({ ...this.templateModel, ...formValues });
    template.content = this.isChannelTypeEmail ? template.emailContent : template.content;
    return template;
  }

  private get templateId(): number {
    return Number(this.props.params?.id);
  }

  private get isExists(): boolean {
    const name = this.getField('name').value;
    return this.props.templateStore.templates.some(
      t => Utilities.isEqual(t.name, name) && !Utilities.isEqual(t.id, this.templateId)
    );
  }

  private get isChannelTypeEmail(): boolean {
    return this.getField('channel').value?.type?.id.toUpperCase() === DELIVERY_TYPE.EMAIL.toUpperCase();
  }

  private get headerActions(): ReactNode {
    return (
      <EditSaveButtons
        disabled={
          this.form.hasError ||
          UIStore.pageLoading ||
          this.isExists ||
          this.isSubjectValid ||
          this.isEmailContentValid ||
          this.isContentValid ||
          (this.isSendgridTemplateIdValid && this.isSendgridTemplateIdRequired)
        }
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
        <h2>{this.viewMode === VIEW_MODE.NEW ? 'Add Template' : 'Edit Template'}</h2>
        <div className={classes.flexRow}>
          <div className={classes.flexWrap}>
            {this.groupInputControls.inputControls
              .filter(inputControl => !inputControl.isHidden)
              .map((inputControl: IViewInputControl, index: number) => {
                if (inputControl.fieldKey === 'handlebarFields') {
                  return <HandlerbarFields fields={this.handlebarFields} />;
                }
                return (
                  <ViewInputControl
                    {...inputControl}
                    key={index}
                    field={this.getField(inputControl.fieldKey || '')}
                    isEditable={this.isEditable}
                    isExists={inputControl.isExists}
                    classes={{
                      flexRow: classNames({
                        [classes.inputControl]: inputControl.type !== EDITOR_TYPES.RICH_TEXT_EDITOR,
                        [classes.inputControlContent]:
                          inputControl.fieldKey === 'content' || inputControl.fieldKey === 'emailContent',
                      }),
                      expandEditor: classes.expandEditor,
                    }}
                    onValueChange={(option, fieldKey) => this.onValueChange(option, inputControl.fieldKey || '')}
                  />
                );
              })}
          </div>
        </div>
      </DetailsEditorWrapper>
    );
  }
}

export default withRouter(withStyles(styles)(TemplateEditor));
export { TemplateEditor as PureTemplateEditor };

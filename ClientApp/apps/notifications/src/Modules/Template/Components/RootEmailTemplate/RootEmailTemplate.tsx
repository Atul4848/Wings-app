import React, { ReactNode, ChangeEvent } from 'react';
import {
  BaseUpsertComponent,
  VIEW_MODE,
} from '@wings/shared';
import { IClasses, UIStore, regex, withRouter, GRID_ACTIONS } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { withStyles, TextField } from '@material-ui/core';
import { action, observable } from 'mobx';
import { finalize } from 'rxjs/operators';
import { styles } from './RootEmailTemplate.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IAPIRootTemplate, RootTemplateModel, TemplateStore, TEMPLATE_TYPE } from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { NavigateFunction } from 'react-router';
import { Dialog } from '@uvgo-shared/dialog';
import SendTemplatePreview from '../SendTemplatePreview/SendTemplatePreview';
import Handlebars from 'handlebars';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';

type Props = {
  classes?: IClasses;
  templateStore?: TemplateStore;
  viewMode?: VIEW_MODE;
  params?: { mode: VIEW_MODE };
  navigate?: NavigateFunction;
};

@inject('templateStore')
@observer
class RootEmailTemplate extends BaseUpsertComponent<Props, RootTemplateModel> {
  @observable private emailRootTemplate: RootTemplateModel = new RootTemplateModel({ id: 0 });
  @observable private inputValue: string = '';

  constructor(props: Props) {
    super(props, {});
    this.setViewMode(this.props.params?.mode as VIEW_MODE);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  /* istanbul ignore next */
  @action
  private loadInitialData(): void {
    UIStore.setPageLoader(true);
    this.props.templateStore
      ?.getRootTemplate(TEMPLATE_TYPE.EMAIL_ROOT)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: RootTemplateModel) => {
        this.emailRootTemplate = new RootTemplateModel(data);
        this.inputValue = this.emailRootTemplate?.content;
      });
  }

  /* istanbul ignore next */
  @action
  private updateRootTemplate(): void {
    const request: IAPIRootTemplate = {
      RootTemplateId: 1,
      Subject: this.emailRootTemplate.subject,
      Content: this.inputValue,
      TemplateType: TEMPLATE_TYPE.EMAIL_ROOT,
    };
    const { templateStore } = this.props;
    UIStore.setPageLoader(true);
    templateStore?.updateRootTemplate(request)
      .pipe(
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        }),
      )
      .subscribe(
        () => AlertStore.info('Root Template updated successfully!'),
        (error: AxiosError) => AlertStore.critical(error.message));
  }

  /* istanbul ignore next */
  @action
  protected onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { value } = event.target;
    this.inputValue = value;
  }

  private onAction(action: GRID_ACTIONS): void {
    if (action === GRID_ACTIONS.CANCEL) {
      this.navigateToTemplates();
      return;
    }
    this.updateRootTemplate();
  }

  private navigateToTemplates(): void {
    this.props.navigate && this.props.navigate('/notifications/templates');
  }

  private get headerActions(): ReactNode {
    return (
      <EditSaveButtons
        disabled={UIStore.pageLoading || !Boolean(this.inputValue?.trim())}
        hasEditPermission={true}
        isEditMode={this.isEditable}
        onAction={action => this.onAction(action)}
      />
    );
  }

  private openSendTestEmailDialog(): void {
    const templateStore  = this.props?.templateStore as TemplateStore;
    const previewResult = this.getPreviewResult();
    ModalStore.open(
      <SendTemplatePreview
        templateStore={templateStore}
        templateSubject='Test - Root Email Preview'
        templateDeliveryType='EMAIL'
        templateContent={previewResult}
        isRootTemplate={true} />
    );
  }

  private getPreviewResult(): string {
    const matches = this.inputValue.match(regex.extractTextBetweenHandlebar);
    if (Boolean(matches?.length) && matches?.includes('content')) {
      const previewData = { 'content': 'Hi there, this is a test email to preview root email template.' };
      const compiledTemplate = Handlebars.compile(this.inputValue);
      return compiledTemplate(previewData);
    }
    return this.inputValue;
  }

  private openPreviewDialog(): void {
    const classes = this.props.classes as IClasses;
    const previewResult = this.getPreviewResult();
    ModalStore.open(
      <Dialog
        title="Root Email Preview"
        open={true}
        classes={{ paperSize: classes.paperSize }}
        onClose={() => ModalStore.close()}
        dialogContent={() => (
          <div className={classes.root} dangerouslySetInnerHTML={{ __html: previewResult }} />
        )}
      />
    );
  }

  render(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <DetailsEditorWrapper headerActions={this.headerActions} isEditMode={this.isEditable}>
        <h2>Edit Email Root Template</h2>
        <div className={classes.flexRow}>
          <div className={classes.flexWrap}>
            <TextField
              multiline
              rows={20}
              onChange={event => this.onChange(event)}
              value={this.inputValue}
            />
            <div className={classes.btnContainer}>
              <PrimaryButton
                variant='contained'
                color='primary'
                disabled={!Boolean(this.inputValue?.trim())}
                onClick={() => this.openSendTestEmailDialog()}
              >
                Send Test Email
              </PrimaryButton>
              <PrimaryButton
                variant='contained'
                color='primary'
                disabled={!Boolean(this.inputValue?.trim())}
                onClick={() => this.openPreviewDialog()}
              >
                Preview
              </PrimaryButton>
            </div>
          </div>
        </div>
      </DetailsEditorWrapper>
    );
  }
}

export default withRouter(withStyles(styles)(RootEmailTemplate));
export { RootEmailTemplate as PureRootEmailTemplate };
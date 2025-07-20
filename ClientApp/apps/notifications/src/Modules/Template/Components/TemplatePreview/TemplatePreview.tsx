import { TextareaAutosize, withStyles, Button, Typography } from '@material-ui/core';
import { withRouter, regex, Utilities, UIStore, IClasses, UnsubscribableComponent } from '@wings-shared/core';
import { NavigateFunction } from 'react-router';
import React, { ReactNode } from 'react';
import { styles } from './TemplatePreview.styles';
import { inject, observer } from 'mobx-react';
import { DELIVERY_TYPE, TemplateModel, TemplateStore } from '../../../Shared';
import { action, observable } from 'mobx';
import { finalize, takeUntil } from 'rxjs/operators';
import Handlebars from 'handlebars';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { SecondaryButton } from '@uvgo-shared/buttons';
import { ArrowBack } from '@material-ui/icons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import SendTemplatePreview from '../SendTemplatePreview/SendTemplatePreview';
import { RichTextEditor } from '@wings-shared/form-controls';
import { ConfirmNavigate, CustomLinkButton } from '@wings-shared/layout';

interface Props {
  classes?: IClasses;
  templateStore: TemplateStore;
  params?: { id: number };
  navigate?: NavigateFunction;
}

@inject('templateStore')
@observer
class TemplatePreview extends UnsubscribableComponent<Props> {
  @observable private templateModel: TemplateModel = new TemplateModel({ id: 0, defaultTemplate: false });
  @observable private previewResult: string = '';
  @observable private displayAsJson: string = '';
  @observable private previewSubject: string = '';
  @observable private isTestDataChanged: boolean = false;

  componentDidMount() {
    this.loadTemplateById();
  }

  /* istanbul ignore next */
  private loadTemplateById(): void {
    const { params, templateStore } = this.props as Required<Props>;
    UIStore.setPageLoader(true);
    templateStore
      .loadTemplateById(params.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        (response: TemplateModel) => {
          if (response) {
            this.templateModel = new TemplateModel(response);
            this.displayAsJson = this.templateModel.testData;
            this.previewResult = this.templateModel.content;
            this.previewSubject = this.templateModel.subject;
            this.onTestDataChange(this.displayAsJson);
            this.isTestDataChanged = false;
          }
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  @action
  private updateTemplate(): void {
    this.isTestDataChanged = false;
    UIStore.setPageLoader(true);
    this.templateModel = new TemplateModel({ ...this.templateModel, testData: this.displayAsJson });
    this.props.templateStore
      .upsertTemplate(this.templateModel)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        error: error => {
          this.isTestDataChanged = false;
          AlertStore.critical(error.message);
        },
      });
  }

  @action
  private onTestDataChange(value: string): void {
    this.isTestDataChanged = true;
    this.displayAsJson = value;
    const parsedJson = this.parseJSON(value);
    const isEmptyOrInvalid: boolean = !Boolean(parsedJson) || !Boolean(Object.keys(parsedJson).length);
    if (isEmptyOrInvalid) {
      this.previewResult = this.templateModel.content;
      this.previewSubject = this.templateModel.subject;
      return;
    }
    const compiledTemplate = Handlebars.compile(this.templateModel.content);
    this.previewResult = compiledTemplate(parsedJson);
    if (this.templateModel.subject) {
      const compiledSubject = Handlebars.compile(this.templateModel.subject);
      this.previewSubject = compiledSubject(parsedJson);
    }
  }

  @action
  private generateTestData(): void {
    const matches = this.templateModel.content.match(regex.extractTextBetweenHandlebar) as RegExpMatchArray;
    if (Boolean(matches?.length)) {
      let previewData = {};
      for (let index = 0; index < matches.length; index++) {
        const key = matches[index];
        previewData = {
          ...previewData,
          [key]: `value-${index + 1}`,
        };
      }

      const subjectMatches = this.templateModel.subject?.match(regex.extractTextBetweenHandlebar) as RegExpMatchArray;
      if (Boolean(subjectMatches?.length)) {
        const titleKey = subjectMatches[0];
        previewData = {
          ...previewData,
          [titleKey]: 'Dummy Subject',
        };
      }

      this.displayAsJson = JSON.stringify(previewData, null, 2);
      this.onTestDataChange(this.displayAsJson);
    } else {
      this.displayAsJson = '{}';
      this.isTestDataChanged = true;
    }
  }

  private parseJSON(value: string): object | null {
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  /* istanbul ignore next */
  private openSendTestTemplateDialog(): void {
    ModalStore.open(
      <SendTemplatePreview
        templateStore={this.props.templateStore}
        templateDeliveryType={this.templateModel.deliveryType}
        templateContent={this.previewResult}
        templateSubject={this.previewSubject}
        isRootTemplate={false}
      />
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <ConfirmNavigate isBlocker={this.isTestDataChanged}>
        <div>
          <span>
            <CustomLinkButton to="/notifications/templates" title="Templates" startIcon={<ArrowBack />} />
            <h2>
              Preview {this.templateModel.deliveryTypeName} Template - {this.templateModel.name}
            </h2>
          </span>
          <div className={classes.mainContainer}>
            <div className={classes.boxSection}>
              <div className={classes.boxSectionTitle}>
                <div className={classes.testDataSection}>
                  <Typography component="h3" className={classes.heading}>
                    Test Data
                  </Typography>
                </div>
                <div className={classes.btnContainer}>
                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={() => this.generateTestData()}
                    className={classes.testDataBtn}
                    disabled={Boolean(this.displayAsJson)}
                  >
                    Generate Test Data
                  </Button>
                  <SecondaryButton
                    color="secondary"
                    variant="contained"
                    size="small"
                    className={classes.btnAlign}
                    disabled={!Boolean(this.displayAsJson) || !Utilities.isValidJsonString(this.displayAsJson)}
                    onClick={() => this.updateTemplate()}
                  >
                    Save
                  </SecondaryButton>
                </div>
              </div>
              <TextareaAutosize
                value={this.displayAsJson}
                className={classes.textBox}
                style={{ height: 'calc(100vh - 245px)', overflow: 'auto' }}
                onChange={e => this.onTestDataChange(e.target.value)}
              />
            </div>

            <div className={classes.boxSection}>
              <div className={classes.testDataSection}>
                <Typography component="h3" className={classes.previewSubject}>
                  {this.templateModel.deliveryType === DELIVERY_TYPE.EMAIL
                    && <div>Subject: {this.previewSubject}</div>
                  }
                </Typography>
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={() => this.openSendTestTemplateDialog()}
                  className={classes.testDataBtn}
                  disabled={!Boolean(this.displayAsJson) || !Utilities.isValidJsonString(this.displayAsJson)}
                >
                  Send Test {this.templateModel.deliveryType}
                </Button>
              </div>
              <RichTextEditor
                classes={{ reactQuill: classes.previewEditor }}
                showExpandButton={false}
                isEditable={false}
                field={{ value: this.previewResult, bind: () => null }}
                onFocus={() => null}
              />
            </div>
          </div>
        </div>
      </ConfirmNavigate>
    );
  }
}

export default withRouter(withStyles(styles)(TemplatePreview));
export { TemplatePreview as PureTemplatePreview };

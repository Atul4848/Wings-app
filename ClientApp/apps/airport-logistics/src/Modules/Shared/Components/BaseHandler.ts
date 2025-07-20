import { ApprovalStatus, IBaseFormSetup } from '../Interfaces';
import { action, observable } from 'mobx';
import { MobxReactForm, Field } from 'mobx-react-form';
import { StatusModel, SurveyReviewStatusModel } from '../Models';
import { getFormValidation, UnsubscribableComponent } from '@wings-shared/core';

interface WithInstance<T> {
 new(data: Partial<T>): T;
}

export class BaseHandler<Props, Model extends StatusModel> extends UnsubscribableComponent<Props> {
  @observable protected unApproved: Model;
  @observable form: MobxReactForm;
  private readonly fields: string[] = [];

  constructor(props: Props, setup: IBaseFormSetup) {
    super(props);
    this.form = getFormValidation(setup.form, setup.formOptions);
    this.fields = setup.form.fields;
  }

  protected _formValues(key: string): object {
    const values = this.form.values();
    return values ? values[key] : {};
  }

  @action
  protected _updateUnApproved(model: WithInstance<Model>, status: SurveyReviewStatusModel): void {
    this.unApproved.updateStatus(status);
    this.unApproved = new model({ ...this.unApproved, [status.key]: this._formValues(status.key) });
  }

  protected _resetApprovedStatus(statuses: ApprovalStatus): void {
    Object.values(statuses).forEach(status => {
      status.isApproved = false;
      status.isIgnored = false;
    });
  }

  // initWithSubFields for case if you need to initiate a form and convert array value to subfields
  // use initModel if you need to initiate with different model
  // use case: in the form you need to have some values as array and other arrays values as subfields
  @action
  protected _setDefaultValues(data: Model, opt?: { initWithSubFields: boolean, initModel?: Partial<Model>}): void {
    // need to reset the selected statuses.
    this._resetApprovedStatus(data.status);
    this.unApproved = data;

    if(opt?.initWithSubFields) {
      this.form.init(opt.initModel || data);
      return;
    }

    this.form.init(this.fields);
    this.form.set(data);
  }

  protected _getField(key: string): Field {
    return this.form.$(key);
  }
}

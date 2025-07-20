import { action, observable } from 'mobx';
import MobxReactForm, { Field } from 'mobx-react-form';
import { VIEW_MODE } from '../../Enums';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore, ALERT_TYPES, IAlert } from '@uvgo-shared/alert';
import {
  DATE_FORMAT,
  IAPIGridRequest,
  IAPISearchFilter,
  IAPISearchFiltersDictionary,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  Utilities,
  Loader,
  getFormValidation,
  UnsubscribableComponent,
} from '@wings-shared/core';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { EDITOR_TYPES, IViewInputControl } from '@wings-shared/form-controls';

interface BaseProps {
  viewMode?: VIEW_MODE;
}

class BaseUpsertComponent<Props extends BaseProps, TModel> extends UnsubscribableComponent<Props> {
  protected loader: Loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
  @observable protected viewMode: VIEW_MODE;
  @observable protected form: MobxReactForm;
  @observable protected isLoading: boolean = false;
  @observable protected activeStep: number = 0;
  @observable protected activeTab: string;
  @observable protected expandMode: boolean = false;
  @observable protected expandModeField: IViewInputControl = {};
  @observable protected isRichEditorFocused: boolean = false;
  @observable protected searchFilters: IAPISearchFiltersDictionary;

  constructor(p: Props, fields: Field, searchFilters?: IAPISearchFiltersDictionary) {
    super(p);
    this.form = getFormValidation(fields);
    this.viewMode = p.viewMode;
    this.searchFilters = searchFilters;
  }

  protected get noBlocker() {
    return { state: { noBlocker: !this.form.changed } };
  }

  protected get isEditable(): boolean {
    return Utilities.isEqual(this.viewMode, VIEW_MODE.EDIT) || Utilities.isEqual(this.viewMode, VIEW_MODE.NEW);
  }

  protected get isEditing(): boolean {
    return Utilities.isEqual(this.viewMode, VIEW_MODE.EDIT);
  }

  protected get isDetailView(): boolean {
    return Utilities.isEqual(this.viewMode, VIEW_MODE.DETAILS);
  }

  protected get isAddNew(): boolean {
    return Utilities.isEqual(this.viewMode, VIEW_MODE.NEW);
  }

  // Check if any field had duplicate and it's not allowed
  protected get hasDuplicateValue(): boolean {
    return [ ...this.isAlreadyExistMap.keys() ].some(key => Boolean(this.isAlreadyExistMap.get(key)));
  }

  /* istanbul ignore next */
  protected get auditFields(): IViewInputControl[] {
    return [
      {
        fieldKey: 'createdBy',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'createdOn',
        type: EDITOR_TYPES.DATE_TIME,
        dateTimeFormat: DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN,
      },
      {
        fieldKey: 'modifiedBy',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'modifiedOn',
        type: EDITOR_TYPES.DATE_TIME,
        dateTimeFormat: DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN,
      },
    ];
  }

  @action
  protected setViewMode(viewMode: VIEW_MODE): void {
    this.viewMode = viewMode;
  }

  @action
  protected setRichEditorFocused(focused: boolean): void {
    this.isRichEditorFocused = focused;
  }

  protected setFormValues(model: TModel): void {
    this.form.set(model);
  }

  protected getField(key: string): Field {
    return this.form.$(key);
  }

  protected getFieldLabel(key: string): Field {
    return this.getField(key).label?.replace('*', '');
  }

  // Used to get custom validation error i.e any custom rules applied using validation function
  protected getCutomValidationError(key: string): string {
    const field = this.getField(key);
    return field.hasError ? field.validationErrorStack[0] : '';
  }

  @action
  protected setActiveTab(activeTab: string): void {
    this.activeTab = activeTab;
  }

  // clear form fields with provided fieldKeys
  protected clearFormFields(fieldKeys: string[]): void {
    fieldKeys.forEach(fieldKey => this.getField(fieldKey).clear());
  }

  @action
  protected setIsLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);
  }

  @action
  protected onCancel(model: TModel): void {
    if (this.viewMode === VIEW_MODE.NEW || this.props.viewMode === VIEW_MODE.EDIT) {
      ModalStore.close();
      return;
    }
    this.viewMode = VIEW_MODE.DETAILS;
    this.setFormValues(model);
  }

  protected setFormRules(fieldKey: string, required: boolean, label?: string): void {
    const field: Field = this.getField(fieldKey);
    const rules: string[] = field.rules?.split('|').filter(rule => rule) || [];
    const fieldLabel: string = label || this.getFieldLabel(fieldKey);

    let newRules = [];
    if (required) {
      newRules = rules.includes('required') ? rules : [ 'required', ...rules ];
    } else {
      newRules = rules.filter((rule: string) => rule !== 'required');
    }

    field.set('rules', newRules.join('|'));
    field.set('label', `${fieldLabel}`);
  }

  protected resetExpandedMode(): void {
    this.expandMode = false;
  }

  protected setExpandedMode(label: string, fieldKey: string, type: EDITOR_TYPES): void {
    this.expandMode = !this.expandMode;
    this.expandModeField = {
      fieldKey: fieldKey,
      type: type,
      multiline: true,
      rows: 40,
      label: label,
      isExpanded: true,
      isInputCustomLabel: true,
    };
  }

  protected showAlert(message: string, id: string): void {
    const alert: IAlert = {
      id,
      message,
      type: ALERT_TYPES.IMPORTANT,
      hideAfter: 5000,
    };
    AlertStore.removeAlert(id);
    AlertStore.showAlert(alert);
  }

  // See demo in UpsertSchedule Restrictions component
  protected getSearchRequest(
    searchValue: string,
    entityType: SEARCH_ENTITY_TYPE,
    filterCollection?: IAPISearchFilter[]
  ): IAPIGridRequest {
    if (!this.searchFilters) {
      return { pageSize: 50 };
    }

    const searchCollection: IAPISearchFilter[] = this.searchFilters[entityType]?.searchFilters.map(filter => {
      return {
        ...filter,
        propertyValue: searchValue,
      };
    });
    return {
      specifiedFields: this.searchFilters[entityType]?.specifiedFields,
      searchCollection: JSON.stringify(searchCollection),
      filterCollection: JSON.stringify(filterCollection || []),
      pageSize: 50,
    };
  }

  // Get filters with specific fields
  protected getFilterRequest(entityType: SEARCH_ENTITY_TYPE, filterCollection?: IAPISearchFilter[]): IAPIGridRequest {
    if (!this.searchFilters) {
      return { pageSize: 50 };
    }
    return {
      specifiedFields: this.searchFilters[entityType]?.specifiedFields,
      filterCollection: JSON.stringify(filterCollection || []),
      pageSize: 0,
    };
  }

  /**
   * @param searchObservable // Search Observable of Type T
   */
  protected observeSearch<T>(searchObservable: Observable<T>): void {
    this.loader.setLoadingState(true);
    searchObservable
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loader.setLoadingState(false))
      )
      .subscribe();
  }
}

export default BaseUpsertComponent;

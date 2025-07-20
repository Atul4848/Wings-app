import { withStyles } from '@material-ui/core';
import { VIEW_MODE, BaseUpsertComponent } from '@wings/shared';
import { regex, withRouter, Utilities, UIStore, IClasses, ISelectOption, GRID_ACTIONS } from '@wings-shared/core';
import { CategoryStore, EventTypeModel, EventTypeStore, FieldDefinitionModel, FieldTypeModel } from '../../../Shared';
import { NavigateFunction } from 'react-router';
import { inject, observer } from 'mobx-react';
import { styles } from './EventTypeEditor.style';
import { fields } from './Fields';
import React, { ReactNode } from 'react';
import { action, observable } from 'mobx';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore, ALERT_TYPES } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { FieldDefinition, FieldDefinitionGrid } from '../index';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { DetailsEditorWrapper, EditSaveButtons, Collapsable } from '@wings-shared/layout';

interface Props {
  classes?: IClasses;
  eventTypeStore: EventTypeStore;
  categoryStore: CategoryStore;
  viewMode?: VIEW_MODE;
  params?: { mode: VIEW_MODE; id: number };
  navigate?: NavigateFunction;
}

@inject('eventTypeStore', 'categoryStore')
@observer
class EventTypeEditor extends BaseUpsertComponent<Props, EventTypeModel> {
  @observable private eventTypeModel: EventTypeModel = new EventTypeModel({ id: 0 });
  @observable private fieldDefinitions: FieldDefinitionModel[] = [];

  constructor(p: Props) {
    super(p, fields);
    const mode: string = this.props.params?.mode?.toUpperCase() || '';
    this.viewMode = VIEW_MODE[mode] || VIEW_MODE.NEW;
  }

  /* istanbul ignore next */
  componentDidMount() {
    const { categoryStore } = this.props;
    UIStore.setPageLoader(true);
    forkJoin([ this.loadEventTypeById(), categoryStore.getCategories() ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ eventType ]) => {
        if (!this.eventTypeId) {
          this.setFormValues(this.eventTypeModel);
          return;
        }
        this.eventTypeModel = new EventTypeModel(eventType);
        this.fieldDefinitions = this.eventTypeModel.fieldDefinitions?.map(x => {
          if (x.fieldType?.label === 'TIME') {
            return new FieldDefinitionModel({
              ...x,
              fieldType: new FieldTypeModel({ ...x.fieldType, name: 'ZULU TIME' }),
            });
          }
          return x;
        });
        this.setFormValues(this.eventTypeModel);
        if (this.eventTypeModel.inUse && this.eventTypeId) {
          this.showAlert(
            `The event type you are about to edit is already being used in templates or user subscriptions.
            Please be sure to make any changes.`,
            ALERT_TYPES.IMPORTANT
          );
        }
      });
  }

  /* istanbul ignore next */
  private loadEventTypeById(): Observable<EventTypeModel> {
    if (!this.eventTypeId) {
      return of(this.eventTypeModel);
    }
    return this.props.eventTypeStore.loadEventTypeById(this.eventTypeId);
  }

  /* istanbul ignore next */
  private upsertEventType(): void {
    UIStore.setPageLoader(true);
    this.props.eventTypeStore
      .upsertEventType(this.getUpsertEventType())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => this.navigateToEventTypes(),
        error: error => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private get loadCategories(): ISelectOption[] {
    const { categoryStore } = this.props;
    const { category } = this.form.values();
    return categoryStore.categories.filter(
      x =>
        !x.isSubCategory && (category?.label ? x.label?.toLowerCase()?.includes(category?.label?.toLowerCase()) : true)
    );
  }

  /* istanbul ignore next */
  private get loadSubCategories(): ISelectOption[] {
    const { categoryStore } = this.props;
    const { subCategory } = this.form.values();
    return categoryStore.categories.filter(
      x =>
        x.isSubCategory &&
        (subCategory?.label ? x.label?.toLowerCase()?.includes(subCategory?.label?.toLowerCase()) : true)
    );
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    return {
      title: 'EventType',
      inputControls: [
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: this.eventTypeModel.systemCreated || UIStore.pageLoading,
          isExists: this.isExists,
        },
        {
          fieldKey: 'category',
          isDisabled: this.eventTypeModel.systemCreated || UIStore.pageLoading,
          type: EDITOR_TYPES.DROPDOWN,
          options: this.loadCategories,
          freeSolo: true,
          isExists: Boolean(this.customErrorMessage),
          customErrorMessage: this.customErrorMessage,
        },
        {
          fieldKey: 'subCategory',
          isDisabled: this.eventTypeModel.systemCreated || UIStore.pageLoading,
          type: EDITOR_TYPES.DROPDOWN,
          options: this.loadSubCategories,
          freeSolo: true,
          isExists: Boolean(this.customErrorMessageSubCategory),
          customErrorMessage: this.customErrorMessageSubCategory,
        },
        {
          fieldKey: 'description',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'publicEnabled',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'systemEnabled',
          type: EDITOR_TYPES.CHECKBOX,
        },
      ],
    };
  }

  private onAction(action: GRID_ACTIONS): void {
    if (action === GRID_ACTIONS.CANCEL) {
      this.navigateToEventTypes();
      return;
    }
    this.upsertEventType();
  }

  @action
  private upsertFieldDefinition(fieldDefinition: FieldDefinitionModel) {
    if (fieldDefinition.id) {
      this.fieldDefinitions = this.fieldDefinitions.map(x => (x.id === fieldDefinition.id ? fieldDefinition : x));
      ModalStore.close();
      return;
    }

    fieldDefinition.id = Utilities.getTempId(true);
    this.fieldDefinitions = [ ...this.fieldDefinitions, fieldDefinition ];
    ModalStore.close();
  }

  @action
  private deleteFieldDefinition(id: number) {
    this.fieldDefinitions = this.fieldDefinitions.filter(field => !Utilities.isEqual(field.id, id));
    ModalStore.close();
  }

  private navigateToEventTypes(): void {
    this.props.navigate && this.props.navigate('/notifications/eventTypes');
  }

  private getUpsertEventType(): EventTypeModel {
    const formValues: EventTypeModel = this.form.values();
    const eventType = new EventTypeModel({
      ...this.eventTypeModel,
      ...formValues,
      fieldDefinitions: this.fieldDefinitions,
    });
    return eventType;
  }

  private get eventTypeId(): number {
    return Number(this.props.params?.id);
  }

  private get isExists(): boolean {
    const name = this.getField('name').value;
    return this.props.eventTypeStore.eventTypes.some(
      t => Utilities.isEqual(t.name, name) && !Utilities.isEqual(t.id, this.eventTypeId)
    );
  }

  private get customErrorMessage(): string {
    const category = this.getField('category').value?.label;
    const alphaNumericWithUnderscoreRegex = regex.alphaNumericWithUnderscore;
    if (!alphaNumericWithUnderscoreRegex.test(category)) {
      return 'The category format is invalid.';
    }
    return this.getField('category').value?.label?.length > 200
      ? 'The Category field must be between 1 and 200.' : '';
  }

  private get customErrorMessageSubCategory(): string {
    const subCategory = this.getField('subCategory').value?.label;
    const alphaNumericWithUnderscoreRegex = regex.alphaNumericWithUnderscore;
    if (!alphaNumericWithUnderscoreRegex.test(subCategory)) {
      return 'The Sub Category format is invalid.';
    }
    return this.getField('subCategory').value?.label?.length > 200
      ? 'The SubCategory field must be between 1 and 200.' : '';
  }

  private get headerActions(): ReactNode {
    return (
      <EditSaveButtons
        disabled={this.form.hasError
          || this.isExists
          || UIStore.pageLoading
          || Boolean(this.customErrorMessage)
          || Boolean(this.customErrorMessageSubCategory)
        }
        hasEditPermission={true}
        isEditMode={this.isEditable}
        onAction={action => this.onAction(action)}
      />
    );
  }

  private openEventTypeFieldDialog(fieldDefinition: FieldDefinitionModel, viewMode: VIEW_MODE): void {
    ModalStore.open(
      <FieldDefinition
        title={viewMode === VIEW_MODE.NEW ? 'Add Field' : 'Edit Field'}
        fieldDefinition={fieldDefinition}
        viewMode={viewMode}
        upsertField={fieldDefinition => this.upsertFieldDefinition(fieldDefinition)}
        fieldDefinitions={this.fieldDefinitions}
        eventTypeStore={this.props.eventTypeStore}
      />
    );
  }

  private get eventTypeChildGrid(): ReactNode {
    return (
      <Collapsable title="Fields">
        <FieldDefinitionGrid
          fieldDefinitions={this.fieldDefinitions}
          openEventTypeFieldDialog={(fieldDefinition, viewMode) =>
            this.openEventTypeFieldDialog(fieldDefinition, viewMode)
          }
          upsertFieldDefinition={fieldDefinition => this.upsertFieldDefinition(fieldDefinition)}
          deleteFieldDefinition={(id: number) => this.deleteFieldDefinition(id)}
        />
      </Collapsable>
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;

    return (
      <DetailsEditorWrapper headerActions={this.headerActions} isEditMode={this.isEditable}>
        <h2>{this.viewMode === VIEW_MODE.NEW ? 'Add Event Type' : 'Edit Event Type'}</h2>
        <div className={classes.flexRow}>
          <div className={classes.flexWrap}>
            {this.groupInputControls.inputControls
              .filter(inputControl => !inputControl.isHidden)
              .map((inputControl: IViewInputControl, index: number) => (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  field={this.getField(inputControl.fieldKey || '')}
                  isEditable={this.isEditable}
                  isExists={inputControl.isExists}
                  onValueChange={option => this.onValueChange(option, inputControl.fieldKey || '')}
                />
              ))}
          </div>
          <div>{this.eventTypeChildGrid}</div>
        </div>
      </DetailsEditorWrapper>
    );
  }
}

export default withRouter(withStyles(styles)(EventTypeEditor));
export { EventTypeEditor as PureEventTypeEditor };

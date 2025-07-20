import { VIEW_MODE, BaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import {
  withRouter,
  Utilities,
  DATE_FORMAT,
  UIStore,
  IClasses,
  IOptionValue,
  ISelectOption,
  GRID_ACTIONS,
} from '@wings-shared/core';
import {
  DNDFilterStore,
  DNDFilterModel,
  EventTypeStore,
  MessageLevelOptions,
  DNDFilterTypeOptions,
  DaysOfWeekOptions,
  DeliveryTypeOptions,
  MessageLevelModel,
  MESSAGE_LEVEL,
  DayOfWeekModel,
  DAYS_OF_WEEK,
  DELIVERY_TYPE,
  DeliveryTypeModel,
  EventTypeModel,
  UserModel,
} from '../../../Shared';
import { NavigateFunction } from 'react-router';
import { inject, observer } from 'mobx-react';
import { styles } from './DNDFilterEditor.style';
import { fields } from './Fields';
import React, { ReactNode } from 'react';
import { action, observable } from 'mobx';
import { forkJoin, Observable, of } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { Chip, withStyles } from '@material-ui/core';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';

interface Props {
  classes?: IClasses;
  dndFilterStore: DNDFilterStore;
  eventTypeStore: EventTypeStore;
  viewMode?: VIEW_MODE;
  params?: { mode: VIEW_MODE; id: number };
  navigate?: NavigateFunction;
}

@inject('dndFilterStore', 'eventTypeStore')
@observer
class DNDFilterEditor extends BaseUpsertComponent<Props, DNDFilterModel> {
  @observable private oktaUsers: UserModel[] = [];
  @observable private dndFilterModel: DNDFilterModel = new DNDFilterModel({ id: 0 });
  private readonly eventTypeTempModel: EventTypeModel = new EventTypeModel({
    id: Utilities.getTempId(true),
    name: 'All',
  });

  constructor(p: Props) {
    super(p, fields);
    const mode: string = this.props.params?.mode?.toUpperCase() || '';
    this.viewMode = VIEW_MODE[mode] || VIEW_MODE.NEW;
  }

  /* istanbul ignore next */
  componentDidMount() {
    const { eventTypeStore, dndFilterStore } = this.props;
    UIStore.setPageLoader(true);
    forkJoin([ this.loadDNDFilterById(), eventTypeStore.getEventTypes() ])
      .pipe(
        switchMap(([ dndFilter ]) => {
          if (!this.dndFilterId) {
            this.setFormValues(this.dndFilterModel);
            return of(null);
          }

          this.dndFilterModel = new DNDFilterModel(dndFilter);
          this.dndFilterModel.eventTypes = this.populateEventTypes();
          this.setFormValues(this.dndFilterModel);
          return dndFilterStore.loadUsers({
            limit: 200,
            searchCollection: JSON.stringify([
              {
                propertyName: 'username',
                propertyValue: this.dndFilterModel.oktaUsername,
              },
            ]),
          });
        }),
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(oktaUsers => {
        if (oktaUsers?.length) {
          this.oktaUsers = oktaUsers;
          this.getField('oktaUser').set(new UserModel({ ...oktaUsers[0] }));
        }
      });
  }

  @action
  private loadUsers(searchValue: string): void {
    if (!Boolean(searchValue.length > 3)) {
      return;
    }
    const { dndFilterStore } = this.props;
    UIStore.setPageLoader(true);
    const request = {
      limit: 200,
      searchCollection: JSON.stringify([{ propertyName: 'username', propertyValue: searchValue }]),
    };

    dndFilterStore
      .loadUsers(request)
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(oktaUsers => (this.oktaUsers = oktaUsers));
  }

  /* istanbul ignore next */
  private loadDNDFilterById(): Observable<DNDFilterModel> {
    if (!this.dndFilterId) {
      return of(this.dndFilterModel);
    }
    return this.props.dndFilterStore.loadDNDFilterById(this.dndFilterId);
  }

  /* istanbul ignore next */
  private upsertDNDFilter(): void {
    const dndFilter = new DNDFilterModel({
      ...this.dndFilterModel,
      ...this.form.values(),
      eventTypes: this.selectedEventTypes(),
    });
    UIStore.setPageLoader(true);
    this.props.dndFilterStore
      .upsertDNDFilter(dndFilter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => this.navigateToDNDFilters(),
      });
  }

  private get isExists(): boolean {
    const name = this.getField('name').value;
    return this.props.dndFilterStore.dndFilters.some(
      t => Utilities.isEqual(t.name, name) && !Utilities.isEqual(t.id, this.dndFilterId)
    );
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    return {
      title: 'DNDFilter',
      inputControls: [
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
          isExists: this.isExists,
        },
        {
          fieldKey: 'startTime',
          type: EDITOR_TYPES.TIME,
          is12HoursFormat: false,
          dateTimeFormat: DATE_FORMAT.API_TIME_FORMAT,
        },
        {
          fieldKey: 'stopTime',
          type: EDITOR_TYPES.TIME,
          is12HoursFormat: false,
          dateTimeFormat: DATE_FORMAT.API_TIME_FORMAT,
        },
        {
          fieldKey: 'daysOfWeek',
          type: EDITOR_TYPES.DROPDOWN,
          options: DaysOfWeekOptions.map(x => new DayOfWeekModel({ id: x.label as DAYS_OF_WEEK, name: x.label })),
          autoSelect: false,
          multiple: true,
        },
        {
          fieldKey: 'eventTypes',
          type: EDITOR_TYPES.DROPDOWN,
          autoSelect: false,
          multiple: true,
          options: this.getEventTypeOptions,
        },
        {
          fieldKey: 'deliveryTypes',
          type: EDITOR_TYPES.DROPDOWN,
          autoSelect: false,
          multiple: true,
          options: DeliveryTypeOptions.map(x => new DeliveryTypeModel({ id: x.label as DELIVERY_TYPE, name: x.label })),
        },
        {
          fieldKey: 'level',
          type: EDITOR_TYPES.DROPDOWN,
          options: MessageLevelOptions.map(x => new MessageLevelModel({ id: x.label as MESSAGE_LEVEL, name: x.label })),
        },
        {
          fieldKey: 'filterType',
          type: EDITOR_TYPES.DROPDOWN,
          options: DNDFilterTypeOptions,
        },
        {
          fieldKey: 'oktaUser',
          type: EDITOR_TYPES.DROPDOWN,
          options: this.oktaUsers,
          autoSelect: false,
        },
        {
          fieldKey: 'isEnabled',
          type: EDITOR_TYPES.CHECKBOX,
        },
      ],
    };
  }

  private onAction(action: GRID_ACTIONS): void {
    if (action === GRID_ACTIONS.CANCEL) {
      this.navigateToDNDFilters();
      return;
    }
    this.upsertDNDFilter();
  }

  private populateEventTypes(): EventTypeModel[] {
    const { eventTypeStore } = this.props;
    const eventTypes = eventTypeStore.eventTypes.filter(x => x.systemEnabled);
    if (eventTypes.length === this.dndFilterModel.eventTypeIds.length) {
      const result = eventTypes.every(x => this.dndFilterModel.eventTypeIds.some(y => y === x.id));
      if (result) {
        return [ new EventTypeModel({ ...this.eventTypeTempModel }) ];
      }
    }
    return eventTypes.filter(x => this.dndFilterModel.eventTypeIds.some(y => y === x.id));
  }

  private selectedEventTypes(): EventTypeModel[] {
    const { eventTypeStore } = this.props;
    const eventTypes = this.getField('eventTypes')?.value as EventTypeModel[];
    if (eventTypes?.some(x => x.id === this.eventTypeTempModel.id)) {
      return eventTypeStore.eventTypes.filter(x => x.systemEnabled);
    }
    return eventTypes;
  }

  private get getEventTypeOptions(): EventTypeModel[] {
    const { eventTypeStore } = this.props;
    return [ new EventTypeModel(this.eventTypeTempModel), ...eventTypeStore.eventTypes.filter(x => x.systemEnabled) ];
  }

  private get dndFilterId(): number {
    return Number(this.props.params?.id);
  }

  private navigateToDNDFilters(): void {
    this.props.navigate && this.props.navigate('/notifications/dndFilters');
  }

  private onSearch(value: string, fieldKey: string): void {
    if (Utilities.isEqual('oktaUser', fieldKey)) {
      this.loadUsers(value);
    }
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    switch (fieldKey) {
      case 'daysOfWeek':
        this.setDaysOfWeekRules(value as DayOfWeekModel[], fieldKey);
        break;
      case 'eventTypes':
        this.setEventTypesRules(value as EventTypeModel[], fieldKey);
        break;
      case 'deliveryTypes':
        this.setDeliveryTypeRules(value as DeliveryTypeModel[], fieldKey);
        break;
      default:
        this.getField(fieldKey).set(value);
    }
  }

  private setDaysOfWeekRules(value: DayOfWeekModel[], fieldKey: string): void {
    const isAll = value.find(x => Utilities.isEqual(x.id, DAYS_OF_WEEK.ALL));
    this.getField(fieldKey).set(isAll ? [ isAll ] : value);
  }

  private setEventTypesRules(value: EventTypeModel[], fieldKey: string): void {
    const isAll = value.find(x => Utilities.isEqual(x.id, this.eventTypeTempModel.id));
    this.getField(fieldKey).set(isAll ? [ isAll ] : value);
  }

  private setDeliveryTypeRules(value: DeliveryTypeModel[], fieldKey: string): void {
    const isAll = value.find(x => Utilities.isEqual(x.id, DELIVERY_TYPE.ALL));
    this.getField(fieldKey).set(isAll ? [ isAll ] : value);
  }

  private getOptionDisabled(option: ISelectOption, value: ISelectOption | ISelectOption[]): boolean {
    if (Array.isArray(value) && option?.label !== 'All') {
      return value.some(x => x.label === 'All');
    }
    return false;
  }

  private viewRenderer(values: DayOfWeekModel[], getTagProps?: AutocompleteGetTagProps): ReactNode {
    return values.map((value, index) => (
      <Chip
        classes={{ root: this.props.classes?.chip }}
        key={value.id}
        label={value.label}
        {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
      />
    ));
  }

  private get headerActions(): ReactNode {
    return (
      <EditSaveButtons
        disabled={this.form.hasError || this.isExists || UIStore.pageLoading}
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
        <h2>{this.viewMode === VIEW_MODE.NEW ? 'Add DND Filter' : 'Edit DND Filter'}</h2>
        <div className={classes.flexRow}>
          <div className={classes.flexWrap}>
            {this.groupInputControls.inputControls.map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={this.getField(inputControl.fieldKey || '')}
                isEditable={this.isEditable}
                onValueChange={(option, fieldKey) => this.onValueChange(option, inputControl.fieldKey || '')}
                onSearch={(value: string, fieldKey: string) => this.onSearch(value, fieldKey)}
                renderTags={(values, getTagProps: AutocompleteGetTagProps) =>
                  this.viewRenderer(values as DayOfWeekModel[], getTagProps)
                }
                getOptionDisabled={(option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) =>
                  this.getOptionDisabled(option, selectedOption)
                }
              />
            ))}
          </div>
        </div>
      </DetailsEditorWrapper>
    );
  }
}

export default withRouter(withStyles(styles)(DNDFilterEditor));
export { DNDFilterEditor as PureDNDFilterEditor };

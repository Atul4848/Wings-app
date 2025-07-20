import { modelProtection, DATE_FORMAT, IdNameModel, ISelectOption } from '@wings-shared/core';
import { IAPIDNDFilter } from '../Interfaces';
import { EventTypeModel, MessageLevelModel, DayOfWeekModel, DeliveryTypeModel, UserModel } from './index';
import { MESSAGE_LEVEL, DND_FILTER_TYPE, DAYS_OF_WEEK, DELIVERY_TYPE } from '../Enums';
import moment from 'moment';

@modelProtection
export class DNDFilterModel extends IdNameModel {
  startTime: string = '';
  stopTime: string = '';
  level: MessageLevelModel = new MessageLevelModel({ id: MESSAGE_LEVEL.GENERAL, name: MESSAGE_LEVEL.GENERAL });
  filterType: ISelectOption = { value: DND_FILTER_TYPE.INCLUSIVE, label: DND_FILTER_TYPE.INCLUSIVE };
  daysOfWeek: DayOfWeekModel[] = [];
  isEnabled: boolean = false;
  oktaUserId: string = '';
  oktaUsername: string = '';
  oktaUser: UserModel = null;
  eventTypeIds: number[] = [];
  eventTypes: EventTypeModel[] = [];
  deliveryTypes: DeliveryTypeModel[] = [];

  constructor(data?: Partial<DNDFilterModel>) {
    super();
    Object.assign(this, data);
    this.oktaUser = data?.oktaUser ? new UserModel(data.oktaUser) : null;
    this.deliveryTypes = data?.deliveryTypes?.map(x => new DeliveryTypeModel(x)) || [];
    this.eventTypes = data?.eventTypes?.map(x => new EventTypeModel(x)) || [];
  }

  static deserialize(dndFilter: IAPIDNDFilter): DNDFilterModel {
    if (!dndFilter) {
      return new DNDFilterModel();
    }

    const currentDate = moment().format(DATE_FORMAT.API_DATE_FORMAT);
    const data: Partial<DNDFilterModel> = {
      id: dndFilter.DNDFilterId,
      name: dndFilter.Name,
      startTime: moment(`${currentDate} ${dndFilter.StartTime}`).format(DATE_FORMAT.API_FORMAT),
      stopTime: moment(`${currentDate} ${dndFilter.StopTime}`).format(DATE_FORMAT.API_FORMAT),
      level: MessageLevelModel.deserialize(dndFilter.Level),
      filterType: dndFilter.FilterType ? { label: dndFilter.FilterType, value: dndFilter.FilterType } : null,
      daysOfWeek: dndFilter.DaysOfWeek.map(x => new DayOfWeekModel({ id: x as DAYS_OF_WEEK, name: x as DAYS_OF_WEEK })),
      isEnabled: dndFilter.IsEnabled,
      oktaUserId: dndFilter.OktaUserId,
      oktaUsername: dndFilter.OktaUsername,
      eventTypeIds: dndFilter.EventTypeIds,
      deliveryTypes: dndFilter.DeliveryTypes.map(
        x => new DeliveryTypeModel({ id: x as DELIVERY_TYPE, name: x as DELIVERY_TYPE })
      ),
    };

    return new DNDFilterModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIDNDFilter {
    return {
      DNDFilterId: this.id,
      Name: this.name,
      StartTime: moment(this.startTime).format('HH:mm'),
      StopTime: moment(this.stopTime).format('HH:mm'),
      Level: this.level.value as MESSAGE_LEVEL,
      FilterType: this.filterType.value as DND_FILTER_TYPE,
      DaysOfWeek: this.daysOfWeek.map(x => x.id),
      IsEnabled: this.isEnabled,
      OktaUserId: this.oktaUser.id,
      OktaUsername: this.oktaUser.email,
      EventTypeIds: this.eventTypes.map(x => x.id),
      DeliveryTypes: this.deliveryTypes.map(x => x.id),
    };
  }

  static deserializeList(dndFilters: IAPIDNDFilter[]): DNDFilterModel[] {
    return dndFilters ? dndFilters.map((dndFilter: IAPIDNDFilter) => DNDFilterModel.deserialize(dndFilter)) : [];
  }
}

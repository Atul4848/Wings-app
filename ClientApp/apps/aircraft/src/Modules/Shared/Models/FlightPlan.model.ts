import moment from 'moment';
import { IAPIFlightPlan } from '../Interfaces';
import { FlightPlanFormatAccountModel } from './FlightPlanFormatAccount.model';
import { FlightPlanFormatChangeRecordModel } from './FlightPlanFormatChangeRecord.model';
import { FlightPlanFormatDocumentModel } from './FlightPlanFormatDocument.model';
import {
  modelProtection,
  Utilities,
  DATE_FORMAT,
  CoreModel,
  StatusTypeModel,
  AccessLevelModel,
  SourceTypeModel,
  ISelectOption,
  SettingsTypeModel,
} from '@wings-shared/core';

@modelProtection
export class FlightPlanModel extends CoreModel implements ISelectOption {
  id: number = 0;
  startDate: string = Utilities.getCurrentDate;
  endDate: string = Utilities.getCurrentDate;
  format: string = '';
  builtBy: string = '';
  builtDate: string = moment().format(DATE_FORMAT.API_DATE_FORMAT);
  contactForChanges: string = '';
  description: string = '';
  notes: string = '';
  lastUsedDate: string = moment().format(DATE_FORMAT.API_DATE_FORMAT);
  flightPlanFormatStatus: SettingsTypeModel;
  flightPlanFormatAccounts: FlightPlanFormatAccountModel[];
  flightPlanFormatDocuments: FlightPlanFormatDocumentModel[];
  flightPlanFormatChangeRecords: FlightPlanFormatChangeRecordModel[];
  includeEscapeRoutes: boolean = false;

  constructor(data?: Partial<FlightPlanModel>) {
    super(data);
    Object.assign(this, data);
    this.flightPlanFormatAccounts = data?.flightPlanFormatAccounts?.map(a => new FlightPlanFormatAccountModel(a)) || [];
    this.flightPlanFormatChangeRecords =
      data?.flightPlanFormatChangeRecords?.map(a => new FlightPlanFormatChangeRecordModel(a)) || [];
    this.flightPlanFormatDocuments =
      data?.flightPlanFormatDocuments?.map(a => new FlightPlanFormatDocumentModel(a)) || [];
  }

  static deserialize(apiFlightPlanData: IAPIFlightPlan): FlightPlanModel {
    if (!apiFlightPlanData) {
      return new FlightPlanModel();
    }
    const data: Partial<FlightPlanModel> = {
      ...apiFlightPlanData,
      ...CoreModel.deserializeAuditFields(apiFlightPlanData),
      id: apiFlightPlanData.flightPlanFormatId || apiFlightPlanData.id,
      flightPlanFormatStatus: SettingsTypeModel.deserialize({
        ...apiFlightPlanData.flightPlanFormatStatus,
        id: apiFlightPlanData.flightPlanFormatStatus?.flightPlanFormatStatusId,
      }),
      flightPlanFormatAccounts: FlightPlanFormatAccountModel.deserializeList(
        apiFlightPlanData.flightPlanFormatAccounts
      ),
      flightPlanFormatChangeRecords: FlightPlanFormatChangeRecordModel.deserializeList(
        apiFlightPlanData.flightPlanFormatChangeRecords
      ),
      flightPlanFormatDocuments: FlightPlanFormatDocumentModel.deserializeList(
        apiFlightPlanData.flightPlanFormatDocuments
      ),
      status: StatusTypeModel.deserialize(apiFlightPlanData.status),
      accessLevel: AccessLevelModel.deserialize(apiFlightPlanData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiFlightPlanData.sourceType),
    };
    return new FlightPlanModel(data);
  }

  public serialize(): IAPIFlightPlan {
    return {
      id: this.id,
      format: this.format.toString(),
      builtBy: this.builtBy,
      builtDate: this.builtDate || null,
      contactForChanges: this.contactForChanges,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      notes: this.notes,
      lastUsedDate: this.lastUsedDate || null,
      flightPlanFormatStatusId: this.flightPlanFormatStatus?.id,
      flightPlanFormatAccounts: this.flightPlanFormatAccounts.map(account => account.serialize()),
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id || 1,
      flightPlanFormatChangeRecords: this.flightPlanFormatChangeRecords.map(record => record.serialize()),
      flightPlanFormatDocuments: this.flightPlanFormatDocuments.map(document => document.serialize()),
      includeEscapeRoutes: this.includeEscapeRoutes,
    };
  }

  static deserializeList(apiDataList: IAPIFlightPlan[]): FlightPlanModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIFlightPlan) => FlightPlanModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.format;
  }

  public get value(): string | number {
    return this.id;
  }
}

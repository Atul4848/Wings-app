import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIResponseVendorLocationOperationalEssential } from
  '../Interfaces/Response/API-Response-VendorLocationOperationalEssential';
import { VendorLocationModel } from './VendorLocation.model';
import { Airports } from './Airports.model';
import { SettingBaseModel } from './SettingBase.model';
import { OperationInfoSettingOptionModel } from './OperationInfoSettingOptionModel.model';
import { CustomersModel } from './Customers.model';

@modelProtection
export class LocationOperationalEssentialModel extends CoreModel implements ISelectOption {
  id: number = 0;
  coordinatingOfficeId: number = 0;
  vendorLevelId: number = 0;
  vendorLocationId: number = 0;
  vendorLocation: VendorLocationModel = new VendorLocationModel();
  certifiedMemberFeeScheduleId: number = 0;
  creditProvidedById: number = 0;
  coordinatingOffice: VendorLocationModel = null;
  isSupervisoryAgentAvailable: boolean = true;
  agentDispatchedFrom: Airports = null;
  isPrincipleOffice: boolean = false;
  vendorLevel: SettingBaseModel = null;
  certifiedMemberFeeSchedule: SettingBaseModel = new SettingBaseModel();
  certifiedMemberFee: number = 0;
  contractRenewalDate: Date = new Date();
  complianceDiligenceDueDate: Date = new Date();
  startDate: Date = new Date();
  endDate: Date = new Date();
  isProprietary: boolean = false;
  netSuitId: number = 0;
  creditProvidedBy: VendorLocationModel = new VendorLocationModel();
  locationAirfield: string = '';
  airToGroundFrequency: number = 0;
  managerName: string = '';
  asstManagerName: string = '';
  appliedOperationType: OperationInfoSettingOptionModel = new OperationInfoSettingOptionModel();
  provideCoordinationFor: OperationInfoSettingOptionModel[] = [];
  commsCopyFor: OperationInfoSettingOptionModel[] = [];
  appliedPaymentOptions: OperationInfoSettingOptionModel[] = [];
  appliedCreditAvailable: OperationInfoSettingOptionModel[] = [];
  appliedMainServicesOffered: OperationInfoSettingOptionModel[] = [];
  creditProvidedFor: OperationInfoSettingOptionModel[] = [];
  customers: CustomersModel[] = [];

  constructor(data?: Partial<LocationOperationalEssentialModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIResponseVendorLocationOperationalEssential): LocationOperationalEssentialModel {
    if (!apiData) {
      return new LocationOperationalEssentialModel();
    }
    const data: Partial<LocationOperationalEssentialModel> = {
      ...apiData,
      coordinatingOffice: apiData?.coordinatingOffice?.vendorLocationId != 0 ? VendorLocationModel.deserialize({
        ...apiData.coordinatingOffice,
        id: apiData.coordinatingOffice?.vendorLocationId
      }): null,
      vendorLevel: SettingBaseModel.deserialize(apiData.vendorLevel),
      vendorLocation: VendorLocationModel.deserialize(apiData.vendorLocation),
      certifiedMemberFeeSchedule: SettingBaseModel.deserialize(apiData.certifiedMemberFeeSchedule),
      creditProvidedBy: apiData?.creditProvidedBy?.vendorLocationId !=0 ? 
        VendorLocationModel.deserialize(apiData.creditProvidedBy): null,
      agentDispatchedFrom: apiData?.agentDispatchedFrom
        ? Airports.deserializeAirportReference(apiData?.agentDispatchedFrom)
        : null,
      appliedOperationType: apiData?.appliedOperationType && apiData.appliedOperationType.length > 0
        ? OperationInfoSettingOptionModel.deserialize(apiData?.appliedOperationType[0])
        : null,
      provideCoordinationFor: OperationInfoSettingOptionModel.deserializeList(apiData?.provideCoordinationFor),
      commsCopyFor: OperationInfoSettingOptionModel.deserializeList(apiData?.commsCopyFor),
      appliedPaymentOptions: OperationInfoSettingOptionModel.deserializeList(apiData?.appliedPaymentOptions),
      appliedCreditAvailable: OperationInfoSettingOptionModel.deserializeList(apiData?.appliedCreditAvailable),
      appliedMainServicesOffered: OperationInfoSettingOptionModel.deserializeList(apiData?.appliedMainServicesOffered),
      creditProvidedFor: OperationInfoSettingOptionModel.deserializeList(apiData?.creditProvidedFor),
      customers: CustomersModel.deserializeList(apiData.customers),
    };
    return new LocationOperationalEssentialModel(data);
  }

  static deserializeList(
    apiDataList: IAPIResponseVendorLocationOperationalEssential[]
  ): LocationOperationalEssentialModel[] {
    return apiDataList
      ? apiDataList.map((apiData: any) => LocationOperationalEssentialModel.deserialize(apiData))
      : [];
  }

  public serialize(locationId: number) {
    return {
      id: this.id || 0,
      userId: this.userId,
      vendorLocationId: locationId,
      coordinatingOfficeId: this.coordinatingOffice?.vendorLocationId || this.coordinatingOffice?.id || null,
      isSupervisoryAgentAvailable: this.isSupervisoryAgentAvailable,
      agentDispatchedFrom: this.serializeAgentDispatchedFrom() || null,
      isPrincipleOffice: this.isPrincipleOffice,
      vendorLevelId: this.vendorLevel.id || null,
      certifiedMemberFeeScheduleId: this.certifiedMemberFeeSchedule?.id || null,
      certifiedMemberFee: parseFloat(this.certifiedMemberFee) || 0,
      contractRenewalDate: this.contractRenewalDate || null,
      complianceDiligenceDueDate: this.complianceDiligenceDueDate,
      startDate: this.startDate,
      endDate: this.endDate || null,
      isProprietary: this.isProprietary,
      netSuitId: parseInt(this.netSuitId) || 0,
      creditProvidedById: this.creditProvidedBy?.vendorLocationId || this.creditProvidedBy?.id || null,
      locationAirfield: this.locationAirfield || null,
      airToGroundFrequency: parseFloat(this.airToGroundFrequency) || 0,
      managerName: this.managerName || null,
      asstManagerName: this.asstManagerName || null,
      appliedOperationType: [
        {
          id: this.appliedOperationType.id || 0,
          operationTypeId: this.appliedOperationType?.operationType?.id || 0,
        },
      ],
      provideCoordinationFor: this.provideCoordinationFor.map(data => ({
        id: data.id || 0,
        vendorLocationId: data?.vendorLocation?.vendorLocationId || data?.vendorLocation?.id || 0,
      })),
      commsCopyFor: this.commsCopyFor.map(data => ({
        id: data.id || 0,
        vendorLocationId: data?.vendorLocation?.vendorLocationId || data?.vendorLocation?.id || 0,
      })),
      appliedPaymentOptions: this.appliedPaymentOptions.map(data => ({
        id: data.id || 0,
        paymentOptionsId: data?.paymentOptions?.id || 0,
      })),
      appliedCreditAvailable: this.appliedCreditAvailable.map(data => ({
        id: data.id || 0,
        creditAvailableId: data?.creditAvailable?.id || 0,
      })),
      creditProvidedFor: this.creditProvidedFor.map(data => ({
        id: data.id || 0,
        vendorLocationId: data?.vendorLocation?.vendorLocationId || data?.vendorLocation?.id || 0,
      })),
      appliedMainServicesOffered: this.appliedMainServicesOffered.map(data => ({
        id: data.id || 0,
        mainServicesOfferedId: data?.mainServicesOffered?.id || 0,
      })),
      customers: this.customers.map(customer => ({
        id: this.isString(customer.id) ? 0 : customer.id,
        name: customer.name,
        number: customer.number,
        partyId: customer.partyId
      })),
    };
  }

  public isString(input): boolean {
    return typeof input === 'string' && Object.prototype.toString.call(input) === '[object String]';
  }

  public serializeAgentDispatchedFrom = (): Airports => {
    return new Airports({
      id: this.agentDispatchedFrom?.id || 0,
      airportId: this.agentDispatchedFrom?.airportId || 0,
      airportName: this.agentDispatchedFrom?.airportName,
      icaoCode: this.agentDispatchedFrom?.icaoCode,
      uwaCode: this.agentDispatchedFrom?.uwaCode,
      faaCode: this.agentDispatchedFrom?.faaCode,
      iataCode: this.agentDispatchedFrom?.iataCode,
      regionalCode: this.agentDispatchedFrom?.regionalCode,
      displayCode: this.agentDispatchedFrom?.displayCode
    });
  };

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

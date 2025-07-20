import { IApiHealthAuth } from '../Interfaces';
import { EntryRequirementModel } from './EntryRequirment.model';
import { GeneralInfoModel } from './GeneralInfo.model';
import { HealthAuthorizationChangeRecordModel } from './HealthAuthorizationChangeRecord.model';
import {
  DomesticMeasureModel,
  StayRequirementModel,
  VaccinationRequirementModel,
  ExitRequirementModel,
  QuarantineRequirementModel,
  TraveledHistoryModel,
} from './index';
import { HealthAuthorizationOverviewModel } from './HealthAuthorizationOverview.model';
import { IdNameCodeModel, ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';

enum PAX_TYPE {
  PASSENGER = 1,
  CREW,
}

@modelProtection
export class HealthAuthModel extends HealthAuthorizationOverviewModel implements ISelectOption {
  generalInformation: GeneralInfoModel;
  crewQuarantineRequirement: QuarantineRequirementModel;
  passengerQuarantineRequirement: QuarantineRequirementModel;
  crewEntryRequirement: EntryRequirementModel;
  passengerEntryRequirement: EntryRequirementModel;
  crewExitRequirement: ExitRequirementModel;
  passengerExitRequirement: ExitRequirementModel;
  healthAuthorizationChangeRecords: HealthAuthorizationChangeRecordModel[];
  region: IdNameCodeModel;
  crewStayRequirement: StayRequirementModel;
  passengerStayRequirement: StayRequirementModel;
  crewVaccinationRequirement: VaccinationRequirementModel;
  passengerVaccinationRequirement: VaccinationRequirementModel;
  domesticMeasure: DomesticMeasureModel;
  traveledHistory: TraveledHistoryModel;

  constructor(data?: Partial<HealthAuthModel>) {
    super(data);
    Object.assign(this, data);
    this.crewQuarantineRequirement =
      data?.crewQuarantineRequirement || new QuarantineRequirementModel({ paxCrew: new SettingsTypeModel({ id: 2 }) });
    this.passengerQuarantineRequirement =
      data?.passengerQuarantineRequirement ||
      new QuarantineRequirementModel({ paxCrew: new SettingsTypeModel({ id: 1 }) });
    this.crewEntryRequirement = new EntryRequirementModel({
      ...data?.crewEntryRequirement,
      paxCrew: new SettingsTypeModel({ id: 2 }),
    });
    this.passengerEntryRequirement = new EntryRequirementModel({
      ...data?.passengerEntryRequirement,
      paxCrew: new SettingsTypeModel({ id: 1 }),
    });

    this.passengerStayRequirement = new StayRequirementModel({
      ...data?.passengerStayRequirement,
      paxCrew: new SettingsTypeModel({ id: 1 }),
    });
    this.crewStayRequirement = new StayRequirementModel({
      ...data?.crewStayRequirement,
      paxCrew: new SettingsTypeModel({ id: 2 }),
    });

    this.crewExitRequirement = new ExitRequirementModel({
      ...data?.crewExitRequirement,
      paxCrew: new SettingsTypeModel({ id: 2 }),
    });
    this.passengerExitRequirement = new ExitRequirementModel({
      ...data?.passengerExitRequirement,
      paxCrew: new SettingsTypeModel({ id: 1 }),
    });
    this.healthAuthorizationChangeRecords =
      data?.healthAuthorizationChangeRecords?.map(record => new HealthAuthorizationChangeRecordModel(record)) || [];
    this.generalInformation = new GeneralInfoModel(data?.generalInformation);
    this.region = new IdNameCodeModel(data?.region);
    this.crewVaccinationRequirement = new VaccinationRequirementModel({
      ...data?.crewVaccinationRequirement,
      paxCrew: new SettingsTypeModel({ id: 2 }),
    });
    this.passengerVaccinationRequirement = new VaccinationRequirementModel({
      ...data?.passengerVaccinationRequirement,
      paxCrew: new SettingsTypeModel({ id: 1 }),
    });
    this.domesticMeasure = new DomesticMeasureModel(data?.domesticMeasure);
    this.traveledHistory = new TraveledHistoryModel(data?.traveledHistory);
  }

  static deserialize(apiData: IApiHealthAuth): HealthAuthModel {
    if (!apiData) {
      return new HealthAuthModel();
    }
    const data: Partial<HealthAuthModel> = {
      ...apiData,
      ...HealthAuthorizationOverviewModel.deserialize(apiData),
      generalInformation: GeneralInfoModel.deserialize(apiData.generalInformation),
      crewQuarantineRequirement: this.getCrewQuarantineRequirement(apiData),
      passengerQuarantineRequirement: this.getPassengerQuarantineRequirement(apiData),
      crewEntryRequirement: this.getEntryRequirements(apiData, PAX_TYPE.CREW),
      passengerEntryRequirement: this.getEntryRequirements(apiData, PAX_TYPE.PASSENGER),
      crewExitRequirement: this.getExitRequirements(apiData, PAX_TYPE.CREW),
      passengerExitRequirement: this.getExitRequirements(apiData, PAX_TYPE.PASSENGER),
      passengerStayRequirement: this.getStayRequirements(apiData, PAX_TYPE.PASSENGER),
      crewStayRequirement: this.getStayRequirements(apiData, PAX_TYPE.CREW),
      healthAuthorizationChangeRecords: HealthAuthorizationChangeRecordModel.deserializeList(
        apiData.healthAuthorizationChangeRecords
      ),
      traveledHistory: TraveledHistoryModel.deserialize(apiData.traveledHistory),
      crewVaccinationRequirement: this.getVaccinationRequirements(apiData, PAX_TYPE.CREW),
      passengerVaccinationRequirement: this.getVaccinationRequirements(apiData, PAX_TYPE.PASSENGER),
      domesticMeasure: DomesticMeasureModel.deserialize(apiData.domesticMeasure),
    };
    return new HealthAuthModel(data);
  }

  private static getCrewQuarantineRequirement(apiData: IApiHealthAuth): QuarantineRequirementModel {
    const { quarantineRequirements, healthAuthorizationId } = apiData;
    const crewQuarantineRequirement = quarantineRequirements?.find(x => x.paxCrew?.paxCrewId === 2);
    return crewQuarantineRequirement
      ? QuarantineRequirementModel.deserialize(crewQuarantineRequirement)
      : new QuarantineRequirementModel({ healthAuthorizationId, paxCrew: new SettingsTypeModel({ id: 2 }) });
  }

  private static getPassengerQuarantineRequirement(apiData: IApiHealthAuth): QuarantineRequirementModel {
    const { quarantineRequirements, healthAuthorizationId } = apiData;
    const passengerQuarantineRequirement = quarantineRequirements?.find(x => x.paxCrew?.paxCrewId === 1);
    return passengerQuarantineRequirement
      ? QuarantineRequirementModel.deserialize(passengerQuarantineRequirement)
      : new QuarantineRequirementModel({ healthAuthorizationId, paxCrew: new SettingsTypeModel({ id: 1 }) });
  }

  private static getEntryRequirements(apiData: IApiHealthAuth, paxType: number): EntryRequirementModel {
    const { entryRequirements, healthAuthorizationId } = apiData;
    const entryRequirement = entryRequirements?.find(x => x.paxCrew?.paxCrewId === paxType);
    return entryRequirement
      ? EntryRequirementModel.deserialize(entryRequirement)
      : new EntryRequirementModel({ healthAuthorizationId, paxCrew: new SettingsTypeModel({ id: paxType }) });
  }

  private static getExitRequirements(apiData: IApiHealthAuth, paxType: number): ExitRequirementModel {
    const { exitRequirements, healthAuthorizationId } = apiData;
    const exitRequirement = exitRequirements?.find(x => x.paxCrew?.paxCrewId === paxType);
    return exitRequirement
      ? ExitRequirementModel.deserialize(exitRequirement)
      : new ExitRequirementModel({ healthAuthorizationId, paxCrew: new SettingsTypeModel({ id: paxType }) });
  }

  private static getStayRequirements(apiData: IApiHealthAuth, paxType: number): StayRequirementModel {
    const { stayRequirements, healthAuthorizationId } = apiData;
    const stayRequirement = stayRequirements?.find(x => x.paxCrew?.paxCrewId === paxType);
    return stayRequirements
      ? StayRequirementModel.deserialize(stayRequirement)
      : new StayRequirementModel({ healthAuthorizationId, paxCrew: new SettingsTypeModel({ id: paxType }) });
  }

  private static getVaccinationRequirements(apiData: IApiHealthAuth, paxType: number): VaccinationRequirementModel {
    const { vaccinationRequirements, healthAuthorizationId } = apiData;
    const vaccinationRequirement = vaccinationRequirements?.find(x => x.paxCrew?.paxCrewId === paxType);
    return vaccinationRequirement
      ? VaccinationRequirementModel.deserialize(vaccinationRequirement)
      : new VaccinationRequirementModel({ healthAuthorizationId, paxCrew: new SettingsTypeModel({ id: paxType }) });
  }

  static deserializeList(apiDataList: IApiHealthAuth[]): HealthAuthModel[] {
    return apiDataList ? apiDataList.map((apiData: IApiHealthAuth) => HealthAuthModel.deserialize(apiData)) : [];
  }

  public get title(): string {
    return [ this.levelDesignator?.label, this.infectionType?.label, this.affectedType?.label ].join(' - ');
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

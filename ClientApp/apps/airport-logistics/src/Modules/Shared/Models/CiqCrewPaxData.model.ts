import {
  ApprovalStatus,
  IAPICiqCrewPaxDataRequest,
  IAPICiqCrewPaxIgnoredDataRequest,
  IAPILogisticsComponentRequest,
} from './../Interfaces/index';
import {
  ValueUnitPairModel,
  LogisticsComponentModel,
  CiqGeneralAviationTerminalModel,
  MainTerminalModel,
  CiqMainTerminalModel,
  VipAreaTerminalModel,
} from './index';
import { IAPICiqCrewPaxData } from '../Interfaces/index';
import { StatusModel } from './Status.model';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CiqCrewPaxDataModel extends StatusModel {
  subComponentId: number = null;
  crewPaxCustomsClearanceNoticeHours: number = null;
  advanceNoticeUnits: string = '';
  advanceNoticePair: ValueUnitPairModel;
  airportFacilities: LogisticsComponentModel[] = [];
  crewPaxOnBoardCustomsClearance: string = '';
  genDecAdditionalProcedures: LogisticsComponentModel[] = [];
  genDecAssistanceRequired: string = '';
  genDecFilePath: string = '';
  genDecRequired: string = '';
  generalAviationTerminal: CiqGeneralAviationTerminalModel;
  mainTerminal: MainTerminalModel;
  ciqMainTerminal: CiqMainTerminalModel;
  specificGenDecTypeRequired: string = '';
  vipAreaTerminal: VipAreaTerminalModel;

  constructor(data?: Partial<CiqCrewPaxDataModel>) {
    super();
    Object.assign(this, data);
    this.advanceNoticePair = new ValueUnitPairModel(data?.advanceNoticePair);
    this.generalAviationTerminal = new CiqGeneralAviationTerminalModel(data?.generalAviationTerminal);
    this.mainTerminal = new MainTerminalModel(data?.mainTerminal);
    this.ciqMainTerminal = new CiqMainTerminalModel(data?.ciqMainTerminal);
    this.vipAreaTerminal = new VipAreaTerminalModel(data?.vipAreaTerminal);
    this.status = data?.status || this.approvalStatus;
  }

  private get approvalStatus(): ApprovalStatus {
    return {
      advanceNoticePair: {
        isApproved: false,
        isIgnored: false,
      },
      airportFacilities: {
        isApproved: false,
        isIgnored: false,
      },
      crewPaxOnBoardCustomsClearance: {
        isApproved: false,
        isIgnored: false,
      },
      genDecAdditionalProcedures: {
        isApproved: false,
        isIgnored: false,
      },
      genDecAssistanceRequired: {
        isApproved: false,
        isIgnored: false,
      },
      genDecFilePath: {
        isApproved: false,
        isIgnored: false,
      },
      genDecRequired: {
        isApproved: false,
        isIgnored: false,
      },
      generalAviationTerminal: {
        isApproved: false,
        isIgnored: false,
      },
      mainTerminal: {
        isApproved: false,
        isIgnored: false,
      },
      ciqMainTerminal: {
        isApproved: false,
        isIgnored: false,
      },
      specificGenDecTypeRequired: {
        isApproved: false,
        isIgnored: false,
      },
      vipAreaTerminal: {
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  public get genDecRequiredLabel(): string {
    return this.getYesOrNoLabel(Boolean(this.genDecRequired));
  }

  public get specificGenDecTypeLabel(): string {
    return this.getYesOrNoLabel(Boolean(this.specificGenDecTypeRequired));
  }

  public get genDecAssistanceLabel(): string {
    return this.getYesOrNoLabel(Boolean(this.genDecAssistanceRequired));
  }

  public get crewPaxOnBoardCustomsClearanceLabel(): string {
    return this.getYesOrNoLabel(Boolean(this.crewPaxOnBoardCustomsClearance));
  }

  public get advanceNoticeLabel(): string {
    return this.crewPaxCustomsClearanceNoticeHours ? `${this.crewPaxCustomsClearanceNoticeHours} Hours` : '';
  }

  static deserialize(apiData: IAPICiqCrewPaxData): CiqCrewPaxDataModel {
    if (!apiData) {
      return new CiqCrewPaxDataModel();
    }

    const advanceNoticeValue = apiData.CrewPaxCustomsClearanceNoticeHours
      ? String(apiData.CrewPaxCustomsClearanceNoticeHours)
      : '';
    const data: Partial<CiqCrewPaxDataModel> = {
      subComponentId: apiData.SubComponentId,
      crewPaxCustomsClearanceNoticeHours: apiData.CrewPaxCustomsClearanceNoticeHours,
      advanceNoticeUnits: apiData.AdvanceNoticeUnit,
      advanceNoticePair: ValueUnitPairModel.deserialize(advanceNoticeValue, apiData.AdvanceNoticeUnit),
      airportFacilities: LogisticsComponentModel.deserializeList(apiData.AirportFacilities),
      genDecAdditionalProcedures: LogisticsComponentModel.deserializeList(apiData.GenDecAdditionalProcedures),
      crewPaxOnBoardCustomsClearance: apiData.CrewPaxOnBoardCustomsClearance,
      genDecAssistanceRequired: apiData.GenDecAssistanceRequired,
      genDecFilePath: apiData.GenDecFilePath,
      genDecRequired: apiData.GenDecRequired,
      generalAviationTerminal: CiqGeneralAviationTerminalModel.deserialize(apiData.GeneralAviationTerminal),
      mainTerminal: MainTerminalModel.deserialize(apiData.MainTerminal),
      ciqMainTerminal: CiqMainTerminalModel.deserialize(apiData.CIQMainTerminal),
      specificGenDecTypeRequired: apiData.SpecificGenDecTypeRequired,
      vipAreaTerminal: VipAreaTerminalModel.deserialize(apiData.VIPAreaTerminal),
    };

    return new CiqCrewPaxDataModel(data);
  }

  static getSubComponentIds(data: LogisticsComponentModel[]): IAPILogisticsComponentRequest[] {
    return data.length ? data?.map(({ subComponentId }) => { return { SubComponentId: subComponentId }}) : null;
  }

  static ApiModel(data: CiqCrewPaxDataModel, status: ApprovalStatus): IAPICiqCrewPaxDataRequest {
    return {
      AdvanceNoticeOnBoardCrewPaxCustClearnce: status['advanceNoticePair'].isApproved
        ? Number(data.advanceNoticePair.value)
        : null,
      AdvanceNoticeUnit: status['advanceNoticePair'].isApproved ? data.advanceNoticePair.unit : null,
      AirportFacilities: LogisticsComponentModel.ApiModels(
        data.airportFacilities,
        status['airportFacilities'].isApproved
      ),
      GenDecAdditionalProcedures: LogisticsComponentModel.ApiModels(
        data.genDecAdditionalProcedures,
        status['genDecAdditionalProcedures'].isApproved
      ),
      CrewPaxOnBoardCustomsClearance: status['crewPaxOnBoardCustomsClearance'].isApproved
        ? data.crewPaxOnBoardCustomsClearance
        : null,
      GenDecAssistanceRequired: status['genDecAssistanceRequired'].isApproved ? data.genDecAssistanceRequired : null,
      GenDecFilePath: status['genDecFilePath'].isApproved ? data.genDecFilePath : null,
      GenDecRequired: status['genDecRequired'].isApproved ? data.genDecRequired : null,
      GeneralAviationTerminal: CiqGeneralAviationTerminalModel.ApiModel(
        data.generalAviationTerminal,
        status['generalAviationTerminal'].isApproved
      ),
      MainTerminal: MainTerminalModel.ApiModel(data.mainTerminal, status['mainTerminal'].isApproved),
      CIQMainTerminal: CiqMainTerminalModel.ApiModel(data.ciqMainTerminal, status['ciqMainTerminal'].isApproved),
      SpecificGenDecTypeRequired: status['specificGenDecTypeRequired'].isApproved
        ? data.specificGenDecTypeRequired
        : null,
      VIPAreaTerminal: VipAreaTerminalModel.ApiModel(data.vipAreaTerminal, status['vipAreaTerminal'].isApproved),
    };
  }

  static ApiIgnoredModel(data: CiqCrewPaxDataModel, status: ApprovalStatus): IAPICiqCrewPaxIgnoredDataRequest {
    return {
      CrewPaxCustomsClearanceNoticeHours: status['advanceNoticePair'].isIgnored
        ? this.getNumberOrNullValue(data.crewPaxCustomsClearanceNoticeHours)
        : null,
      AirportFacilities: 
      status['airportFacilities'].isIgnored
        ?
        LogisticsComponentModel.ApiModels(
          data.airportFacilities,
          status['airportFacilities'].isIgnored
        )
        : null
      ,
      GenDecAdditionalProcedures: 
      status['genDecAdditionalProcedures'].isIgnored
        ?
        LogisticsComponentModel.ApiModels(
          data.genDecAdditionalProcedures,
          status['genDecAdditionalProcedures'].isIgnored
        )
        : null
      ,
      CrewPaxOnBoardCustomsClearance: status['crewPaxOnBoardCustomsClearance'].isIgnored
        ? Boolean(data.crewPaxOnBoardCustomsClearance)
        : null,
      GenDecAssistanceRequired: status['genDecAssistanceRequired'].isIgnored
        ? Boolean(data.genDecAssistanceRequired)
        : null,
      GenDecFilePath: status['genDecFilePath'].isIgnored ? data.genDecFilePath : null,
      GenDecRequired: status['genDecRequired'].isIgnored ? Boolean(data.genDecRequired) : null,
      GeneralAviationTerminal: CiqGeneralAviationTerminalModel.ApiModel(
        data.generalAviationTerminal,
        status['generalAviationTerminal'].isIgnored,
        true
      ),
      MainTerminal: MainTerminalModel.ApiModel(data.mainTerminal, status['mainTerminal'].isIgnored),
      CIQMainTerminal: CiqMainTerminalModel.ApiModel(data.ciqMainTerminal, status['ciqMainTerminal'].isIgnored),
      SpecificGenDecTypeRequired: status['specificGenDecTypeRequired'].isIgnored
        ? Boolean(data.specificGenDecTypeRequired)
        : null,
      VIPAreaTerminal: VipAreaTerminalModel.ApiModel(data.vipAreaTerminal, status['vipAreaTerminal'].isIgnored, true),
    };
  }
}

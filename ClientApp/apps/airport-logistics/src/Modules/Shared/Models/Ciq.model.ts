import {
  CoreModel,
  SurveyModel,
  CiqCrewPaxModel,
  CiqCrewPaxDataModel,
  CiqHandlerModel,
  OperatingHoursModel,
} from './index';
import { IAPICiq } from './../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CiqModel extends CoreModel {
  airportHandlerId: number = null;
  airportId: number = null;
  airportLogisticsStageId: number = null;
  ciqCrewPax: CiqCrewPaxModel;
  reviewStatus: string = '';
  surveyInfo: SurveyModel;

  constructor(data?: Partial<CiqModel>) {
    super();
    Object.assign(this, data);
    this.ciqCrewPax = new CiqCrewPaxModel(data?.ciqCrewPax);
    this.surveyInfo = new SurveyModel(data?.surveyInfo);
  }

  static deserialize(apiData: IAPICiq): CiqModel {
    if (!apiData) {
      return new CiqModel();
    }

    const data: Partial<CiqModel> = {
      airportHandlerId: apiData.AirportHandlerId,
      airportId: apiData.AirportId,
      airportLogisticsStageId: apiData.AirportLogisticsStageId,
      ciqCrewPax: CiqCrewPaxModel.deserialize(apiData.CIQCrewPax),
      reviewStatus: apiData.ReviewStatus,
      surveyInfo: SurveyModel.deserialize(apiData.SurveyInfo),
    };

    return new CiqModel(data);
  }

  private get unApproved(): CiqCrewPaxDataModel {
    return this.ciqCrewPax.airport.unApproved;
  }

  private get approved(): CiqCrewPaxDataModel {
    return this.ciqCrewPax.airport.approved;
  }

  private get handler(): CiqHandlerModel {
    return this.ciqCrewPax.handler;
  }

  private getHandlerStatus(key: string): any {
    return this.handler.unApproved.status[key];
  }

  private getHandlerOperatingHours(key: string, status: boolean, isIgnored: boolean = false) {
    const dataType = isIgnored ? this.handler.approved : this.handler.unApproved;
    return OperatingHoursModel.ApiModels(dataType[key].operatingHours, status, false);
  }

  private getHandlerData(key: string): object {
    const ignoreData = this.getHandlerIgnoredData(key);
    if (ignoreData) {
      return ignoreData;
    }
    const isApproved = this.getHandlerStatus(key).isApproved;
    if (!isApproved) {
      return null;
    }

    return {
      SubComponentId: this.getApprovedValue(this.handler.unApproved[key].subComponentId, isApproved),
      OperatingHours: this.getHandlerOperatingHours(key, isApproved),
    }
  }

  private getHandlerIgnoredData(key: string): object {
    const isIgnored = this.getHandlerStatus(key).isIgnored;
    if (!isIgnored) {
      return null;
    }

    return {
      SubComponentId: this.getApprovedValue(this.handler.unApproved[key].subComponentId, isIgnored),
      OperatingHours: this.getHandlerOperatingHours(key, false, true),
    }
  }

  public ApiModel(username: string): object {
    const response = {
      Stage: {
        CIQAirportLogistics: CiqCrewPaxDataModel.ApiModel(this.unApproved, this.unApproved.status),
        CIQAirportHandlerLogistics: {
          PrivateFBOOperatingHours: this.getHandlerData('privateFBOOperatingHours'),
          CIQHoursForGATOrFBO: this.getHandlerData('ciqHoursForGATOrFBO'),
        },
      },
      Ignored: {
        CIQAirportLogistics: CiqCrewPaxDataModel.ApiIgnoredModel(this.approved, this.unApproved.status),
      },
      CIQAirportLogisticsId: 1,
      AirportLogisticsStageId: this.airportLogisticsStageId,
      AirportHandlerId: this.airportHandlerId,
      AirportId: this.airportId,
      ApprovedUser: username,
    }
    return response;
  }
}


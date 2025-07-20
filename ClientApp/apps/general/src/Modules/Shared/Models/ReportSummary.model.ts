import { IAPIReportSummary } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';
import { Reports } from './Reports.model';

@modelProtection
export class ReportSummaryModel extends IdNameModel {
  appName: string = '';
  nameSpace: string = '';
  generatedOn: string = '';
  environmentName: string = '';
  reports: Reports[] = [];

  constructor(data?: Partial<ReportSummaryModel>) {
    super();
    Object.assign(this, data);
    this.reports = data?.reports?.map(x => new Reports(x)) || [];
  }

  static deserialize(reportSummary: IAPIReportSummary): ReportSummaryModel {
    if (!reportSummary) {
      return new ReportSummaryModel();
    }

    const data: Partial<ReportSummaryModel> = {
      appName: reportSummary.AppName,
      nameSpace: reportSummary.NameSpace,
      environmentName: reportSummary.EnvironmentName,
      generatedOn: reportSummary.GeneratedOn,
      reports: Reports.deserializeList(reportSummary.Reports),
    };

    return new ReportSummaryModel(data);
  }

  static deserializeList(reportSummary: IAPIReportSummary[]): ReportSummaryModel[] {
    return (
      reportSummary?.map((reportsSummary: IAPIReportSummary) => ReportSummaryModel.deserialize(reportsSummary)) || []
    );
  }
}

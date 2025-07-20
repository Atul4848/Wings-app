import { IAPIReport } from './IAPIReport';

export class IAPIReportSummary {
    AppName: string;
    NameSpace: string;
    GeneratedOn: string;
    EnvironmentName: string;
    Reports: IAPIReport[];
}
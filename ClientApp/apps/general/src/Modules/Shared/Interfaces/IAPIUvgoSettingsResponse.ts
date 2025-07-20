export interface IAPIUvgoSettingsResponse {
    Id: string;
    Name: string;
    Description: string;
    Area: string;
    AssemblyName: string;
    FullAssemblyInfo?: string;
    SettingType: string;
    IsEnabled: boolean;
    IsPublished: boolean;
    IsConnected?: boolean;
    LastConnectedOn?: string;
    CronExpression: string;
    Options: string;
}
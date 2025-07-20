import { IAPICacheSettingOption } from './IAPICacheSettingOption';

export interface IAPICacheSettingResponse {
    Key: string;
    Name: string;
    Details: string;
    IsEnabled: boolean;
    Options: IAPICacheSettingOption[];
}
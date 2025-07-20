import { LogisticsComponentModel } from './LogisticsComponent.model';
import moment from 'moment';
const emptyLabel: string = '—';

export class CoreModel {
  public capitalize(value: string): string {
    if (!value) {
      return '';
    }

    return value
      .toLowerCase()
      .replace(/\b\w/g, (letter: string) => letter.toUpperCase())
      .trim();
  }

  public removeWhiteSpace(value: string): string {
    if (!value) {
      return '';
    }

    return value
      .trim();
  }

  public isInteger(value: string | number): boolean {
    const numericValue: number = typeof value === 'number'
      ? value
      : parseFloat(value as string);

    return Number.isFinite(numericValue) && !(numericValue % 1);
  }

  public getTempId(): string {
    return Math.random()
      .toString(36)
      .substr(2, 12);
  }

  public getTimeAgo(timeString: string): string {
    const date: moment.Moment = moment(timeString);

    return date.isValid()
      ? date.fromNow()
      : null;
  }

  public boolean2string(value: boolean): string {
    return value ? 'YES' : 'NO';
  }

  public placeholderProtected(value: any, placeholder: string = emptyLabel): string {
    return value ? value : placeholder;
  }

  public getformattedDate(date: string, format?: string): string {
    if (!date) {
      return emptyLabel;
    }

    const displayFormat = format || 'DD-MMM-YYYY';
    const momentDate: moment.Moment = moment(date, moment.defaultFormat);

    return momentDate.isValid()
      ? momentDate.format(displayFormat)
      : '';
  }

  public getFormattedTime(value: string, format: string = 'HH:mm'): string {
    if (!value) {
      return '';
    }
    return moment(value, format).format(format);
  }

  public getSubComponentIds(data: LogisticsComponentModel[]): { [key: string]: number }[] {
    return data.length ? data?.map(({ subComponentId }) => { return { 'SubComponentId': subComponentId } }) : null;
  }

  public getIgnoredValue(data: any, isIgnored: boolean, hasIds: boolean = false): any {
    if (!data) {
      return null;
    }
    const formattedData: any = hasIds
      ? this.getSubComponentIds(data)
      : data;
    return isIgnored
      ? formattedData
      : null;
  }

  public getApprovedValue(data: any, isApproved: boolean, hasIds: boolean = false): any {
    if (!data) {
      return null;
    }
    const formattedData: any = hasIds
      ? this.getSubComponentIds(data)
      : data;
    return isApproved
      ? formattedData
      : null;
  }

  public getYesOrNoLabel(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  public getYesOrNoOrValueLabel(value: boolean | string): string {
    if (typeof (value) === 'boolean') {
      return this.getYesOrNoLabel(value);
    }
    return value;
  }

  static getIsTrueValue(value: string): boolean {
    return value.toLocaleLowerCase() === 'yes';
  }

  public static getNumberOrNullValue(value: string | number): number | null {
    return value ? Number(value) : null;
  }
}

import {
  IAPIPermit,
  IAPIPermitAdditionalInfo,
  IAPIPermitApplied,
  IAPIPermitAppliedRequest,
  IAPIPermitRequest,
} from '../Interfaces';
import { CountryModel } from '@wings/shared';
import {
  CoreModel,
  modelProtection,
  regex,
  Utilities,
  SettingsTypeModel,
  EntityMapModel,
} from '@wings-shared/core';
import {
  PermitAppliedModel,
  PermitExceptionRuleModel,
  PermitLeadTimeModel,
  RouteExtensionModel,
  PermitDocumentModel,
} from '../Models';
import { PermitAdditionalInfoModel } from './PermitAdditionalInfo.model';
@modelProtection
export class PermitModel extends CoreModel {
  isRequired: boolean = false;
  isException: boolean = false;
  exception: string = '';
  permitApplieds: PermitAppliedModel[] = [];
  country: CountryModel;
  permitType: SettingsTypeModel;
  permitApplied: PermitAppliedModel;
  permitExceptionRules: PermitExceptionRuleModel[];
  permitLeadTimes: PermitLeadTimeModel[];
  permitAdditionalInfo: PermitAdditionalInfoModel;
  permitRouteAirwayExtensions: RouteExtensionModel[] = [];
  hasRouteOrAirwayExtension: boolean = false;
  permitDocuments: PermitDocumentModel[];
  permitRequiredElements: EntityMapModel[];

  constructor(data?: Partial<PermitModel>) {
    super(data);
    Object.assign(this, data);
    this.id = data?.id || 0;
    this.permitApplied = new PermitAppliedModel(data?.permitApplied);
    this.permitExceptionRules =
      data?.permitExceptionRules?.map((a: PermitExceptionRuleModel) => new PermitExceptionRuleModel(a)) || [];
    this.permitLeadTimes =
      data?.permitLeadTimes?.map((model: PermitLeadTimeModel) => new PermitLeadTimeModel(model)) || [];
    this.permitAdditionalInfo = new PermitAdditionalInfoModel(data?.permitAdditionalInfo);

    this.permitDocuments = data?.permitDocuments?.map((a: PermitDocumentModel) => new PermitDocumentModel(a)) || [];
    this.permitRequiredElements = data?.permitRequiredElements?.map(element => new EntityMapModel(element)) || [];
  }

  static deserialize(apiPermit: IAPIPermit): PermitModel {
    if (!apiPermit) {
      return new PermitModel();
    }

    let permitApplied: IAPIPermitApplied = null;
    if (Array.isArray(apiPermit?.permitApplieds) && apiPermit?.permitApplieds.length) {
      //For Now need to get only first object from array
      permitApplied = apiPermit.permitApplieds[0];
    }

    return new PermitModel({
      ...apiPermit,
      ...CoreModel.deserializeAuditFields(apiPermit),
      id: apiPermit.permitId || apiPermit.id,
      permitApplied: PermitAppliedModel.deserialize(permitApplied),
      permitType: SettingsTypeModel.deserialize({
        ...apiPermit?.permitType,
        id: apiPermit?.permitType?.permitTypeId,
      }),
      permitApplieds: PermitAppliedModel.deserializeList(apiPermit.permitApplieds),
      country: new CountryModel({
        id: apiPermit?.country?.countryId,
        commonName: apiPermit?.country?.name,
        isO2Code: apiPermit?.country?.code,
      }),
      permitExceptionRules: PermitExceptionRuleModel.deserializeList(apiPermit?.permitExceptionRules),
      permitAdditionalInfo: PermitAdditionalInfoModel.deserialize(apiPermit.permitAdditionalInfo),
      permitLeadTimes: PermitLeadTimeModel.deserializeList(apiPermit?.leadTimes),
      permitRouteAirwayExtensions: RouteExtensionModel.deserializeList(apiPermit?.permitRouteAirwayExtensions),
      hasRouteOrAirwayExtension: apiPermit?.hasRouteOrAirwayExtension,
      permitDocuments: PermitDocumentModel.deserializeList(apiPermit?.permitDocuments),
      permitRequiredElements: apiPermit.permitRequiredElements?.map(
        entity =>
          new EntityMapModel({
            id: entity.id,
            entityId: entity.element?.elementId || entity.element?.id,
            name: entity.element?.name,
          })
      ),
    });
  }

  public get permitTitle(): string {
    return `${this.country?.label || 'Country'} - ${this.permitType?.label || 'Permit Type'}`;
  }

  static deserializeList(apiPermitList: IAPIPermit[]): PermitModel[] {
    return apiPermitList ? apiPermitList.map((apiPermit: IAPIPermit) => PermitModel.deserialize(apiPermit)) : [];
  }

  // serialize object for create/update API
  public serialize(): IAPIPermitRequest {
    return {
      id: this.id,
      countryId: this.country?.id,
      countryCode: this.country?.isO2Code,
      isRequired: this.isRequired,
      isException: this.isException,
      exception: this.exceptionText,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id,
      permitTypeId: this.permitType?.id,
      permitApplieds: this.permitsAppliedRequest,
      permitExceptionRules: this.permitExceptionRules?.map((exceptionRule: PermitExceptionRuleModel) => ({
        ...exceptionRule.serialize(),
      })),
      leadTimes: this.permitLeadTimes?.map((model: PermitLeadTimeModel) => model.serialize(this.id)),
      permitAdditionalInfo: this.permitAdditionalInfoRequest,
      permitRouteAirwayExtensions: this.permitRouteAirwayExtensions?.map(extension => extension.serialize()),
      hasRouteOrAirwayExtension: this.hasRouteOrAirwayExtension,
      permitDocuments: this.permitDocuments?.map(document => document.serialize()),
      permitRequiredElements: this.permitRequiredElements?.map(element => element.entityId),
    };
  }

  public get permitsAppliedRequest(): IAPIPermitAppliedRequest[] {
    if (!this.permitApplied?.permitAppliedTo?.id) {
      return [];
    }

    return [
      {
        ...this.permitApplied.serialize(),
        permitId: this.id,
      },
    ];
  }

  public get permitAdditionalInfoRequest(): IAPIPermitAdditionalInfo {
    return {
      ...this.permitAdditionalInfo.serialize(),
      permitId: this.id,
    };
  }

  public get exceptionText(): string {
    if (this.exception) {
      const stripedText: string = this.exception.replace(regex.stripedHTML, '');
      return Boolean(stripedText.trim()) ? this.exception : '';
    }

    return this.exception;
  }

  public get hasInValidPermitExceptionRules(): boolean {
    if (!Boolean(this.permitExceptionRules?.length)) {
      return false;
    }

    return this.permitExceptionRules.some(
      (exception: PermitExceptionRuleModel) =>
        !Boolean(exception.name) ||
        !regex.all.test(exception.name) ||
        this.isRuleNameAlreadyExists(exception.tempId, exception.name) ||
        exception.hasInvalidRuleFilter
    );
  }

  public get permitExceptionRuleObject(): object {
    return this.permitExceptionRules.reduce<object>((exceptionObj: object, currentValue: PermitExceptionRuleModel) => {
      return currentValue.ruleFiltersObject(exceptionObj);
    }, {});
  }

  public isRuleNameAlreadyExists(exceptionRuleTempId: number, value: string): boolean {
    return this.permitExceptionRules?.some(
      (rule: PermitExceptionRuleModel) =>
        rule.tempId !== exceptionRuleTempId && Utilities.isEqual(rule.name?.trim(), value?.trim())
    );
  }

  public get hasException(): boolean {
    return Boolean(this.isException) && this.hasExceptionTextOrRuleExists;
  }

  public get hasExceptionTextOrRuleExists(): boolean {
    return Boolean(this.exceptionText) || Boolean(this.permitExceptionRules.length);
  }

  public get exceptionTooltipText(): string {
    if (this.hasException) {
      return 'To un-check it please remove exception text and Exception Rule.';
    }
    return '';
  }

  public get exceptionAlertText(): string {
    let alertText: string = '';

    if (!Boolean(this.exceptionText)) {
      alertText = 'Please Add exception Text';
    }

    if (!Boolean(this.permitExceptionRules.length)) {
      alertText = alertText.concat(
        !Boolean(alertText) ? 'Please Add Permit Exception Rule.' : ' and Permit Exception Rule.'
      );
    }

    return alertText;
  }
}

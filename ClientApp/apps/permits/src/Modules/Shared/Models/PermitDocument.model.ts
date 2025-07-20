import {
  modelProtection,
  CoreModel,
  IdNameCodeModel,
  getYesNoNullBoolean,
  getStringToYesNoNull,
  SelectOption,
  getYesNoNullToBoolean,
  SettingsTypeModel,
  Utilities,
  EntityMapModel,
} from '@wings-shared/core';
import { IAPIDocumentRequest, IAPIPermitDocument } from '../Interfaces';
import { PermitDocumentFarTypeModel } from './PermitDocumentFarType.model';
import { PermitDocumentRuleValueModel } from './PermitDocumentRuleValue.model';

@modelProtection
export class PermitDocumentModel extends CoreModel {
  document: IdNameCodeModel;
  permitId: number;
  isApplicableToAllFarTypes: SelectOption | boolean;
  oracleModifiedDate: string;
  permitDocumentFarType: PermitDocumentFarTypeModel[];
  permitDocumentId: number;
  //134806 Additional field
  ruleEntityType: SettingsTypeModel;
  ruleField: SettingsTypeModel;
  ruleConditionalOperator: SettingsTypeModel;
  ruleValues: PermitDocumentRuleValueModel[];
  appliedPermitClassifications: EntityMapModel[];
  appliedPermitDocumentAirports: EntityMapModel[];
  appliedPermitDocumentStates: EntityMapModel[];

  constructor(data?: Partial<PermitDocumentModel>) {
    super(data);
    Object.assign(this, data);
    this.id = data?.id || 0;
    this.document = new IdNameCodeModel(data?.document);
    this.permitDocumentFarType =
      data?.permitDocumentFarType?.map((a: PermitDocumentFarTypeModel) => new PermitDocumentFarTypeModel(a)) || [];
    this.appliedPermitClassifications =
      data?.appliedPermitClassifications?.map(element => new EntityMapModel(element)) || [];
    this.appliedPermitDocumentAirports =
      data?.appliedPermitDocumentAirports?.map(element => new EntityMapModel(element)) || [];
    this.appliedPermitDocumentStates =
      data?.appliedPermitDocumentStates?.map(element => new EntityMapModel(element)) || [];
    this.ruleValues =
      data?.ruleValues?.map((a: PermitDocumentRuleValueModel) => new PermitDocumentRuleValueModel(a)) || [];
  }

  static deserialize(apiData: IAPIPermitDocument): PermitDocumentModel {
    if (!apiData) {
      return new PermitDocumentModel();
    }
    const data: Partial<PermitDocumentModel> = {
      ...apiData,
      id: apiData.id || apiData?.permitDocumentId,
      document: IdNameCodeModel.deserialize({
        ...apiData.document,
        id: apiData.document?.documentId,
        code: apiData.document?.code,
        name: apiData.document?.name,
      }),
      permitId: apiData.permitId,
      isApplicableToAllFarTypes: new SelectOption({
        value: getYesNoNullBoolean(apiData?.isApplicableToAllFarTypes),
        name: getStringToYesNoNull(apiData?.isApplicableToAllFarTypes),
      }),
      oracleModifiedDate: apiData.oracleModifiedDate,
      permitDocumentFarType: PermitDocumentFarTypeModel.deserializeList(apiData.permitDocumentFarType),
      //134806 Additional field
      ruleConditionalOperator: SettingsTypeModel.deserialize({
        ...apiData?.ruleConditionalOperator,
        id: apiData?.ruleConditionalOperator?.ruleConditionalOperatorId || apiData?.ruleConditionalOperator?.id,
      }),
      ruleEntityType: SettingsTypeModel.deserialize({
        ...apiData?.ruleEntityType,
        id: apiData?.ruleEntityType?.ruleEntityTypeId || apiData?.ruleEntityType?.id,
      }),
      ruleField: SettingsTypeModel.deserialize({
        id: Utilities.getTempId(true),
        name: apiData?.propertyName,
      }),
      appliedPermitClassifications: apiData.appliedPermitClassifications?.map(
        entity =>
          new EntityMapModel({
            id: entity.appliedPermitClassificationId,
            entityId: entity.permitClassification?.permitClassificationId || entity.permitClassification?.id,
            name: entity.permitClassification?.name,
          })
      ),
      appliedPermitDocumentAirports: apiData.appliedPermitDocumentAirports?.map(
        entity =>
          new EntityMapModel({
            id: entity.appliedPermitDocumentAirportId,
            entityId: entity.airportId || entity.id,
            name: entity.airportName,
            code: entity.airportCode,
          })
      ),
      appliedPermitDocumentStates: apiData.appliedPermitDocumentStates?.map(
        entity =>
          new EntityMapModel({
            id: entity.appliedPermitDocumentStateId,
            entityId: entity.stateId || entity.id,
            name: entity.name,
            code: entity.code,
          })
      ),
      ruleValues: PermitDocumentRuleValueModel.deserializeList(apiData?.ruleValues),
    };

    return new PermitDocumentModel(data);
  }

  static deserializeList(apiData: IAPIPermitDocument[]): PermitDocumentModel[] {
    return apiData ? apiData.map((apiData: IAPIPermitDocument) => PermitDocumentModel.deserialize(apiData)) : [];
  }

  public get hasInOperator(): boolean {
    return Utilities.isEqual(this.ruleConditionalOperator?.name, 'In');
  }

  public get hasNotInOperator(): boolean {
    return Utilities.isEqual(this.ruleConditionalOperator?.name, 'NotIn');
  }

  public serialize(): IAPIDocumentRequest {
    return {
      id: this.id || 0,
      documentId: this.document.id,
      permitId: this.permitId,
      isApplicableToAllFarTypes:
        typeof this.isApplicableToAllFarTypes === 'boolean'
          ? this.isApplicableToAllFarTypes
          : getYesNoNullToBoolean((this.isApplicableToAllFarTypes as SelectOption)?.label),
      oracleModifiedDate: this.oracleModifiedDate,
      permitDocumentFarTypeIds: this.permitDocumentFarType.map(x => (x?.farType?.value as number) ?? (x.id as number)),
      //134806 Additional field
      propertyName: this.ruleField?.name,
      ruleConditionalOperatorId: this.ruleConditionalOperator?.id,
      ruleEntityTypeId: this.ruleEntityType?.id,
      ruleValues: this.ruleValues?.map((ruleData: PermitDocumentRuleValueModel) => ({
        id: ruleData.id || 0,
        ruleValue: ruleData.ruleValue,
        code: ruleData.code,
      })),
      appliedPermitClassifications: this.appliedPermitClassifications?.map(classification => ({
        id: classification.id || 0,
        permitClassificationId: classification.entityId,
      })),
      appliedPermitDocumentAirports: this.appliedPermitDocumentAirports?.map(airportDocument => ({
        id: airportDocument.id || 0,
        airportId: airportDocument.entityId,
        airportCode: airportDocument.code,
        airportName: airportDocument.name,
      })),
      appliedPermitDocumentStates: this.appliedPermitDocumentStates?.map(stateDocument => ({
        id: stateDocument.id || 0,
        stateId: stateDocument.entityId,
        code: stateDocument.code,
        name: stateDocument.name,
      })),
    };
  }
}

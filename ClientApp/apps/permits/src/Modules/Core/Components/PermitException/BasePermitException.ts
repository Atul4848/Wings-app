import { AirportModel, CountryModel, StateModel, FARTypeModel, FIRModel } from '@wings/shared';
import {
  AerodromeReferenceCodeModel,
  PermitExceptionRuleModel,
  PermitModel,
  PermitSettingsStore,
  PermitStore,
  PERMIT_RULE_SOURCES,
  RuleEntityParameterConfigModel,
  RuleFilterModel,
  RuleValueModel,
} from '../../../Shared';
import { IOptionValue, Utilities, SettingsTypeModel, IdNameCodeModel } from '@wings-shared/core';

interface BaseProps {
  permitModel: PermitModel;
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
  onUpdatePermitModel: (updatedPermitModel: PermitModel) => void;
}

export const BasePermitException = ({
  permitModel,
  permitStore,
  permitSettingsStore,
  onUpdatePermitModel,
}: BaseProps) => {
  /* istanbul ignore next */
  const exceptionRules = (): PermitExceptionRuleModel[] => {
    return permitModel.permitExceptionRules || [];
  };

  /* istanbul ignore next */
  const _permitStore = permitStore as PermitStore;
  /* istanbul ignore next */
  const _permitSettingsStore = permitSettingsStore as PermitSettingsStore;

  /* istanbul ignore next */
  const defaultExceptionRuleTemplate = (): PermitExceptionRuleModel[] => {
    return [ new PermitExceptionRuleModel({ ruleFilters: [ new RuleFilterModel() ] }) ];
  };

  /* istanbul ignore next */
  const getUpdatedRuleFilters = (
    exceptionRuleFilters: RuleFilterModel[],
    ruleFilter: RuleFilterModel
  ): RuleFilterModel[] => {
    return Utilities.updateArray(exceptionRuleFilters, ruleFilter, {
      replace: true,
      predicate: t => t.tempId === ruleFilter.tempId,
    });
  };

  /* istanbul ignore next */
  const getRuleBasedValue = <IOptionValue, K extends IOptionValue>(
    value: IOptionValue | IOptionValue[],
    codePropertyName: string,
    valuePropertyName: string = 'id'
  ): RuleValueModel[] => {
    if (!Boolean(value) || (Array.isArray(value) && !Boolean(value.length))) {
      return [];
    }

    let values: K[] = [];
    if (Array.isArray(value) && Boolean(value.length)) {
      values = value as K[];
    }

    if (!Array.isArray(value) && typeof value === 'object') {
      values = [ value as K ];
    }

    return values.map(
      value =>
        new RuleValueModel({
          name: value[codePropertyName],
          code: value[codePropertyName],
          ruleValue: value[valuePropertyName],
        })
    );
  };

  /* istanbul ignore next */
  const getExceptionRuleValues = (
    entityParamConfig: RuleEntityParameterConfigModel,
    value: IOptionValue | IOptionValue[],
    hasInOperator?: boolean
  ): RuleValueModel[] => {
    switch (entityParamConfig?.apiSource) {
      case PERMIT_RULE_SOURCES.Country:
        return getRuleBasedValue<IOptionValue, CountryModel>(value, 'isO2Code');
      case PERMIT_RULE_SOURCES.FARType:
        return getRuleBasedValue<IOptionValue, FARTypeModel>(value, 'cappsCode');
      case PERMIT_RULE_SOURCES.Airport:
        return getRuleBasedValue<IOptionValue, AirportModel>(value, 'displayCode', 'displayCode');
      case PERMIT_RULE_SOURCES.State:
        return getRuleBasedValue<IOptionValue, StateModel>(value, 'entityCode');
      case PERMIT_RULE_SOURCES.ICAOAerodromeReferenceCode:
        return getRuleBasedValue<IOptionValue, AerodromeReferenceCodeModel>(value, 'code');
      case PERMIT_RULE_SOURCES.FIR:
        return getRuleBasedValue<IOptionValue, FIRModel>(value, 'code');
      case PERMIT_RULE_SOURCES.AirportOfEntry_AOE:
        return getRuleBasedValue<IOptionValue, IdNameCodeModel>(value, 'name');
      case PERMIT_RULE_SOURCES.PurposeOfFlight:
      case PERMIT_RULE_SOURCES.NoiseChapter:
      case PERMIT_RULE_SOURCES.Region:
      case PERMIT_RULE_SOURCES.AircraftCategory:
      case PERMIT_RULE_SOURCES.CrossingType:
        return getRuleBasedValue<IOptionValue, SettingsTypeModel>(value, 'name');
      default:
        if (entityParamConfig?.isDropDown) {
          return getRuleBasedValue<IOptionValue, RuleValueModel>(value, '', 'name');
        }
        if (hasInOperator) {
          return getRuleBasedValue<IOptionValue, RuleValueModel>(value, 'label', 'label');
        }
        return Boolean(value?.toString().trim()) ? [ new RuleValueModel({ ruleValue: value.toString() }) ] : [];
    }
  };

  /* istanbul ignore next */
  const updateExceptionRulesModel = (exceptionRules: PermitExceptionRuleModel[]): void => {
    onUpdatePermitModel(
      new PermitModel({
        ...permitModel,
        permitExceptionRules: [ ...exceptionRules ],
      })
    );
  };

  return {
    exceptionRules,
    defaultExceptionRuleTemplate,
    getUpdatedRuleFilters,
    getExceptionRuleValues,
    updateExceptionRulesModel,
    _permitSettingsStore,
    _permitStore,
  };
};

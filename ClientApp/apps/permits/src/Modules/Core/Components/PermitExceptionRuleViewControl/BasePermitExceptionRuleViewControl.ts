import {
  PermitExceptionRuleModel,
  PermitSettingsStore,
  PermitStore,
  PERMIT_RULE_SOURCES,
  RuleEntityParameterConfigModel,
  RuleFilterModel,
  RuleValueModel,
  LogicalOperators,
  BooleanOperators,
} from '../../../Shared';
import { IOptionValue, Utilities, SettingsTypeModel, ISelectOption } from '@wings-shared/core';
import { EDITOR_TYPES, IViewInputControl } from '@wings-shared/form-controls';

interface IRuleProps {
  id: number;
  [key: string]: string | number;
}

interface BaseProps extends IViewInputControl {
  exceptionRules?: PermitExceptionRuleModel[];
  exceptionRuleTempId?: number;
  ruleFilter?: RuleFilterModel;
  value?: IOptionValue;
  hasError?: boolean;
  permitSettingsStore?: PermitSettingsStore;
  permitStore?: PermitStore;
}

/* istanbul ignore next */
export const BasePermitExceptionRuleViewControl = ({
  permitStore,
  permitSettingsStore,
  exceptionRules,
  exceptionRuleTempId,
  ruleFilter,
  value,
  hasError,
  ...props
}: BaseProps) => {
  const _permitStore = permitStore as PermitStore;
  const _permitSettingsStore = permitSettingsStore as PermitSettingsStore;

  const isAlreadyExists = (): boolean => {
    switch (props.fieldKey) {
      case 'name':
        return (exceptionRules as PermitExceptionRuleModel[]).some(
          rule => rule.tempId !== exceptionRuleTempId && Utilities.isEqual(rule.name, value as string)
        );
      default:
        return false;
    }
  };

  const hasMultiple = (): boolean => {
    if (props.fieldKey === 'ruleValues' && Boolean(ruleFilter)) {
      return Boolean(ruleFilter?.hasInOperator || ruleFilter?.hasNotInOperator);
    }
    return false;
  };

  const inputEditorType = (): EDITOR_TYPES => {
    const { fieldKey, type } = props;
    switch (fieldKey) {
      case 'ruleValues':
        const entityParamConfig = _permitSettingsStore.getSelectedEntityParamConfig(ruleFilter as RuleFilterModel);
        return Boolean(entityParamConfig?.isDropDown) ? EDITOR_TYPES.DROPDOWN : (type as EDITOR_TYPES);
      default:
        return type as EDITOR_TYPES;
    }
  };

  const inputOptions = (): ISelectOption[] => {
    const { fieldKey } = props;
    switch (fieldKey) {
      case 'permitRequirementType':
        return _permitSettingsStore.permitRequirementTypes;
      case 'ruleLogicalOperator':
        return LogicalOperators;
      case 'ruleEntityType':
        return _permitSettingsStore.ruleEntities;
      case 'ruleField':
        return getRuleFieldOptions(ruleFilter?.ruleEntityType);
      case 'ruleConditionalOperator':
        return getRuleOperatorOptions(ruleFilter.ruleEntityType, ruleFilter.ruleField);
      case 'ruleValues':
        const entityParamConfig = _permitSettingsStore.getSelectedEntityParamConfig(ruleFilter);
        if (entityParamConfig?.isDropDown) {
          return getPermitRuleSourceData(entityParamConfig?.apiSource);
        }
        return [];
      default:
        return [];
    }
  };

  const getPermitRuleSourceData = (source: PERMIT_RULE_SOURCES): ISelectOption[] => {
    switch (source) {
      case PERMIT_RULE_SOURCES.Country:
        return _permitStore.countries;
      case PERMIT_RULE_SOURCES.FARType:
        return _permitSettingsStore.farTypes;
      case PERMIT_RULE_SOURCES.Airport:
        return _permitStore.wingsAirports;
      case PERMIT_RULE_SOURCES.PurposeOfFlight:
        return _permitSettingsStore.flightPurposes;
      case PERMIT_RULE_SOURCES.NoiseChapter:
        return _permitSettingsStore.noiseChapters;
      case PERMIT_RULE_SOURCES.State:
        return _permitStore.states;
      case PERMIT_RULE_SOURCES.Region:
        return _permitStore.regions;
      case PERMIT_RULE_SOURCES.FIR:
        return _permitStore.firs;
      case PERMIT_RULE_SOURCES.ICAOAerodromeReferenceCode:
        return _permitStore.aerodromeReferenceCodes;
      case PERMIT_RULE_SOURCES.AircraftCategory:
        return _permitStore.aircraftCategories;
      case PERMIT_RULE_SOURCES.CrossingType:
        return _permitSettingsStore.crossingTypes;
      case PERMIT_RULE_SOURCES.AirportOfEntry_AOE:
        return _permitStore.airportOfEntries;
      default:
        return BooleanOperators;
    }
  };

  const getRuleFieldOptions = (entity: SettingsTypeModel): ISelectOption[] => {
    return (
      _permitSettingsStore.ruleEntityParameterConfigs
        .filter(({ ruleEntityType }: RuleEntityParameterConfigModel) =>
          Utilities.isEqual(ruleEntityType.name, entity?.name)
        )
        .map(
          (entityParamConfig: RuleEntityParameterConfigModel) =>
            new SettingsTypeModel({ id: entityParamConfig.id, name: entityParamConfig.entityParameter })
        ) || []
    );
  };

  const getRuleOperatorOptions = (entity: SettingsTypeModel, field: SettingsTypeModel): ISelectOption[] => {
    const operators: SettingsTypeModel[] =
      _permitSettingsStore.ruleEntityParameterConfigs.find(
        ({ ruleEntityType, entityParameter }: RuleEntityParameterConfigModel) =>
          Utilities.isEqual(ruleEntityType.name, entity?.name) && Utilities.isEqual(entityParameter, field?.name)
      )?.supportedOperators || [];
    return Utilities.customArraySort<SettingsTypeModel>(operators, 'name');
  };

  const getRuleValueId = ({ ruleValue }: RuleValueModel): number => {
    return Utilities.getNumberOrNullValue(ruleValue) as number;
  };

  const getModelBasedRuleValues = <T>(
    TModel: new (...args: IRuleProps[]) => T,
    propertyName: string,
    ruleValues: RuleValueModel[]
  ): T | T[] => {
    if (hasMultiple()) {
      return ruleValues.map(
        (rule: RuleValueModel) => new TModel({ id: getRuleValueId(rule), [propertyName]: rule.code })
      );
    }
    return new TModel({
      id: getRuleValueId(ruleValues[0]),
      [propertyName]: ruleValues[0].code,
    });
  };

  return {
    isAlreadyExists,
    getModelBasedRuleValues,
    inputOptions,
    inputEditorType,
    hasMultiple,
    _permitSettingsStore,
    _permitStore,
  };
};

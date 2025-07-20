import React, { FC, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import {
  AerodromeReferenceCodeModel,
  BooleanOperators,
  PERMIT_RULE_SOURCES,
  PermitExceptionRuleModel,
  PermitSettingsStore,
  PermitStore,
  RuleEntityParameterConfigModel,
  RuleFilterModel,
  RuleValueModel,
} from '../../../Shared';
import {
  IClasses,
  IOptionValue,
  ISelectOption,
  IdNameCodeModel,
  IdNameModel,
  SettingsTypeModel,
  Utilities,
} from '@wings-shared/core';
import { Chip } from '@material-ui/core';
import { ChipInputControl, EDITOR_TYPES, IViewInputControl, ViewInputControl } from '@wings-shared/form-controls';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import { useStyles } from './PermitExceptionRuleViewControl.styles';
import { BasePermitExceptionRuleViewControl } from './BasePermitExceptionRuleViewControl';
import { AirportModel, CountryModel, FARTypeModel, FIRModel, StateModel } from '@wings/shared';
import { SecondaryButton } from '@uvgo-shared/buttons';
import classNames from 'classnames';

interface Props extends IViewInputControl {
  exceptionRules?: PermitExceptionRuleModel[];
  exceptionRuleTempId?: number;
  ruleFilter?: RuleFilterModel;
  value?: IOptionValue;
  permitSettingsStore?: PermitSettingsStore;
  permitStore?: PermitStore;
  errors: IdNameModel<string>[];
  classes: IClasses
}

const PermitExceptionRuleViewControl: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const {
    isAlreadyExists,
    getModelBasedRuleValues,
    inputOptions,
    inputEditorType,
    hasMultiple,
    _permitSettingsStore,
    _permitStore,
  } = BasePermitExceptionRuleViewControl({
    ...props,
  });

  const viewRenderer = (ruleValues: ISelectOption[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    return ruleValues.map((ruleData: ISelectOption, index: number) => (
      <Chip
        classes={{ root: classes?.chip }}
        key={ruleData.value as string}
        label={ruleData.label}
        {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
      />
    ));
  };

  /* istanbul ignore next */
  const inputValue = (): IOptionValue | IOptionValue[] | null => {
    const { fieldKey, value } = props;
    const ruleFilter = props.ruleFilter as RuleFilterModel;
    const entityParamConfig = _permitSettingsStore.getSelectedEntityParamConfig(ruleFilter);

    switch (fieldKey) {
      case 'permitRequirementType':
        return value || null;
      case 'ruleLogicalOperator':
        const { ruleLogicalOperator } = ruleFilter;
        return Boolean(ruleLogicalOperator?.id) ? ruleLogicalOperator : null;
      case 'name':
        return value || '';
      case 'ruleField':
        if (entityParamConfig) {
          return new SettingsTypeModel({ id: entityParamConfig.id, name: entityParamConfig.entityParameter });
        }

        return null;
      case 'ruleValues':
        const { ruleValues } = ruleFilter;
        if (!Boolean(ruleValues?.length) || !Boolean(entityParamConfig)) {
          return hasMultiple() ? [] : null;
        }

        const { apiSource, isDropDown } = entityParamConfig;
        switch (apiSource) {
          case PERMIT_RULE_SOURCES.Country:
            return getModelBasedRuleValues<CountryModel>(CountryModel, 'isO2Code', ruleValues);
          case PERMIT_RULE_SOURCES.FARType:
            return getModelBasedRuleValues<FARTypeModel>(FARTypeModel, 'cappsCode', ruleValues);
          case PERMIT_RULE_SOURCES.Airport:
            if (hasMultiple()) {
              return getModelBasedRuleValues<AirportModel>(AirportModel, 'displayCode', ruleValues);
            }
            return ruleValues[0];
          case PERMIT_RULE_SOURCES.State:
            if (hasMultiple()) {
              return getModelBasedRuleValues<StateModel>(StateModel, 'isoCode', ruleValues);
            }
            return ruleValues[0];
          case PERMIT_RULE_SOURCES.FIR:
            return getModelBasedRuleValues<FIRModel>(FIRModel, 'code', ruleValues);
          case PERMIT_RULE_SOURCES.ICAOAerodromeReferenceCode:
            return getModelBasedRuleValues<AerodromeReferenceCodeModel>(
              AerodromeReferenceCodeModel,
              'code',
              ruleValues
            );
          case PERMIT_RULE_SOURCES.AirportOfEntry_AOE:
            return getModelBasedRuleValues<IdNameCodeModel>(IdNameCodeModel, 'name', ruleValues);
          case PERMIT_RULE_SOURCES.PurposeOfFlight:
          case PERMIT_RULE_SOURCES.NoiseChapter:
          case PERMIT_RULE_SOURCES.Region:
          case PERMIT_RULE_SOURCES.AircraftCategory:
          case PERMIT_RULE_SOURCES.CrossingType:
            return getModelBasedRuleValues<SettingsTypeModel>(SettingsTypeModel, 'name', ruleValues);
          default:
            if (isDropDown && !Boolean(apiSource)) {
              return BooleanOperators.find(operator => operator.label === ruleValues[0].ruleValue) || null;
            }

            if (!hasMultiple() && inputEditorType() === EDITOR_TYPES.TEXT_FIELD) {
              return ruleValues[0].ruleValue;
            }

            return hasMultiple() ? ruleValues : ruleValues[0];
        }
      default:
        return (Boolean(ruleFilter) && ruleFilter[fieldKey || '']) || '';
    }
  };

  const errorMessage = (): string => {
    const { fieldKey, ruleFilter, exceptionRuleTempId, errors } = props;
    const errorKey: string = `${exceptionRuleTempId}_${ruleFilter?.tempId}_${fieldKey}`;
    return errors.some((err: IdNameModel<string>) => err.id === errorKey) ? 'This Field is required.' : '';
  };

  const customErrorMessage = (): string => {
    const { fieldKey, customErrorMessage } = props;
    const ruleFilter = props.ruleFilter as RuleFilterModel;
    if (fieldKey === 'ruleValues') {
      const entityParamConfig: RuleEntityParameterConfigModel = _permitSettingsStore.getSelectedEntityParamConfig(
        ruleFilter
      );
      return ruleFilter.hasInvalidRuleValue(entityParamConfig);
    }

    return customErrorMessage || '';
  };

  const hasApiSource = (): boolean => {
    const entityParamConfig: RuleEntityParameterConfigModel = _permitSettingsStore.getSelectedEntityParamConfig(
      props.ruleFilter as RuleFilterModel
    );
    return Boolean(entityParamConfig?.apiSource);
  };

  /* istanbul ignore next */
  // get selected option for AUTO Complete
  const getOptionSelected = (currentOption: ISelectOption, values: ISelectOption | ISelectOption[]): boolean => {
    if (!values) {
      return false;
    }
    if (Array.isArray(values)) {
      return values.map(options => options.value).includes(currentOption.value);
    }

    if (Utilities.isEqual(props.fieldKey || '', 'ruleValues')) {
      const entityParamConfig = _permitSettingsStore.getSelectedEntityParamConfig(props.ruleFilter as RuleFilterModel);
      switch (entityParamConfig.apiSource) {
        case PERMIT_RULE_SOURCES.Airport:
          return Utilities.isEqual((currentOption as AirportModel).displayCode, (values as RuleValueModel).code);
        case PERMIT_RULE_SOURCES.State:
          return Utilities.isEqual((currentOption as StateModel).isoCode, (values as RuleValueModel).code);
        default:
          return Utilities.isEqual(currentOption.value, values.value);
      }
    }
    return Utilities.isEqual(currentOption.value, values.value);
  };

  const editableContent = (): ReactNode => {
    const {
      label,
      value,
      fieldKey,
      isDisabled,
      isHidden,
      isFullFlex,
      onFocus,
      onBlur,
      onSearch,
      onValueChange,
    } = props;
    switch (inputEditorType()) {
      case EDITOR_TYPES.BUTTON:
        return (
          <div className={classes.deleteBtn}>
            <SecondaryButton variant="contained" onClick={() => onValueChange(value as IOptionValue, fieldKey || '')}>
              {label}
            </SecondaryButton>
          </div>
        );
      case EDITOR_TYPES.DROPDOWN:
      case EDITOR_TYPES.TEXT_FIELD:
      default:
        if (isHidden) {
          return null;
        }
        if (fieldKey === 'ruleValues' && hasMultiple()) {
          const chipClasses = classNames({
            [props.classes.inputControl]: isFullFlex,
            [classes.inputControl]: isFullFlex,
            [classes.inputFlex]: !isFullFlex,
          });

          return (
            <div className={chipClasses}>
              <ChipInputControl
                isDisabled={isDisabled}
                options={inputOptions()?.filter(x => Boolean(x.label))}
                value={inputValue() as ISelectOption[]}
                label={label}
                freeSolo={!hasApiSource()}
                disableCloseOnSelect={props.disableCloseOnSelect}
                hasError={Boolean(errorMessage()) || Boolean(customErrorMessage())}
                customErrorMessage={errorMessage() || customErrorMessage()}
                onChipAddOrRemove={(value: ISelectOption[]) => onValueChange(value, fieldKey)}
                onSearch={(searchValue: string) => onSearch(searchValue, fieldKey)}
                onBlur={() => onBlur(fieldKey, inputValue() as IOptionValue)}
                onFocus={() => onFocus(fieldKey)}
              />
            </div>
          );
        }
        return (
          <ViewInputControl
            options={inputOptions()}
            isDisabled={isDisabled}
            isExists={isAlreadyExists()}
            multiple={hasMultiple()}
            isEditable={true}
            type={inputEditorType()}
            classes={{ flexRow: props.classes.inputControl }}
            customErrorMessage={errorMessage() || customErrorMessage()}
            field={{
              label: label,
              bind: () => null,
              value: inputValue(),
              key: fieldKey,
              showErrors: () => null,
              rules: label?.includes('*') ? 'required' : '',
            }}
            onValueChange={props.onValueChange}
            renderTags={viewRenderer}
            onFocus={props.onFocus}
            onSearch={(searchValue: string) => onSearch(searchValue, fieldKey || '')}
            onBlur={props.onBlur}
            getOptionSelected={getOptionSelected}
          />
        );
    }
  };

  return editableContent();
};

export default inject('permitSettingsStore', 'permitStore')(observer(PermitExceptionRuleViewControl));

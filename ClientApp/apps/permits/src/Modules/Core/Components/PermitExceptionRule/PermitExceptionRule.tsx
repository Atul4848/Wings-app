import React, { FC, MouseEvent as ReactMouseEvent, useState } from 'react';
import { Observable, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import {
  LogicalOperators,
  PERMIT_RULE_SOURCES,
  PermitExceptionRuleModel,
  PermitModel,
  PermitSettingsStore,
  PermitStore,
  RuleFilterModel,
} from '../../../Shared';
import { PermitExceptionRuleViewControl, PermitRuleDeleteConfirmDialog } from '../../Components';
import { IOptionValue, ISelectOption, IdNameModel, SettingsTypeModel, UIStore, Utilities } from '@wings-shared/core';
import { Collapsable } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { BasePermitException } from '../PermitException/BasePermitException';
import { useStyles } from './PermitExceptionRule.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IconButton } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { IViewInputControl } from '@wings-shared/form-controls';
import { Alert } from '@material-ui/lab';
import classNames from 'classnames';
import { exceptionInputControls, inputControls } from './PermitExceptionRuleInputControls';

interface Props {
  permitModel: PermitModel;
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
  onUpdatePermitModel: (updatedPermitModel: PermitModel) => void;
}

const PermitExceptionRule: FC<Props> = ({ permitSettingsStore, permitModel, permitStore, onUpdatePermitModel }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const [ errors, setErrors ] = useState<IdNameModel<string>[]>([]);
  const {
    _permitStore,
    _permitSettingsStore,
    updateExceptionRulesModel,
    getUpdatedRuleFilters,
    getExceptionRuleValues,
    exceptionRules,
  } = BasePermitException({
    permitModel,
    permitStore,
    permitSettingsStore,
    onUpdatePermitModel,
  });

  const getExceptionRuleErrorKey = (
    errorName: string,
    ruleFilterTempId: number,
    exceptionRuleIdTempId: number
  ): string => {
    return `${exceptionRuleIdTempId}_${ruleFilterTempId}_${errorName}`;
  };

  // Get API End Points based on the Selection
  /* istanbul ignore next */
  const getAPISource = (apiSource): Observable<any> => {
    switch (apiSource) {
      case PERMIT_RULE_SOURCES.Country:
        return _permitStore.getCountries();
      case PERMIT_RULE_SOURCES.FARType:
        return _permitSettingsStore.getFARTypes();
      case PERMIT_RULE_SOURCES.PurposeOfFlight:
        return _permitSettingsStore.getFlightPurposes();
      case PERMIT_RULE_SOURCES.NoiseChapter:
        return _permitSettingsStore.getNoiseChapters();
      case PERMIT_RULE_SOURCES.Region:
        return _permitStore.getRegions();
      case PERMIT_RULE_SOURCES.FIR:
        return _permitStore.getFIRs();
      case PERMIT_RULE_SOURCES.AircraftCategory:
        return _permitStore.getAircraftCategories();
      case PERMIT_RULE_SOURCES.ICAOAerodromeReferenceCode:
        return _permitStore.getAerodromeReferenceCodes();
      case PERMIT_RULE_SOURCES.CrossingType:
        return _permitSettingsStore.getCrossingType();
      case PERMIT_RULE_SOURCES.AirportOfEntry_AOE:
        return _permitStore.getAirportOfEntries();
      default:
        return of([]);
    }
  };

  const onFocus = (ruleFilter: RuleFilterModel | null): void => {
    const entityParamConfig = _permitSettingsStore.getSelectedEntityParamConfig(ruleFilter as RuleFilterModel);
    getAPISource(entityParamConfig?.apiSource)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe();
  };

  /* istanbul ignore next */
  const onSearch = (ruleFilter: RuleFilterModel | null, propertyValue: string): void => {
    const entityParamConfig = _permitSettingsStore.getSelectedEntityParamConfig(ruleFilter as RuleFilterModel);
    switch (entityParamConfig?.apiSource) {
      case PERMIT_RULE_SOURCES.Airport:
        if (!propertyValue) {
          _permitStore.wingsAirports = [];
          return;
        }
        UIStore.setPageLoader(true);
        _permitStore
          .searchWingsAirports(propertyValue, true)
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe();
        break;
      case PERMIT_RULE_SOURCES.State:
        {
          UIStore.setPageLoader(true);
          const searchCollection = JSON.stringify(
            propertyValue
              ? [
                { propertyName: 'CommonName', operator: 'and', propertyValue },
                { propertyName: 'ISOCode', operator: 'or', propertyValue },
              ]
              : []
          );
          _permitStore
            .getStates({ searchCollection, pageSize: 50 })
            .pipe(
              takeUntil(unsubscribe.destroy$),
              finalize(() => UIStore.setPageLoader(false))
            )
            .subscribe();
        }
        break;
    }
  };

  const onAddRuleFilter = (exceptionRule: PermitExceptionRuleModel): void => {
    const updatedRuleFilters: RuleFilterModel[] = [
      ...exceptionRule.ruleFilters,
      new RuleFilterModel({ ruleLogicalOperator: LogicalOperators[0] }),
    ];
    updateExceptionRules(updatedRuleFilters, exceptionRule, true);
  };

  const onDeleteRule = (exceptionRuleTempId: number): void => {
    ModalStore.open(
      <PermitRuleDeleteConfirmDialog
        exceptionRuleTempId={exceptionRuleTempId}
        exceptionRules={exceptionRules()}
        onUpdateExceptionRules={(exceptionRules: PermitExceptionRuleModel[]) => {
          setErrors(errors.filter((err: IdNameModel<string>) => !err.id.includes(`${exceptionRuleTempId}_`)));
          updateExceptionRulesModel(exceptionRules);
        }}
      />
    );
  };

  const onBlur = (
    value: IOptionValue | IOptionValue[],
    fieldKey: string,
    exceptionRule: PermitExceptionRuleModel,
    ruleFilter?: RuleFilterModel
  ): void => {
    updateExceptionRuleErrors(value, fieldKey, ruleFilter?.tempId as number, exceptionRule?.tempId);
  };

  const onValueChange = (
    value: IOptionValue | IOptionValue[],
    fieldKey: string,
    exceptionRule: PermitExceptionRuleModel,
    exceptionRuleFilters: RuleFilterModel[],
    ruleFilter: RuleFilterModel = {} as RuleFilterModel
  ): void => {
    switch (fieldKey) {
      case 'permitRequirementType':
        exceptionRule.permitRequirementType = value as SettingsTypeModel;
        break;
      case 'name':
        exceptionRule.name = value as string;
        break;
      case 'ruleValues':
        const entityParamConfig = _permitSettingsStore.getSelectedEntityParamConfig(ruleFilter);
        ruleFilter.ruleValues = getExceptionRuleValues(
          entityParamConfig,
          value,
          ruleFilter.hasInOperator || ruleFilter?.hasNotInOperator
        );
        exceptionRuleFilters = getUpdatedRuleFilters(exceptionRuleFilters, ruleFilter);
        break;
      case 'ruleLogicalOperator':
        ruleFilter[fieldKey] = value as SettingsTypeModel;
        exceptionRuleFilters = getUpdatedRuleFilters(exceptionRuleFilters, ruleFilter);
        break;
      case 'ruleConditionalOperator':
        if (
          ruleFilter.ruleField?.name !== 'PermitOnFile' &&
          (!Boolean(value) || ruleFilter.hasInOperator || ruleFilter?.hasNotInOperator)
        ) {
          ruleFilter.ruleValues = null;
        }
        ruleFilter[fieldKey] = value as SettingsTypeModel;
        exceptionRuleFilters = getUpdatedRuleFilters(exceptionRuleFilters, ruleFilter);
        break;
      case 'ruleEntityType':
        ruleFilter.ruleEntityType = value as SettingsTypeModel;
        ruleFilter.ruleField = null;
        ruleFilter.ruleConditionalOperator = null;
        ruleFilter.ruleValues = null;
        exceptionRuleFilters = getUpdatedRuleFilters(exceptionRuleFilters, ruleFilter);
        break;
      case 'ruleField':
        ruleFilter.ruleField = value as SettingsTypeModel;
        ruleFilter.ruleConditionalOperator = null;
        ruleFilter.ruleValues = null;
        if (ruleFilter.ruleField?.name === 'PermitOnFile') {
          const entityParamConfig = _permitSettingsStore.getSelectedEntityParamConfig(ruleFilter);
          ruleFilter.ruleValues = getExceptionRuleValues(
            entityParamConfig,
            'PTF',
            ruleFilter.hasInOperator || ruleFilter?.hasNotInOperator
          );
        }
        exceptionRuleFilters = getUpdatedRuleFilters(exceptionRuleFilters, ruleFilter);
        break;
      case 'delete':
        fieldKey = '';
        exceptionRuleFilters = exceptionRule.ruleFilters
          .filter((rule: RuleFilterModel) => rule.tempId !== ruleFilter.tempId)
          .map(
            (ruleData: RuleFilterModel, idx: number) =>
              new RuleFilterModel({
                ...ruleData,
                ruleLogicalOperator: idx === 0 ? null : new SettingsTypeModel({ ...ruleData.ruleLogicalOperator }),
              })
          );
        if (Boolean(exceptionRuleFilters.length)) {
          const errorKey: string = getExceptionRuleErrorKey(
            'ruleLogicalOperator',
            exceptionRuleFilters[0].tempId,
            exceptionRule.tempId
          );
          filterErrors(errorKey);
        }
        break;
    }

    updateExceptionRuleErrors(value, fieldKey, ruleFilter?.tempId, exceptionRule?.tempId);
    updateExceptionRules(exceptionRuleFilters, exceptionRule, true);
  };

  const updateExceptionRules = (
    ruleFilters: RuleFilterModel[],
    exceptionRule: PermitExceptionRuleModel,
    isReplace: boolean
  ): void => {
    const updatedExceptionRules: PermitExceptionRuleModel[] = Utilities.updateArray(
      exceptionRules(),
      new PermitExceptionRuleModel({
        ...exceptionRule,
        ruleFilters: [ ...ruleFilters ],
      }),
      {
        replace: isReplace,
        predicate: t => t.tempId === exceptionRule.tempId,
      }
    );
    updateExceptionRulesModel(updatedExceptionRules);
  };

  const updateExceptionRuleErrors = (
    value: IOptionValue | IOptionValue[],
    errorName: string,
    ruleFilterTempId: number,
    exceptionRuleId: number
  ): void => {
    const errorKey: string = getExceptionRuleErrorKey(errorName, ruleFilterTempId, exceptionRuleId);

    if (!Boolean(errorName)) {
      setErrors(errors.filter((err: IdNameModel<string>) => !err.id.includes(errorKey)));
      return;
    }

    setRuleValueBasedErrors(value, errorKey, errorName);
  };

  const setRuleValueBasedErrors = (value: IOptionValue | IOptionValue[], errorKey: string, errorName: string): void => {
    const errorsCopy: IdNameModel<string>[] = [ ...errors ];

    if (Array.isArray(value) && Boolean(value.length)) {
      filterErrors(errorKey);
      return;
    }

    if (typeof value === 'string' && Boolean(value?.trim())) {
      filterErrors(errorKey);
      return;
    }

    if (!Array.isArray(value) && typeof value === 'object' && Boolean(value)) {
      const selectedOption: ISelectOption = value as ISelectOption;

      if (Boolean(selectedOption.value)) {
        filterErrors(errorKey);
        return;
      }
    }

    setErrors(
      Utilities.updateArray(
        errorsCopy,
        { id: errorKey, name: errorName },
        {
          replace: true,
          predicate: t => t.id === errorKey,
        }
      )
    );
  };

  const filterErrors = (errorKey: string): void => {
    setErrors(errors.filter((err: IdNameModel<string>) => err.id !== errorKey));
  };

  return exceptionRules().map((exceptionRule: PermitExceptionRuleModel, idx: number) => (
    <Collapsable
      key={idx}
      title={exceptionRule.name?.trim() || `Rule ${idx + 1}`}
      classes={{ titleRoot: classes.titleRoot, root: classes.accordionRoot }}
      titleChildren={
        <IconButton
          classes={{ root: classes.delete }}
          onClick={(event: ReactMouseEvent<Element>) => {
            event.stopPropagation();
            onDeleteRule(exceptionRule.tempId);
          }}
        >
          <DeleteOutlineIcon />
        </IconButton>
      }
    >
      <>
        <div className={classes.rule}>
          {exceptionInputControls.map((inputControl: IViewInputControl, indx: number) => (
            <PermitExceptionRuleViewControl
              {...inputControl}
              key={indx}
              value={exceptionRule[inputControl.fieldKey || '']}
              exceptionRules={exceptionRules()}
              exceptionRuleTempId={exceptionRule.tempId}
              errors={errors}
              customErrorMessage={inputControl.fieldKey === 'name' ? exceptionRule.hasInvalidName : ''}
              classes={{
                inputControl: classNames({
                  [classes.exceptionRule]: inputControl.isHalfFlex,
                }),
              }}
              onFocus={() => onFocus(null)}
              onSearch={(value: string) => onSearch(null, value)}
              onBlur={(fieldKey: string, value: IOptionValue) => onBlur(value, fieldKey, exceptionRule)}
              onValueChange={(value: IOptionValue, fieldKey: string) =>
                onValueChange(value, fieldKey, exceptionRule, exceptionRule.ruleFilters)
              }
            />
          ))}
        </div>
        {!Boolean(exceptionRule.ruleFilters.length) && (
          <Alert severity="error" className={classes.filledError}>
            Please Add at least one exception case.
          </Alert>
        )}
        {exceptionRule.ruleFilters.map((ruleFilter: RuleFilterModel, index: number) => (
          <div className={classes.flexWrap} key={index}>
            {inputControls.map((inputControl: IViewInputControl) => (
              <PermitExceptionRuleViewControl
                {...inputControl}
                key={inputControl.fieldKey}
                ruleFilter={ruleFilter}
                errors={errors}
                isFullFlex={index === 0 && inputControl.fieldKey === 'ruleValues'}
                exceptionRuleTempId={exceptionRule.tempId}
                isHidden={index === 0 && inputControl.fieldKey === 'ruleLogicalOperator'}
                classes={{
                  inputControl: classNames({
                    [classes.exceptionRule]: index === 0 && inputControl.fieldKey === 'ruleValues',
                  }),
                }}
                isDisabled={inputControl.fieldKey === 'ruleValues' && ruleFilter.ruleField?.label === 'PermitOnFile'}
                onFocus={() => onFocus(ruleFilter)}
                onSearch={(value: string) => onSearch(ruleFilter, value)}
                onBlur={(fieldKey: string, value: IOptionValue) => onBlur(value, fieldKey, exceptionRule, ruleFilter)}
                onValueChange={(value, fieldKey) =>
                  onValueChange(value, fieldKey, exceptionRule, exceptionRule.ruleFilters, ruleFilter)
                }
              />
            ))}
          </div>
        ))}
        <div className={classes.action}>
          <PrimaryButton
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!permitModel.isException}
            onClick={() => onAddRuleFilter(exceptionRule)}
          >
            Add New Case
          </PrimaryButton>
        </div>
      </>
    </Collapsable>
  ));
};

export default inject('permitSettingsStore', 'permitStore')(observer(PermitExceptionRule));

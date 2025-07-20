import React, { FC, useEffect, useState } from 'react';
import { Utilities, UIStore, IOptionValue, IAPIGridRequest, baseEntitySearchFilters } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useBaseUpsertComponent } from '@wings/shared';
import { forkJoin } from 'rxjs';
import { IAPIPermit, PermitModel, PermitSettingsStore, PermitStore, sidebarOptions } from '../Shared';
import { EDITOR_TYPES, IViewInputControl, ViewInputControl } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { TextareaAutosize, Typography } from '@material-ui/core';
import { useStyles } from './ExecuteRule.styles';
import { useParams } from 'react-router';
import { fields } from './Fields';
import { SidebarStore } from '@wings-shared/layout';

interface Props {
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const ExecuteRule: FC<Props> = ({ permitSettingsStore, permitStore, sidebarStore }) => {
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<PermitModel>(params, fields, baseEntitySearchFilters);
  const unsubscribe = useUnsubscribe();
  const _settingsStore = permitSettingsStore as PermitSettingsStore;
  const _permitStore = permitStore as PermitStore;
  const [ ruleAttributeJson, setRuleAttributeJson ] = useState<string>('');
  const [ executedResultJson, setExecutedResultJson ] = useState<string>('');

  // Load Data on Mount
  useEffect(() => {
    sidebarStore?.setNavLinks(sidebarOptions(false), 'permits');
    UIStore.setPageLoader(true);
    forkJoin([ _permitStore.getCountries(), _settingsStore.getPermitTypes() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  }, []);

  /* istanbul ignore next */
  const executeRuleInputControls = (): IViewInputControl[] => {
    return [
      {
        fieldKey: 'country',
        type: EDITOR_TYPES.DROPDOWN,
        options: _permitStore.countries,
      },
      {
        fieldKey: 'permitType',
        type: EDITOR_TYPES.DROPDOWN,
        options: _settingsStore.permitTypes,
      },
    ];
  };

  const onRuleAttributeChange = (value: string): void => {
    setRuleAttributeJson(value);
  };

  /* istanbul ignore next */
  const reset = (): void => {
    const { permits } = _permitStore;
    if (permits?.length > 0) {
      setRuleAttributeJson(JSON.stringify(permits[0].permitExceptionRuleObject, null, 2));
      setExecutedResultJson('');
    }
  };

  /* istanbul ignore next */
  const executedPermit = (): void => {
    const { country, permitType } = useUpsert.form.values();
    UIStore.setPageLoader(true);
    _permitStore
      ?.executePermits(country.isO2Code, permitType.id, Utilities.parseJSON(ruleAttributeJson))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((permits: IAPIPermit[]) => {
        if (permits?.length > 0) {
          setExecutedResultJson(JSON.stringify(permits[0], null, 2));
          return;
        }
        setExecutedResultJson('');
      });
  };

  /* istanbul ignore next */
  const getPermitRequiredAttribute = (): void => {
    const { country, permitType } = useUpsert.form.values();

    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        { propertyName: 'Country.CountryId', propertyValue: country.id },
        { propertyName: 'PermitType.PermitTypeId', propertyValue: permitType.id },
      ]),
    };

    const specifiedFields: string[] = [
      'PermitExceptionRules.RuleFilters.RuleEntityType',
      'PermitExceptionRules.RuleFilters.PropertyName',
    ];

    setExecutedResultJson('');
    UIStore.setPageLoader(true);
    _permitStore
      .getPermits(request, specifiedFields)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((permits: PermitModel[]) => {
        if (permits?.length > 0) {
          setRuleAttributeJson(JSON.stringify(permits[0].permitExceptionRuleObject, null, 2));
          return;
        }
        setRuleAttributeJson('');
      });
  };

  return (
    <>
      <div className={classes.mainContainer}>
        <div className={classes.boxSection}>
          {executeRuleInputControls()
            .filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                isEditable={true}
                field={useUpsert.getField(inputControl.fieldKey || '')}
                onValueChange={(option: IOptionValue, fieldKey: string) => useUpsert.onValueChange(option, fieldKey)}
              />
            ))}
          <div>
            <PrimaryButton
              variant="contained"
              disabled={!useUpsert.form.isValid}
              onClick={() => getPermitRequiredAttribute()}
            >
              Get Permit Rule Attributes
            </PrimaryButton>
          </div>
        </div>
        <div className={classes.boxSection}>
          <Typography component="h2">Permit Rule Attributes</Typography>
          <TextareaAutosize
            value={ruleAttributeJson}
            className={classes.textBox}
            rowsMin={45}
            rowsMax={45}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onRuleAttributeChange(e.target.value)}
          />
          <div className={classes.mainContainer}>
            <PrimaryButton variant="contained" className={classes.executeRuleBtn} onClick={() => reset()}>
              Reset To Default
            </PrimaryButton>
            <PrimaryButton
              variant="contained"
              className={classes.executeRuleBtn}
              disabled={!Boolean(ruleAttributeJson) || !Utilities.isValidJsonString(ruleAttributeJson)}
              onClick={() => executedPermit()}
            >
              Execute Rule
            </PrimaryButton>
          </div>
        </div>
        <div className={classes.boxSection}>
          <Typography component="h2">Executed Result</Typography>
          <TextareaAutosize
            value={executedResultJson}
            className={classes.textBox}
            disabled={true}
            rowsMin={45}
            rowsMax={45}
          />
        </div>
      </div>
    </>
  );
};

export default inject('permitSettingsStore', 'permitStore', 'sidebarStore')(observer(ExecuteRule));

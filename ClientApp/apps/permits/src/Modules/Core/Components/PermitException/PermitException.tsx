import React, { FC, useEffect } from 'react';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { PermitModel, PermitSettingsStore, PermitStore } from '../../../Shared';
import { useStyles } from './PermitException.styles';
import { PermitExceptionRule } from '../../Components';
import { IClasses, UIStore } from '@wings-shared/core';
import { CollapsibleWithButton } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { BasePermitException } from './BasePermitException';

interface Props {
  permitModel: PermitModel;
  hasPermitExceptionRuleError: boolean;
  classes?: IClasses;
  permitSettingsStore?: PermitSettingsStore;
  permitStore?: PermitStore;
  onUpdatePermitModel: (updatedPermitModel: PermitModel) => void;
}

const PermitException: FC<Props> = ({
  permitSettingsStore,
  permitModel,
  permitStore,
  hasPermitExceptionRuleError,
  onUpdatePermitModel,
}) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const {
    _permitSettingsStore,
    updateExceptionRulesModel,
    exceptionRules,
    defaultExceptionRuleTemplate,
  } = BasePermitException({
    permitModel,
    permitStore,
    permitSettingsStore,
    onUpdatePermitModel,
  });

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    UIStore.setPageLoader(true);
    forkJoin([
      _permitSettingsStore.getRuleEntities(),
      _permitSettingsStore.getPermitRequirementTypes(),
      _permitSettingsStore.getRuleEntityParameterConfigs(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  }, []);

  const onAddExceptionRuleTemplate = (): void => {
    updateExceptionRulesModel([ ...exceptionRules(), ...defaultExceptionRuleTemplate() ]);
  };

  return (
    <div className={classes.root}>
      <CollapsibleWithButton
        title="Permit Exceptions"
        buttonText="Add Exception Rule"
        isButtonDisabled={!permitModel.isException || hasPermitExceptionRuleError}
        onButtonClick={() => onAddExceptionRuleTemplate()}
        classes={{ button: classes.button }}
      >
        <PermitExceptionRule
          permitModel={permitModel}
          onUpdatePermitModel={(permit: PermitModel) => onUpdatePermitModel(permit)}
        />
      </CollapsibleWithButton>
    </div>
  );
};

export default inject('permitSettingsStore', 'permitStore')(observer(PermitException));

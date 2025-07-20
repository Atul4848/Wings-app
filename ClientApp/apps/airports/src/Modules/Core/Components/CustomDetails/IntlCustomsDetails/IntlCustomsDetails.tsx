import React, { useEffect } from 'react';
import { IUseUpsert, withFormFields } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useStyles } from './IntlCustomsDetails.styles';
import { intlFields } from './fields';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { AirportStore, AirportModel, AirportCustomDetailStore } from '../../../../Shared';
import { IOptionValue, UIStore } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router-dom';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';

interface Props {
  useUpsert: IUseUpsert;
  airportStore?: AirportStore;
  airportCustomDetailStore?: AirportCustomDetailStore;
}

const IntlCustomsDetails = ({ useUpsert, ...props }: Props) => {
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const _airportStore = props.airportStore as AirportStore;
  const _customDetailStore = props.airportCustomDetailStore as AirportCustomDetailStore;
  const selectedAirport: AirportModel = _airportStore.selectedAirport as AirportModel;

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
    return () => {
      useUpsert.form.reset();
    };
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _customDetailStore
      .getCustomsNonUsInfo(Number(params.airportId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          props.airportStore?.setSelectedAirport({
            ...selectedAirport,
            customsNonUsInfo: response,
          });
          useUpsert.setFormValues(response);
        },
        error: (error: AxiosError) => console.log('error', error.code),
      });
  };

  const isAddNew = (): boolean => {
    const { customsNonUsInfo } = _airportStore.selectedAirport as AirportModel;
    return useUpsert.isAddNew || !Boolean(customsNonUsInfo?.id);
  };

  const isDisabled = (fieldKey: string): boolean => {
    return !useUpsert.getField(fieldKey).value;
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string) => {
    useUpsert.onValueChange(value, fieldKey);
    switch (fieldKey) {
      case 'overtimeAllowed':
        useUpsert.getField('overtimeRequirements').clear();
        break;
      case 'taxRefundAvailable':
        useUpsert.getField('taxRefundInstructions').clear();
        break;
      case 'quarantineInfo.agricultureAvailable':
        useUpsert.getField('quarantineInfo.agricultureInstructions').clear();
        break;
      case 'quarantineInfo.immigrationAvailable':
        useUpsert.getField('quarantineInfo.immigrationInstructions').clear();
        break;
    }
  };

  const groupInputControls = (): IGroupInputControls[] => [
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'vipProcessingAvailable',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'cargoClearanceAvailable',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'overtimeAllowed',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'overtimeRequirements',
          type: EDITOR_TYPES.TEXT_FIELD,
          isQuarterFlex: true,
          isDisabled: isDisabled('overtimeAllowed'),
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'taxRefundAvailable',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'taxRefundInstructions',
          type: EDITOR_TYPES.TEXT_FIELD,
          isQuarterFlex: true,
          isDisabled: isDisabled('taxRefundAvailable'),
        },
      ],
    },
    {
      title: 'Quarantine/Immigration Details:',
      inputControls: [
        {
          fieldKey: 'quarantineInfo.agricultureAvailable',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'quarantineInfo.agricultureInstructions',
          type: EDITOR_TYPES.TEXT_FIELD,
          isQuarterFlex: true,
          isDisabled: isDisabled('quarantineInfo.agricultureAvailable'),
        },
        {
          fieldKey: 'quarantineInfo.immigrationAvailable',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'quarantineInfo.immigrationInstructions',
          type: EDITOR_TYPES.TEXT_FIELD,
          isQuarterFlex: true,
          isDisabled: isDisabled('quarantineInfo.immigrationAvailable'),
        },
      ],
    },
    {
      title: 'Fee Information:',
      inputControls: [
        {
          fieldKey: 'feeInformation.customsFeesApply',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },

        {
          fieldKey: 'feeInformation.overtimeFeesApply',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'feeInformation.cashAccepted',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
      ],
    },
  ];

  return (
    <>
      <ViewInputControlsGroup
        groupInputControls={groupInputControls()}
        field={useUpsert.getField}
        isEditing={useUpsert.isEditable}
        isLoading={useUpsert.isLoading}
        onValueChange={onValueChange}
      />
      <AuditFields
        isNew={isAddNew()}
        isEditable={useUpsert.isEditable}
        fieldControls={useUpsert.auditFields}
        onGetField={useUpsert.getField}
      />
    </>
  );
};

export default withFormFields(
  inject('airportStore', 'airportCustomDetailStore')(observer(IntlCustomsDetails)),
  intlFields
);

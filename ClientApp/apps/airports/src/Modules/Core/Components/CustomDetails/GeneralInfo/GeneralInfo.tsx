import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { IUseUpsert, withFormFields } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { generalFields } from './fields';
import {
  AirportSettingsStore,
  AirportStore,
  EntityMapStore,
  AirportCustomDetailStore,
  AirportCustomGeneralModel,
  AirportModel,
} from '../../../../Shared';
import { EntityMapModel, IOptionValue, ISelectOption, UIStore } from '@wings-shared/core';
import { useStyles } from '../CustomDetails.styles';
import { finalize, takeUntil } from 'rxjs/operators';
import { useParams } from 'react-router-dom';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AxiosError } from 'axios';

interface Props {
  useUpsert: IUseUpsert;
  airportSettingsStore?: AirportSettingsStore;
  airportStore?: AirportStore;
  entityMapStore?: EntityMapStore;
  airportCustomDetailStore?: AirportCustomDetailStore;
}

const GeneralInfo = ({ useUpsert, ...props }: Props) => {
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const [ vendorLocations, setVendorLocations ] = useState<EntityMapModel[]>([]);
  const _entityMapStore = props.entityMapStore as EntityMapStore;
  const _airportStore = props.airportStore as AirportStore;
  const _airportSettingStore = props.airportSettingsStore as AirportSettingsStore;
  const _customDetailStore = props.airportCustomDetailStore as AirportCustomDetailStore;
  const [ isClearanceFBOEnable, setClearanceFBOEnable ] = useState(false);

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
    return () => {
      useUpsert.form.reset();
    };
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _customDetailStore
      .getCustomsGeneralInfo(Number(params.airportId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          _airportStore.setSelectedAirport({
            ..._airportStore.selectedAirport,
            customsGeneralInfo: response,
          });
          useUpsert.setFormValues(response);
        },
        error: (error: AxiosError) => console.log('error', error.code),
      });
  };

  const onFocus = (fieldKey: string) => {
    if (fieldKey === 'customsClearanceFBOs') {
      const _vendorLocations =
        _airportStore.selectedAirport?.vendorLocations?.map(x => new EntityMapModel({ ...x, entityId: x.id, id: 0 })) ||
        [];
      setVendorLocations(_vendorLocations);
      return;
    }
    useUpsert.observeSearch(_entityMapStore.loadEntities(fieldKey));
  };

  const onSearch = (searchValue: string, fieldKey: string) => {
    useUpsert.observeSearch(_entityMapStore.searchEntities(searchValue, fieldKey));
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string) => {
    useUpsert.onValueChange(value, fieldKey);
    switch (fieldKey) {
      case 'appliedCustomsLocationInformations':
        const atFBO = (value as ISelectOption[]).some(x => x.label === 'At FBO');
        setClearanceFBOEnable(atFBO);
        if (!atFBO) useUpsert.getField('customsClearanceFBOs').set([]);
        break;
      case 'customOfficerDispacthedFromAirport':
        if (!value) {
          _entityMapStore.airports = [];
        }
        break;
    }
  };

  const groupInputControls = (): IGroupInputControls[] => [
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'customsAvailableAtAirport',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'customOfficerDispacthedFromAirport',
          type: EDITOR_TYPES.DROPDOWN,
          options: _entityMapStore.airports,
        },
        {
          fieldKey: 'appliedCustomsLocationInformations',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.customLocation,
        },
        {
          fieldKey: 'customsClearanceFBOs',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: vendorLocations,
          isDisabled: !isClearanceFBOEnable,
        },
        {
          fieldKey: 'gaClearanceAvailable',
          isBoolean: true,
          type: EDITOR_TYPES.SELECT_CONTROL,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'clearanceLocationSpecifics',
          type: EDITOR_TYPES.TEXT_FIELD,
          isFullFlex: true,
          multiline: true,
          rows: 3,
        },
        {
          fieldKey: 'maximumPersonsOnBoardAllowedForGAClearance',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'appliedMaxPOBAltClearanceOptions',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.maxPOBOptions,
        },
        {
          fieldKey: 'maxPOBNotes',
          type: EDITOR_TYPES.TEXT_FIELD,
          isFullFlex: true,
          multiline: true,
          rows: 3,
        },
      ],
    },
  ];

  return (
    <ViewInputControlsGroup
      groupInputControls={groupInputControls()}
      field={useUpsert.getField}
      isEditing={useUpsert.isEditable}
      isLoading={useUpsert.isLoading}
      onValueChange={onValueChange}
      onFocus={onFocus}
      onSearch={onSearch}
    />
  );
};

export default withFormFields(
  inject('airportSettingsStore', 'airportStore', 'entityMapStore', 'airportCustomDetailStore')(observer(GeneralInfo)),
  generalFields
);

import { baseEntitySearchFilters } from '@wings-shared/core';
import { AircraftRegistryModel, AirframeStore, SettingsStore } from '../../../Shared';
import { fields } from './Fields';
import { IGroupInputControls, EDITOR_TYPES } from '@wings-shared/form-controls';
import { useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router';

export interface BaseProps {
  airframeStore?: AirframeStore;
  settingsStore?: SettingsStore;
}

const useAircraftRegistryEditorBase = ({ ...props }) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<AircraftRegistryModel>(params, fields, baseEntitySearchFilters);
  const _settingsStore = props.settingsStore as SettingsStore;
  const _airframeStore = props.airframeStore as AirframeStore;

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'General',
        inputControls: [
          {
            fieldKey: 'registry',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'registryStartDate',
            type: EDITOR_TYPES.DATE,
          },
          {
            fieldKey: 'isDummyRegistry',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'wakeTurbulenceGroup',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.wakeTurbulenceGroups,
          },
          {
            fieldKey: 'registryEndDate',
            type: EDITOR_TYPES.DATE,
          },
          {
            fieldKey: 'acas',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.acases,
          },
          {
            fieldKey: 'airframe',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airframeStore.airframes,
          },
          {
            fieldKey: 'isOceanicClearanceEnabled',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'isPDCRegistered',
            type: EDITOR_TYPES.CHECKBOX,
          },
        ],
      },
      {
        title: 'US Custom Decals',
        inputControls: [
          {
            fieldKey: 'usCustomsDecal.number',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'usCustomsDecal.expirationDate',
            type: EDITOR_TYPES.DATE,
          },
        ],
      },
      {
        title: 'Weights',
        inputControls: [
          {
            fieldKey: 'weights.bow',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'weights.maxLandingWeight',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'weights.tankCapacity',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'weights.zeroFuelWeight',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'weights.mtow',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Distance',
        inputControls: [
          {
            fieldKey: 'distance.minimumRunwayLength',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Item 10a-Navigation,Communication,Approach, Aids & Capabilities  ',
        inputControls: [
          {
            fieldKey: 'item10A',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            options: [],
          },
        ],
      },
      {
        title: 'Item 10b- Survillience Equipment & Capabilities',
        inputControls: [
          {
            fieldKey: 'transponderType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.transponders,
            isFullFlex: true,
          },
          {
            fieldKey: 'adsb',
            type: EDITOR_TYPES.DROPDOWN,
            options: [],
          },
          {
            fieldKey: 'uat',
            type: EDITOR_TYPES.DROPDOWN,
            options: [],
          },
          {
            fieldKey: 'udlModel4',
            type: EDITOR_TYPES.DROPDOWN,
            options: [],
          },
          {
            fieldKey: 'item10B',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            options: _settingsStore.radios,
          },
        ],
      },
      {
        title: 'Item 18-Other information',
        inputControls: [
          {
            fieldKey: 'item18.aircraftAddressCode',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            options: [], // need to add deserializeList for RegistrySequenceBaseModel,
          },
        ],
      },
      {
        title: 'Item 19-Other information',
        inputControls: [
          {
            fieldKey: 'item19',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            options: _settingsStore.radios, // need to add deserializeList for RegistrySequenceBaseModel,
          },
        ],
      },
      {
        title: 'word Limitation',
        inputControls: [
          {
            fieldKey: 'wordLimitation.maximumCrosswind',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'wordLimitation.maximumTailwind',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Audit details',
        inputControls: [ ...(useUpsert.isDetailView ? useUpsert.auditFields : []) ],
      },
    ];
  };
  return { groupInputControls, useUpsert, params, _settingsStore, _airframeStore };
};

export default useAircraftRegistryEditorBase;

import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { useStyles } from './SelectVariationView.styles';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';
import { AircraftVariationModel } from '../../../Shared';

interface Props extends IViewInputControl {
  aircraftVariation: AircraftVariationModel;
}

const SelectVariationView: FC<Props> = ({ aircraftVariation, ...props }) => {
  const classes = useStyles();

  const groupInputControl = (): IGroupInputControls => {
    return {
      title: '',
      inputControls: [
        {
          fieldKey: 'make',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Make',
          options: [],
        },
        {
          fieldKey: 'model',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Model',
          options: [],
        },
        {
          fieldKey: 'series',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Series',
          options: [],
        },
        {
          fieldKey: 'icaoTypeDesignator',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'ICAO Type Designator',
          options: [],
        },
        {
          fieldKey: 'propulsionType',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Propulsion Type',
          options: [],
        },
        {
          fieldKey: 'engineType',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Engine Type',
          options: [],
        },
        {
          fieldKey: 'popularNames',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Popular Names',
          options: [],
          multiple: true,
        },
        {
          fieldKey: 'otherNames',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Other Names',
          multiple: true,
          options: [],
        },
        {
          fieldKey: 'modifications',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Modifications',
          multiple: true,
          options: [],
        },
        {
          fieldKey: 'stcManufactures',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'STC Manufactures',
          multiple: true,
          options: [],
        },
        {
          fieldKey: 'icaoAerodromeReferenceCode',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'ICAO Aerodrome Reference Code',
          options: [],
        },
        {
          fieldKey: 'wakeTurbulenceCategory',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Wake Turbulence Category',
          options: [],
        },
        {
          fieldKey: 'militaryDesignations',
          type: EDITOR_TYPES.DROPDOWN,
          label: 'Military Designations',
          multiple: true,
          options: [],
        },
      ],
    };
  };

  return (
    <div className={classes.flexWrap}>
      {groupInputControl().inputControls.map(inputControl => (
        <ViewInputControl
          {...inputControl}
          key={inputControl.label}
          classes={{ flexRow: classes.flexRow }}
          field={{
            label: inputControl.label,
            value: aircraftVariation[inputControl.fieldKey || ''],
            bind: () => null,
          }}
          isDisabled={true}
          isEditable={props.isEditable}
        />
      ))}
    </div>
  );
};

export default observer(SelectVariationView);

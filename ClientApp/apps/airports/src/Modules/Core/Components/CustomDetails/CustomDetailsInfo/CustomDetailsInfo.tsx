import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { BasePermitStore, IUseUpsert, withFormFields } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useMemo } from 'react';
import {
  AirportStore,
  AirportModel,
  AirportCustomDetailStore,
  EntityMapStore,
  useAirportModuleSecurity,
} from '../../../../Shared';
import { customDetailFields } from './CustomDetailsInfo.fields';
import { Box } from '@material-ui/core';
import LeadTimesGrid from './LeadTimesGrid/LeadTimesGrid';
import { UIStore } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router-dom';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { useStyles } from './CustomDetailsInfo.styles';

interface Props {
  useUpsert: IUseUpsert;
  airportStore?: AirportStore;
  airportCustomDetailStore?: AirportCustomDetailStore;
  entityMapStore?: EntityMapStore;
  isRowEditing: (isEditing: boolean) => void;
  onCustomDetailsUpdate: (isUpdated: boolean) => void;
}

const CustomDetailsInfo = ({ useUpsert, ...props }: Props) => {
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const _airportStore = props.airportStore as AirportStore;
  const selectedAirport: AirportModel = _airportStore.selectedAirport as AirportModel;
  const _customDetailStore = props.airportCustomDetailStore as AirportCustomDetailStore;
  const _entityMapStore = props.entityMapStore as EntityMapStore;
  const _permitStore = useMemo(() => new BasePermitStore(), []);
  const { isGRSUser, isEditable } = useAirportModuleSecurity();

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
      .getCustomsDetail(Number(params.airportId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: any) => {
          _airportStore.setSelectedAirport({
            ...selectedAirport,
            customsDetail: { ...response, customsLeadTimes: response.customsLeadTimes },
          });
          useUpsert.setFormValues(response);
        },
        error: (error: AxiosError) => console.log('error', error.code),
      });
  };

  const updateCustomsDetailInfo = (gridName, gridData): void => {
    const formData = useUpsert.form.values();
    useUpsert.setFormValues({ ...formData, [gridName]: gridData });
    props.onCustomDetailsUpdate(true);
  };

  const onFocus = (fieldKey: string) => {
    if (fieldKey === 'customsDocumentRequirements') {
      useUpsert.observeSearch(_permitStore.getPermitDocuments());
      return;
    }
    useUpsert.observeSearch(_entityMapStore.loadEntities(fieldKey));
  };

  const isDisabled = (fieldKey: string): boolean => {
    return !useUpsert.getField(fieldKey).value;
  };

  const onValueChange = (value, fieldKey) => {
    useUpsert.getField(fieldKey).set(value);
    if (fieldKey === 'internationalTrashAvailable') {
      useUpsert.clearFormFields([ 'trashRemovalVendor', 'trashRemovalRequestTemplate' ]);
    }
  };

  const groupInputControls = (): IGroupInputControls[] => [
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'canPassPermitLocation',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'customsDocumentRequirements',
          type: EDITOR_TYPES.DROPDOWN,
          options: _permitStore.permitDocuments,
          multiple: true,
        },
        {
          fieldKey: 'customsRequiredInformationTypes',
          type: EDITOR_TYPES.DROPDOWN,
          options: _entityMapStore.requiredInformationTypes,
          multiple: true,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'tolerancePlus',
          type: EDITOR_TYPES.TEXT_FIELD,
          endAdormentValue: 'Minutes',
        },
        {
          fieldKey: 'toleranceMinus',
          type: EDITOR_TYPES.TEXT_FIELD,
          endAdormentValue: 'Minutes',
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'internationalTrashAvailable',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'trashRemovalVendor',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: isDisabled('internationalTrashAvailable'),
        },
        {
          fieldKey: 'trashRemovalRequestTemplate',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: isDisabled('internationalTrashAvailable'),
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'uwaInternalProcessNotes',
          type: EDITOR_TYPES.TEXT_FIELD,
          isFullFlex: true,
          multiline: true,
          rows: 3,
        },
        {
          fieldKey: 'customClearanceProcess',
          type: EDITOR_TYPES.RICH_TEXT_EDITOR,
          isFullFlex: true,
          showExpandButton: false,
        },
        {
          fieldKey: 'specialInstructions',
          type: EDITOR_TYPES.TEXT_FIELD,
          isFullFlex: true,
          multiline: true,
          rows: 3,
        },
      ],
    },
  ];

  const { customsLeadTimes } = useUpsert.form.values();
  return (
    <Box>
      <ViewInputControlsGroup
        groupInputControls={groupInputControls()}
        field={useUpsert.getField}
        isEditing={useUpsert.isEditable}
        isLoading={useUpsert.isLoading}
        onValueChange={onValueChange}
        onFocus={onFocus}
      />
      <LeadTimesGrid
        isEditable={useUpsert.isEditable && (isEditable || isGRSUser)}
        leadTimes={customsLeadTimes}
        onDataUpdate={updateCustomsDetailInfo}
        isRowEditing={props.isRowEditing}
      />
    </Box>
  );
};

export default withFormFields(
  inject('airportStore', 'airportCustomDetailStore', 'entityMapStore')(observer(CustomDetailsInfo)),
  customDetailFields
);

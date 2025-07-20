import React, { useEffect, useMemo, useState } from 'react';
import { of } from 'rxjs';
import {
  AirportSettingsStore,
  CONDITION_EDITOR,
  ConditionalOperatorModel,
  ConditionModel,
  ConditionValueModel,
} from '../../../../../../../Shared';
import { fields, getConditionValue, getEditorType } from './HourConditionEditor.fields';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Box } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useHourConditionEditorStyles } from './HourConditionEditor.styles';
import { useBaseUpsertComponent } from '@wings/shared';
import { SecondaryButton } from '@uvgo-shared/buttons';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { booleanFields, integerFields } from '../../../AirportHoursGridHelper';
import { EDITOR_TYPES, IViewInputControl, ViewInputControl } from '@wings-shared/form-controls';
import { baseEntitySearchFilters, tapWithAction, UIStore, Utilities, ViewPermission } from '@wings-shared/core';

interface Props {
  index?: number;
  item: ConditionModel;
  onDelete: () => void;
  isRowEditing: boolean;
  settingStore: AirportSettingsStore;
  syncHasError: (hasError) => void;
  onChanges: (item) => void;
}
const HourConditionEditor = (props: Props) => {
  const [ isMounting, setIsMounting ] = useState(true);
  const params = useParams();
  const classes = useHourConditionEditorStyles();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const _settingStore = props.settingStore as AirportSettingsStore;
  const [ operators, setOperators ] = useState<ConditionalOperatorModel[]>([]);
  const [ entityOptions, setEntityOptions ] = useState<ConditionValueModel[]>([]);

  const conditionType = useUpsert.getField('conditionType')?.value?.name?.toLowerCase();
  const editorType = getEditorType(conditionType);
  const isSelectControl = useMemo(() => Utilities.isEqual(editorType, EDITOR_TYPES.SELECT_CONTROL), [ editorType ]);
  const conditionalOperator = useUpsert.getField('conditionalOperator')?.value?.label?.toLowerCase();
  const isMultiSelect = () => [ 'in', 'not in' ].includes(conditionalOperator);

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.form.set(props.item);
    // Needs to Map Values From Array To Objects
    if (props.item.conditionValues) {
      const operator = props.item.conditionalOperator?.label;
      const isMultiSelect = [ 'in', 'not in' ].includes(operator?.toLocaleLowerCase());
      const editorType = getEditorType(props.item.conditionType?.label?.toLocaleLowerCase());
      const conditionValue = getConditionValue(editorType, props.item.conditionValues, isMultiSelect);
      useUpsert.getField('conditionValues').set(conditionValue);
      if (props.isRowEditing) {
        loadConditionValueOptions(props.item.conditionType);
      }
    }
    setIsMounting(false);
  }, []);

  /* istanbul ignore next */
  useEffect(() => {
    props.syncHasError(useUpsert.form.hasError);
  }, [ useUpsert.form.hasError ]);

  /* istanbul ignore next */
  const loadConditionalOperators = conditionType => {
    UIStore.setPageLoader(true);
    _settingStore
      .getConditionalOperators()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          const _fields = integerFields.concat(booleanFields);
          if (_fields.includes(conditionType?.name?.toLowerCase())) {
            const _values = response.filter(x => !x.operator?.toLowerCase().includes('in'));
            setOperators(_values);
            return;
          }
          setOperators(response);
        },
      });
  };

  /* istanbul ignore next */
  const loadConditionValueOptions = conditionType => {
    if (!conditionType) {
      return;
    }
    const _type = conditionType.name?.toLowerCase();
    let observableOfType = of<any>([]);
    switch (_type) {
      case CONDITION_EDITOR.TRAFFIC:
      case CONDITION_EDITOR.TRAFFIC_ARRIVAL_ONLY:
      case CONDITION_EDITOR.TRAFFIC_DEPARTURE_ONLY:
        observableOfType = _settingStore
          .getFarTypes()
          .pipe(map(response => response.map(x => ConditionValueModel.mapEntity(x.id, x.name, x.cappsCode))));
        break;
      case CONDITION_EDITOR.NOISE_CHAPTER_ARRIVAL:
      case CONDITION_EDITOR.NOISE_CHAPTER:
      case CONDITION_EDITOR.NOISE_CHAPTER_DEPARTURE:
        observableOfType = _settingStore
          .getNoiseChapters()
          .pipe(map(response => ConditionValueModel.mapSettingsTypeModel(response)));
        break;
      case CONDITION_EDITOR.FLIGHT_TYPES:
        observableOfType = _settingStore
          .loadFlightType()
          .pipe(map(response => response.map(x => {
            // mapping code for both name and code as getting only code from API
            return ConditionValueModel.mapEntity(x.id, x.code, x.code)
          })));
        break;
      case CONDITION_EDITOR.OVERTIME:
        observableOfType = _settingStore
          .loadOvertime()
          .pipe(map(response => ConditionValueModel.mapSettingsTypeModel(response)));
        break;
      case CONDITION_EDITOR.EPN_DB:
        observableOfType = _settingStore
          .loadNoiseClassifications()
          .pipe(map(response => ConditionValueModel.mapSettingsTypeModel(response)));
        break;
      default:
        observableOfType = of([]);
    }
    UIStore.setPageLoader(true);
    observableOfType
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$),
        tapWithAction(response => setEntityOptions(response))
      )
      .subscribe();
  };

  // When user search something
  const onSearch = (searchValue: string) => {
    const conditionType = useUpsert.getField('conditionType')?.value;
    // only search if there is search value and it's aircraft type settings
    if (!searchValue || conditionType.name?.toLowerCase() !== CONDITION_EDITOR.AIRCRAFT_TYPE) {
      return;
    }
    const request = {
      searchCollection: JSON.stringify([{ propertyName: 'CAPPSRecordId', propertyValue: searchValue }]),
      specifiedFields: [ 'CAPPSRecordId', 'AircraftVariationId' ],
    };
    UIStore.setPageLoader(true);
    _settingStore
      .getAircraftVariations(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const options = ConditionValueModel.mapIdNameCodeEntities(response.results);
        setEntityOptions(options);
      });
  };

  const onFocus = fieldKey => {
    if (fieldKey === 'conditionType') {
      useUpsert.observeSearch(_settingStore.loadConditionTypes());
    }
    if (fieldKey === 'conditionalOperator') {
      const type = useUpsert.getField('conditionType').value;
      loadConditionalOperators(type);
    }
  };

  const onValueChange = (value, fieldKey) => {
    const model = new ConditionModel({ ...props.item });
    switch (fieldKey) {
      case 'conditionType':
        useUpsert.getField('conditionalOperator').set(null);
        useUpsert.getField('conditionValues').set(null);
        model.conditionType = value;
        loadConditionalOperators(value);
        loadConditionValueOptions(value);
        break;
      case 'conditionalOperator':
        useUpsert.getField('conditionValues').set([]);
        model.conditionalOperator = value;
        model.conditionValues = [];
        break;
      case 'conditionValues':
        const conditionValues = Array.isArray(value)
          ? value
          : [ 'boolean', 'string' ].includes(typeof value)
            ? [ new ConditionValueModel({ entityValue: value }) ]
            : [ value ];
        model.conditionValues = conditionValues as ConditionValueModel[];
        break;
    }
    props.onChanges(model);
    // Need Some delay due to rance condition in validations
    setTimeout(() => useUpsert.getField(fieldKey).set(value), 100);
  };

  const inputControls: IViewInputControl[] = [
    {
      fieldKey: 'conditionType',
      type: EDITOR_TYPES.DROPDOWN,
      options: _settingStore.conditionTypes,
    },
    {
      fieldKey: 'conditionalOperator',
      type: EDITOR_TYPES.DROPDOWN,
      options: operators,
      //isDisabled: !Boolean(conditionType),
    },
    {
      fieldKey: 'conditionValues',
      type: editorType,
      excludeEmptyOption: true,
      isBoolean: isSelectControl,
      containerClass: isSelectControl ? classes.containerClass : '',
      // isDisabled: !Boolean(conditionType) || !Boolean(conditionalOperator),
      options: entityOptions,
      multiple: isMultiSelect(),
    },
  ];

  // Wait for mount form controls
  if (isMounting) {
    return <></>;
  }

  return (
    <Box display="flex" flexDirection="row">
      {inputControls.map((inputControl: IViewInputControl, index: number) => {
        const field = useUpsert.getField(inputControl.fieldKey || '');
        return (
          <ViewInputControl
            {...inputControl}
            key={index}
            field={field}
            isEditable={props.isRowEditing}
            onValueChange={onValueChange}
            onFocus={onFocus}
            onSearch={onSearch}
            classes={{
              flexRow: classNames({
                [classes.typeField]: inputControl.fieldKey === 'conditionType',
                [classes.operatorField]: inputControl.fieldKey === 'conditionalOperator',
              }),
            }}
          />
        );
      })}
      <ViewPermission hasPermission={props.isRowEditing}>
        <div className={classes.deleteButtonWrapper}>
          <SecondaryButton
            variant="outlined"
            color="secondary"
            classes={{ root: classes.deleteButtonRoot }}
            onClick={props.onDelete}
          >
            <Delete />
          </SecondaryButton>
        </div>
      </ViewPermission>
    </Box>
  );
};

export default observer(HourConditionEditor);

import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { IUseUpsert, withFormFields, CustomModel } from '@wings/shared';
import React, { FC, useEffect } from 'react';
import { customFields } from '../fields';
import { CountryStore, EntityMapStore, SettingsStore } from '../../../../Shared';
import { inject, observer } from 'mobx-react';
import { useStyles } from '../OperationalRequirements.styles';
import { IOptionValue } from '@wings-shared/core';
import { CloudUpload } from '@material-ui/icons';
import { ImportDialog } from '@wings-shared/layout';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props {
  useUpsert: IUseUpsert;
  settingsStore?: SettingsStore;
  countryStore?: CountryStore;
  entityMapStore?: EntityMapStore;
}

const Custom: FC<Props> = ({ useUpsert, settingsStore, countryStore, entityMapStore }: Props) => {
  const classes = useStyles();
  const _entityMapStore = entityMapStore as EntityMapStore;
  const _settingsStore = settingsStore as SettingsStore;

  useEffect(() => {
    loadInitialData();
    return () => {
      useUpsert.form.reset();
    };
  }, []);

  const loadInitialData = () => {
    const custom = countryStore?.selectedCountry?.customsOperationalRequirement;
    useUpsert.setFormValues(custom || new CustomModel());
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string) => {
    useUpsert.onValueChange(value, fieldKey);
    let fields: string[] = [];
    switch (fieldKey) {
      case 'isAlcoholClearanceAllowed':
        useUpsert.clearFormFields('allowableAlcoholClearance');
        break;
      case 'isDisinsectionRequired':
        fields = [
          'appliedDisinsectionDepartureCountries',
          'appliedDisinsectionDepartureCountries',
          'appliedDisinsectionTypes',
          'appliedDisinsectionChemicals',
          'isAllDisinsectionDeparture',
          'formURL',
        ];
        useUpsert.clearFormFields(fields);
        useUpsert.getField('isDocumentationRequired').set(null);
        useUpsert.getField('isDisinfectionRequired').set(null);
        break;
      case 'isAllDisinsectionDeparture':
        useUpsert.getField('appliedDisinsectionDepartureCountries').set([]);
        break;
      case 'isAPISRequired':
        fields = [ 'appliedAPISRequirements', 'apisSubmission', 'apisSubmissionAddress', 'apisFormat' ];
        useUpsert.clearFormFields(fields);
        break;
      case 'isWeaponsOnBoardAllowed':
        fields = [ 'weaponsOnBoardRequiredDocuments', 'appliedWeaponInformations', 'weaponOnBoardVendors' ];
        useUpsert.clearFormFields(fields);
        break;
      default:
        break;
    }
  };

  /* istanbul ignore next */
  const openAgentProfileDialog = () => {
    ModalStore.open(
      <ImportDialog
        title="Select Document"
        isLoading={() => useUpsert.isLoading}
        onUploadFile={file => {
          useUpsert.getField('apisFormat').sync();
          useUpsert.getField('apisFormat').set(file.name);
          ModalStore.close();
          return;
        }}
      />
    );
  };

  // NOTE: Api Functionality is not yet Done
  // const apiFormatEndAdornment = () => {
  //   if (!useUpsert.getField('isAPISRequired').value) {
  //     return <></>;
  //   }
  //   return <CloudUpload onClick={openAgentProfileDialog} />;
  // };

  const onSearch = (searchValue: string, fieldKey: string) => {
    useUpsert.observeSearch(_entityMapStore.searchEntities(searchValue, fieldKey));
  };

  const onFocus = (fieldKey: string) => {
    switch (fieldKey) {
      case 'apisSubmission':
        useUpsert.observeSearch(_settingsStore.getAPISSubmission());
        break;
      case 'declarationRequiredForCashCurrency':
        useUpsert.observeSearch(_settingsStore.getDeclarationForCashCurrency());
        break;
      default:
        useUpsert.observeSearch(_entityMapStore.loadEntities(fieldKey));
        break;
    }
  };

  const groupInputControls = (): IGroupInputControls[] => [
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'isAlcoholClearanceAllowed',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'allowableAlcoholClearance',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: !useUpsert.getField('isAlcoholClearanceAllowed').value,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'isDisinsectionRequired',
          type: EDITOR_TYPES.CHECKBOX,
          isFullFlex: true,
        },
        {
          fieldKey: 'isAllDisinsectionDeparture',
          type: EDITOR_TYPES.CHECKBOX,
          isDisabled: !useUpsert.getField('isDisinsectionRequired').value,
        },
        {
          fieldKey: 'appliedDisinsectionDepartureCountries',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.countries,
          isDisabled:
            !useUpsert.getField('isDisinsectionRequired').value ||
            useUpsert.getField('isAllDisinsectionDeparture').value,
        },
        {
          fieldKey: 'appliedDisinsectionTypes',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.disinsectionType,
          isDisabled: !useUpsert.getField('isDisinsectionRequired').value,
        },
        {
          fieldKey: 'appliedDisinsectionChemicals',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.disinsectionChemical,
          isDisabled: !useUpsert.getField('isDisinsectionRequired').value,
        },
        {
          fieldKey: 'isDisinfectionRequired',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          isDisabled: !useUpsert.getField('isDisinsectionRequired').value,
          containerClass: classes?.containerClass,
        },
        {
          fieldKey: 'isDocumentationRequired',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          isDisabled: !useUpsert.getField('isDisinsectionRequired').value,
          containerClass: classes?.containerClass,
        },
        {
          fieldKey: 'formURL',
          type: EDITOR_TYPES.LINK,
          isDisabled: !useUpsert.getField('isDisinsectionRequired').value,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'isAPISRequired',
          type: EDITOR_TYPES.CHECKBOX,
          isFullFlex: true,
        },
        {
          fieldKey: 'appliedAPISRequirements',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.apisRequirement,
          isDisabled: !useUpsert.getField('isAPISRequired').value,
        },
        {
          fieldKey: 'apisSubmission',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.apisSubmission,
          isDisabled: !useUpsert.getField('isAPISRequired').value,
        },
        {
          fieldKey: 'apisSubmissionAddress',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: !useUpsert.getField('isAPISRequired').value,
        },
        // {
        //   fieldKey: 'apisFormat',
        //   type: EDITOR_TYPES.TEXT_FIELD,
        //   endAdormentValue: apiFormatEndAdornment(),
        //   isDisabled: true,
        // },
        {
          fieldKey: 'apisFormat',
          type: EDITOR_TYPES.TEXT_FIELD,
          containerClass: classes?.containerClass,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'isWeaponsOnBoardAllowed',
          type: EDITOR_TYPES.CHECKBOX,
          isFullFlex: true,
        },
        {
          fieldKey: 'weaponsOnBoardRequiredDocuments',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.documents,
          isDisabled: !useUpsert.getField('isWeaponsOnBoardAllowed').value,
        },
        {
          fieldKey: 'appliedWeaponInformations',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.weaponInformation,
          isDisabled: !useUpsert.getField('isWeaponsOnBoardAllowed').value,
        },
        {
          fieldKey: 'weaponOnBoardVendors',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.vendors,
          isDisabled: !useUpsert.getField('isWeaponsOnBoardAllowed').value,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'declarationRequiredForCash',
          type: EDITOR_TYPES.TEXT_FIELD,
          containerClass: classes?.containerClass,
        },
        {
          fieldKey: 'declarationRequiredForCashCurrency',
          type: EDITOR_TYPES.DROPDOWN,
          containerClass: classes?.containerClass,
          options: _settingsStore.declarationForCashCurrency,
        },
      ],
    },
  ];

  return (
    <ViewInputControlsGroup
      groupInputControls={groupInputControls()}
      field={fieldKey => useUpsert.getField(fieldKey)}
      isEditing={useUpsert.isEditable}
      isLoading={useUpsert.isLoading}
      onValueChange={(value, fieldKey) => onValueChange(value, fieldKey)}
      onFocus={fieldKey => onFocus(fieldKey)}
      onSearch={(searchValue, fieldKey) => onSearch(searchValue, fieldKey)}
    />
  );
};

// eslint-disable-next-line max-len
export default withFormFields(
  inject('settingsStore', 'countryStore', 'entityMapStore')(observer(Custom)),
  customFields
);

import { auditFields } from '@wings/shared';
import { AssociatedOfficeModel, AssociatedOperatorsModel, AssociatedRegistriesModel } from '../../Shared';
import { EntityMapModel, IdNameCodeModel } from '@wings-shared/core';

export const defaultCustomerData = { id: 0, registries: [], operators: [], offices: [] };

export const fields = {
  ...auditFields,
  externalCustomerMappingLevel: {
    label: 'Mapping Level',
    rules: 'required',
  },
  externalCustomerSource: {
    label: 'External Account',
    rules: 'required',
  },
  externalAccountId: {
    label: 'External Account ID',
    rules: 'string|max:50',
  },
  externalApiKey: {
    label: 'External API Key',
    rules: 'required|string|between:1,200',
  },
  customer: {
    label: 'Customer',
    rules: 'required',
  },
  customerAssociatedRegistries: {
    label: 'Registries',
    value: null, // Do not change
  },
  customerAssociatedOperators: {
    label: 'Operators',
    value: null, // Do not change
  },
  customerAssociatedOffices: {
    label: 'Offices',
    value: null, // Do not change
  },
  accessLevel: {
    label: 'Access Level',
    rules: 'required',
  },
  status: {
    label: 'Status',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
};

export const mapEntity = (
  key: string,
  options?: AssociatedOfficeModel[] | AssociatedOperatorsModel[] | AssociatedRegistriesModel[]
) => {
  if (!Boolean(options?.length)) return [];
  const filtredOptions = options.filter(({ status }) => status?.name === 'Active');
  switch (key) {
    case 'associatedOffices':
      // Id and entity id is same in offices see.. AssociatedOfficeModel
      return filtredOptions.map(x => new EntityMapModel({ id: x.id, entityId: x.id, name: x.name }));
    case 'associatedOperators':
      return options.map(x => new EntityMapModel({ id: x.id, entityId: x.operator?.id, name: x.operator?.name }));
    case 'associatedRegistries':
      return options.map(x => new EntityMapModel({ id: x.id, entityId: x.registry?.id, name: x.registry?.name }));
    default:
      return [];
  }
};

export const isMultiSelect = (level: string): boolean => {
  if (!level) {
    return false;
  }

  if (level.split('/').length > 2) {
    return false;
  }
  return true;
};

export const hasKey = (fieldKey: string, level: string) => {
  // if externalCustomerMappingLevel contain these keys  'registry' | 'operator' | 'office' then allow editing
  // Customer / Registry - single customer - multi- registry
  // Customer / Operator - single customer - multi operator
  // Customer / Office - single customer - multi office
  // Customer / Registry / Operator - single customer, single registry, single operator
  return level
    .toLowerCase()
    .split('/')
    .map(x => x?.trim())
    .includes(fieldKey.toLowerCase());
};

export const isDisabled = (fieldKey: 'registry' | 'operator' | 'office', level, customer): boolean => {
  // If customer not selected then disable it
  if (!customer?.name) {
    return true;
  }
  return !hasKey(fieldKey, level);
};

export const mapToArray = (items: IdNameCodeModel[]) => {
  return Array.isArray(items) ? items : [ items ];
};

// as per condition // 178691 Customer / Registry / Operator - single customer, single registry, single operator
export const mapToSignleObject = (items: (IdNameCodeModel | EntityMapModel)[], isMultiSelect) => {
  if (isMultiSelect) {
    return items;
  }
  return items.length ? items[0] : null;
};

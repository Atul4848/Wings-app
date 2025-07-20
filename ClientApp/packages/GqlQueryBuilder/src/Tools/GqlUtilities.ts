import { camelCase } from 'change-case';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { Utilities } from '@wings-shared/core';

// Convert CamelCasing to Normal Name
export const camelCasingToLevel = (text: string, isArray: boolean = false) => {
  const result = text.replace(/([A-Z])/g, ' $1');
  const name = result.charAt(0).toUpperCase() + result.slice(1);
  return isArray ? [name, 'List'].join(' ') : name;
};

// Get Field Type By a Name
const getFieldType = (fieldName: string) => {
  switch (fieldName) {
    case 'StringOperationFilterInput':
      return 'text';
    case 'BooleanOperationFilterInput':
      return 'boolean';
    case 'IntOperationFilterInput':
    case 'DecimalOperationFilterInput':
    case 'LongOperationFilterInput':
    case 'ByteOperationFilterInput':
      return 'number';
    case 'DateTimeOperationFilterInput':
      return 'datetime';
    default:
      return '';
  }
};

// Get Field Type By a Name
const getOperators = (fieldName: string) => {
  switch (fieldName) {
    case 'StringOperationFilterInput':
      return [
        'equal',
        'not_equal',
        'contains',
        'not_contains',
        'starts_with',
        'ends_with',
        'is_empty',
        'is_not_empty',
        'matches_regex',
        'does_not_match_regex',
      ];
    case 'IntOperationFilterInput':
    case 'DecimalOperationFilterInput':
    case 'LongOperationFilterInput':
    case 'ByteOperationFilterInput':
      return [
        'equal',
        'not_equal',
        'less',
        'less_or_equal',
        'greater',
        'greater_or_equal',
      ];
    case 'DateTimeOperationFilterInput':
      return [
        'equal',
        'not_equal',
        'less',
        'less_or_equal',
        'greater',
        'greater_or_equal',
      ];
    case 'BooleanOperationFilterInput':
      return ['equal', 'is_true', 'is_false', 'is_null', 'is_not_null'];
    default:
      return '';
  }
};

const isOperatorField = (fieldName: string) => {
  return [
    'StringOperationFilterInput',
    'IntOperationFilterInput',
    'DecimalOperationFilterInput',
    'BooleanOperationFilterInput',
    'DateTimeOperationFilterInput',
    'LongOperationFilterInput',
    'ByteOperationFilterInput',
  ]
    .map(x => x.toLocaleLowerCase())
    .includes((fieldName || '').toLocaleLowerCase());
};

// Reduce Fields and Generate Query builder Format
export const reduceFields = (
  inputFields,
  collectionName,
  emitArrayOperators = false, // IN Components tree we are considering the array list field as a single field
  parentKey,
  getIsSelected
) => {
  const primaryKey = Utilities.isEqual(collectionName, 'AircraftCategory')
    ? 'categoryId'
    : `${collectionName.toLocaleLowerCase()}Id`;

  // If Nested Fields are not available then return
  if (!Array.isArray(inputFields)) {
    return {};
  }
  return inputFields.reduce((total, curr) => {
    // skip and filters as it's already part of query builder
    if (['and', 'or', 'id', '_PreviousHistory'].includes(curr.name)) {
      return total;
    }

    const _nestedInputFields = curr.type?.inputFields;
    const _fieldType: string = curr.type?.name;
    const _isOperatorField = isOperatorField(_fieldType);
    const _isArray = (_fieldType || '').includes('ListFilterInputTypeOf'); // If List Type Available then
    const _isPrimaryKey = Utilities.isEqual(primaryKey, curr.name) && !Boolean(parentKey); // Ignore primary key auto selection inside the child objects
    const fieldName = [parentKey, curr.name].filter(Boolean).join('.');

    return {
      ...total,
      [curr.name]: {
        label: camelCasingToLevel(curr.name, _isArray),
        valueSources: ['value'],
        isArray: _isArray,
        type: _isOperatorField ? getFieldType(_fieldType) : '!group',
        operators: _isOperatorField ? getOperators(_fieldType) : [],
        ...(_isOperatorField
          ? {}
          : {
              // if emitArrayOperators =true then we ignore array operators like all|any|some
              subfields: _isArray
                ? reduceFields(
                    emitArrayOperators
                      ? _nestedInputFields[0]?.type?.inputFields
                      : _nestedInputFields,
                    collectionName,
                    emitArrayOperators,
                    fieldName,
                    getIsSelected
                  )
                : reduceFields(
                    _nestedInputFields,
                    collectionName,
                    emitArrayOperators,
                    fieldName,
                    getIsSelected
                  ),
            }),
        nodeId: fieldName, // Used to uniquely identify item
        selected: _isPrimaryKey ? _isPrimaryKey : getIsSelected(fieldName),
        isPrimaryKey: _isPrimaryKey,
        parentKey,
      },
    };
  }, {});
};

// Generate Recursive Column Defs
export const generateColumns = (_fields, parentKey = '') => {
  if (!_fields) {
    return [];
  }

  if (!Object.keys(_fields).length) {
    return [];
  }

  const columns = Object.keys(_fields).reduce((total, fieldKey, idx) => {
    // ignore id field
    if (['previousHistory', 'id'].includes(camelCase(fieldKey))) {
      return total;
    }

    const { label, subfields, selected } = _fields[fieldKey];

    // If not selected then return
    if (!selected) {
      return total;
    }

    const fieldName = [parentKey, fieldKey].filter(Boolean).join('.');

    const hasSubFields = Boolean(Object.keys(subfields || {}).length);

    const columns: ColDef | ColGroupDef = {
      headerName: label,
      minWidth: 110,
      field: fieldName,
      ...(hasSubFields
        ? { children: generateColumns(subfields, fieldName) }
        : {}),
    };
    total.push(columns);
    return total;
  }, []);
  return columns;
};

// Generate Projection
export const generateProjection = _fields => {
  const columns = Object.keys(_fields || {}).reduce((total, fieldKey) => {
    const { subfields, selected } = _fields[fieldKey];
    if (!selected) {
      return total;
    }

    // If field has sub fields
    if (Object.keys(subfields || {}).length) {
      const _selectedSubfields = generateProjection(subfields);
      // If No Sub Field Is Selected then ignore the property
      return Object.keys(_selectedSubfields || {}).length
        ? { ...total, [fieldKey]: _selectedSubfields }
        : total;
    }

    return { ...total, [fieldKey]: 1 };
  }, {});
  return columns;
};

// Make Data Object Flat
export const flattenDataObject = (obj, prefix = '') => {
  return Object.keys(obj || {}).reduce((flattenedObj, key) => {
    // Exclude These Keys From Excel File So that we get clean Data
    if (['_id', 'id'].includes(key) || key.endsWith('Group')) {
      return flattenedObj;
    }

    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        ...flattenedObj,
        ...flattenDataObject(value, newKey),
      };
    }
    return { ...flattenedObj, [newKey]: value };
  }, {});
};

// Get Selected Fields with Keys

export const getSelectedFields = (fields, grandTotal) => {
  return fields.reduce((total, item) => {
    total.push(item.field);
    if (item.children?.length) {
      return getSelectedFields(item.children, total);
    }
    return total;
  }, grandTotal);
};

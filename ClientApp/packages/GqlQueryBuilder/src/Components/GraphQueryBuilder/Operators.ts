import { mongoFormatOp1 } from './OperatorsHelpers';

// See Here for More Info
// https://github.com/ukrbublik/react-awesome-query-builder/blob/514070485ee86fe520d623fbb2be429c0b8f4616/modules/config/basic.js

// help us to override operators if customization required
export const overrideOperators = operators => {
  return {
    ...operators,
    starts_with: {
      ...operators.starts_with,
      mongoFormatOp: mongoFormatOp1.bind(
        null,
        '$startsWith',
        v => (typeof v == 'string' ? v : undefined),
        false
      ),
    },
    ends_with: {
      ...operators.ends_with,
      mongoFormatOp: mongoFormatOp1.bind(
        null,
        '$endsWith',
        v => (typeof v == 'string' ? v : undefined),
        false
      ),
    },
    // TO Register this custom component
    contains: {
      label: 'Contains',
      valueSources: ['value'],
      mongoFormatOp: mongoFormatOp1.bind(
        null,
        '$contains', // ADD this into mongoToGraphQLOperators under GqlHelper.ts
        v => (typeof v == 'string' ? v : undefined),
        false
      ),
    },
    not_contains: {
      label: 'Not Contains',
      valueSources: ['value'],
      mongoFormatOp: mongoFormatOp1.bind(
        null,
        '$ncontains', // ADD this into mongoToGraphQLOperators under GqlHelper.ts
        // and under overrideTypes
        v => (typeof v == 'string' ? v : undefined),
        false
      ),
    },
  };
};

// over ride default config
export const overrideTypes = types => {
  return {
    ...types,
    text: {
      ...types.text,
      widgets: {
        ...types.text.widgets,
        text: {
          ...types.text.widgets.text,
          // Register custom operators for Text field
          operators: types.text.widgets.text.operators.concat([
            'contains',
            'not_contains',
          ]),
        },
      },
    },
  };
};

export const overrideWidgets = widgets => {
  return {
    ...widgets,
    datetime: {
      ...widgets.datetime,
      timeFormat: 'HH:mm',
      dateFormat: 'DD-MMM-YYYY',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      // DO not change we need this to use value as string original mongoFormatValue convert it into a date object
      mongoFormatValue: (val, fieldDef, wgtDef) => {
        return val;
      },
    },
  };
};

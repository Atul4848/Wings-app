import { regex } from '../../Tools';

// allow only one Decimal place
/* istanbul ignore next */
const oneDecimalPlace = validator => {
  validator.register(
    'oneDecimalPlace',
    (value, requirement, attribute) => {
      // requirement parameter defaults to null
      return value?.toString().match(regex.onePlaceDecimal);
    },
    'The :attribute must be one decimal place'
  );
};

/* istanbul ignore next */
const twoDecimalPlace = validator => {
  validator.register(
    'twoDecimalPlace',
    (value, requirement, attribute) => {
      // requirement parameter defaults to null
      return value?.toString().match(regex.numberWithTwoDecimal);
    },
    'The :attribute must be two decimal place'
  );
};

// allow only one Decimal place including Zero
/* istanbul ignore next */
const onePlaceDecimalWithZero = validator => {
  validator.register(
    'onePlaceDecimalWithZero',
    (value, requirement, attribute) => {
      // requirement parameter defaults to null
      return value?.toString().match(regex.onePlaceDecimalWithZero);
    },
    'The :attribute must be one decimal place'
  );
};

/* istanbul ignore next */
const latitudeValidator = validator => {
  validator.register(
    'latitudeValidator',
    (value, requirement, attribute) => {
      // requirement parameter defaults to null
      return value?.toString().match(regex.latitude);
    },
    'Invalid Latitude format.'
  );
};

/* istanbul ignore next */
const longitudeValidator = validator => {
  validator.register(
    'longitudeValidator',
    (value, requirement, attribute) => {
      // requirement parameter defaults to null
      return value?.toString().match(regex.longitude);
    },
    'Invalid Longitude format.'
  );
};

/* istanbul ignore next */
const runwayIdValidator = validator => {
  validator.register(
    'runwayIdValidator',
    (value, requirement, attribute) => {
      // requirement parameter defaults to null
      return value?.toString().match(regex.runwayIdFormat);
    },
    'Runway Id format should be xx or x/x or xx/xx or xxx/xxx (eg: H1, E/S, NE/SW, 12/34, 30L/12R).'
  );
};

/* istanbul ignore next */
const pcnValidator = validator => {
  validator.register(
    'pcnValidator',
    (value, requirement, attribute) => {
      // requirement parameter defaults to null
      return value?.toString().match(regex.stringWithSlash);
    },
    'Only string and / is allowed.'
  );
};

/* istanbul ignore next */
const threeDigitsLimitValidator = validator => {
  validator.register(
    'threeDigitsLimitValidator',
    (value, requirement, attribute) => {
      // requirement parameter defaults to null
      return value?.toString().match(regex.threeDigitsLimit);
    },
    'The :attribute must be upto 3 digits.'
  );
};

const validators = {
  oneDecimalPlace,
  twoDecimalPlace,
  onePlaceDecimalWithZero,
  latitudeValidator,
  longitudeValidator,
  runwayIdValidator,
  pcnValidator,
  threeDigitsLimitValidator,
};
export default validators;

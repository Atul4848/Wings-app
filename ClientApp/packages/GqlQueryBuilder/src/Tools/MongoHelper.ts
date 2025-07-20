const comparisonOperators = [
  '$eq',
  '$ne',
  '$gt',
  '$lt',
  '$gte',
  '$lte',
  '$in',
  '$nin',
];
const logicalOperators = ['$or', '$and'];

// Flat Object Convert the MongoDb
export const mapToMongoDbQuery = (obj, prefix = '') => {
  return Object.keys(obj || {}).reduce((flattenedObj, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    const isIgnoredKey = ['$elemMatch'].includes(key);

    // If it's a MongoDb operator then no need to flat
    if (key.charAt(0) === '$' && !isIgnoredKey) {
      // If it's a Or Operator
      if (logicalOperators.includes(key)) {
        return {
          ...flattenedObj,
          [key]: Array.isArray(value)
            ? value.map((_v) => mapToMongoDbQuery(_v, ''))
            : value,
        };
      }

      // If it's a Comparison Operators
      if (comparisonOperators.includes(key)) {
        flattenedObj[prefix] = { ...flattenedObj[prefix], [key]: value };
        return flattenedObj;
      }

      return { ...flattenedObj, [prefix]: { [key]: value } };
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        ...flattenedObj,
        ...mapToMongoDbQuery(value, isIgnoredKey ? prefix : newKey),
      };
    }
    return { ...flattenedObj, [newKey]: value };
  }, {});
};

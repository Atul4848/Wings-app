// This mapper helps convert mongo db operators into GQL
const mongoToGraphQLOperators = {
  $eq: 'eq',
  $ne: 'neq',
  $gt: 'gt',
  $lt: 'lt',
  $gte: 'gte',
  $lte: 'lte',
  $in: 'in',
  $nin: 'nin',
  $regex: 'regex',
  $exists: 'exists',
  $type: 'type',
  $and: 'and',
  $or: 'or',
  $not: 'not',
  // Custom Operators  see operators.ts overrideOperators
  $startsWith: 'startsWith',
  $endsWith: 'endsWith',
  $contains: 'contains',
  $ncontains: 'ncontains',
};

// Flat Object Convert the MongoDb
export const mapToQglQuery = obj => {
  return Object.keys(obj || {}).reduce((flattenedObj, key) => {
    const value = obj[key];
    const isIgnoredKey = ['$elemMatch'].includes(key);

    // If it's a MongoDb operator then no need to flat
    if (key.startsWith('$')) {
      // If we needs to ignore the current key then
      if (isIgnoredKey) {
        return {
          ...flattenedObj,
          ...mapToQglQuery(value),
        };
      }

      // handel In Operator Case
      if (['$nin', '$in'].includes(key)) {
        return {
          ...flattenedObj,
          [mongoToGraphQLOperators[key]]: value,
        };
      }

      return {
        ...flattenedObj,
        [mongoToGraphQLOperators[key]]: Array.isArray(value)
          ? value.map(_v => mapToQglQuery(_v))
          : value,
      };
    }

    // If Current Key is A Simple Object
    const isObject =
      typeof value === 'object' && value !== null && !Array.isArray(value);
    return {
      ...flattenedObj,
      [key]: isObject ? mapToQglQuery(value) : { eq: value },
    };
  }, {});
};

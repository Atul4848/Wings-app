/* istanbul ignore next */
// Generate Query for /gql endpoint
const toGraphQLSort = (path, direction = 'ASC') => {
  return path.split('.').reduceRight((acc, key) => ({ [toCamelCase(key)]: acc }), direction);
};

const toCamelCase = str => {
  if (!str) return str;

  // Case 1: ALL UPPERCASE (e.g. "ID") → all lowercase
  if (/^[A-Z]+$/.test(str)) {
    return str.toLowerCase();
  }

  // Case 2: Acronym at start (e.g. "ISOCode", "ISO2Code") → lower first acronym
  const match = str.match(/^([A-Z0-9]+)(?=[A-Z][a-z])/);
  if (match) {
    const prefix = match[1].toLowerCase();
    return prefix + str.slice(prefix.length);
  }

  // Case 3: Standard PascalCase → lowercase first char
  return str[0].toLowerCase() + str.slice(1);
};

const isNumber = str => !isNaN(str) && str.trim() !== '';

const formatGraphQLInline = (obj, isFromFilter = false) => {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return obj;

  const entries = Object.entries(obj).map(([ key, value ]) => {
    if (value === null) {
      return `${key}:null`;
    } else if (Array.isArray(value)) {
      const items = value
        .map(v => {
          if (typeof v === 'object' && v !== null) {
            return `{${formatGraphQLInline(v, isFromFilter)}}`;
          } else if (typeof v === 'string') {
            const isGraphQLEnum = /^[A-Z_]+$/.test(v);
            return isGraphQLEnum || (isFromFilter && isNumber(v)) ? v : `"${v}"`;
          } else {
            return `${v}`;
          }
        })
        .join(',');
      return `${key}:[${items}]`;
    } else if (typeof value === 'object') {
      return `${key}:{${formatGraphQLInline(value, isFromFilter)}}`;
    } else if (typeof value === 'string') {
      const isGraphQLEnum = /^[A-Z_]+$/.test(value);
      return `${key}:${isGraphQLEnum || (isFromFilter && isNumber(value)) ? value : `"${value}"`}`;
    } else {
      return `${key}:${value}`;
    }
  });

  return entries.join(',');
};

const buildGraphQLFilter = (
  propertyName,
  propertyValue,
  filterType = 'contains',
  isFromFilter = false,
  wrapInSome = false,
  searchType = '',
  isArray = false
) => {
  if (!propertyName) return {};
 
  const parts = propertyName.split('.').map(toCamelCase);
  const value = typeof propertyValue === 'string' ? propertyValue.toLowerCase() : propertyValue;
 
  // Determine correct GraphQL operator
  let _filterType;
  switch (filterType) {
    case 'ne':
      _filterType = 'neq';
      break;
    case 'in':
      _filterType = 'in';
      break;
    default:
      _filterType = isFromFilter ? 'eq' : filterType;
  }
 
  const _searchType = searchType === 'start' ? 'startsWith' : searchType;
  const finalKey = _searchType || _filterType;
 
  // Build leaf node
  let filterObject = { [finalKey]: value };
 
  // Build nested structure from right to left
  for (let i = parts.length - 1; i >= 0; i--) {
    const key = parts[i];
    filterObject = { [key]: filterObject };
  }
 
  // Now apply `some` at the top level if array
  if (isArray || wrapInSome) {
    const topKey = Object.keys(filterObject)[0];
    filterObject = { [topKey]: { some: filterObject[topKey] } };
  }
 
  return filterObject;
};

// Deep Merge Filter Trees
const mergeDeep = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeDeep(target[key], source[key]));
    }
  }
  return { ...target, ...source };
};

const parseQueryString = queryString => {
  const params = Object.fromEntries(new URLSearchParams(queryString));
  const result: any = {};

  for (const [ key, value ] of Object.entries(params)) {
    let parsedValue: any = value;

    // Try to parse JSON if it looks like JSON
    if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        console.error(e);
      }
    } else if (value === 'true') {
      parsedValue = true;
    } else if (value === 'false') {
      parsedValue = false;
    } else if (!isNaN(value as any) && value.trim() !== '') {
      const keyIsSearchValue = key.startsWith('searchCollection[') && key.endsWith('].propertyValue');
      // Only convert to number if NOT from searchCollection
      parsedValue = keyIsSearchValue ? value : Number(value);
    }

    result[key] = parsedValue;
  }

  return result;
};

export const getGqlQuery = (params: string, items: string) => {
  const { pageSize, pageNumber, searchCollection, filterCollection, sortCollection, collectionName } = parseQueryString(
    params
  );
  const skip = pageSize * (pageNumber - 1);
  const take = pageSize;
  const skipTake = Boolean(pageSize) ? `skip: ${skip},take: ${take}` : 'take: 9999';

  const allSearchFilters = (searchCollection || []).map(f => ({ ...f, isFromFilter: false }));
  const allFilterFilters = (filterCollection || []).map(f => ({ ...f, isFromFilter: true }));
  let where = '';

  if (allSearchFilters.length && allFilterFilters.length) {
    const hasOrInFilter = searchCollection.some(f => f.operator === 'or');

    let filterMerged = {};
    for (const f of allFilterFilters) {
      const obj = buildGraphQLFilter(f.propertyName, f.propertyValue, f.filterType, f.isFromFilter, f.isArray);
      filterMerged = mergeDeep(filterMerged, obj);
    }

    let searchMerged = {};
    for (const f of allSearchFilters) {
      const obj = buildGraphQLFilter(
        f.propertyName,
        f.propertyValue,
        f.filterType,
        f.isFromFilter,
        f.isArray,
        f.searchType
      );
      searchMerged = mergeDeep(searchMerged, obj);
    }

    if (hasOrInFilter) {
      const orBlock = {
        or: allSearchFilters.map(f =>
          buildGraphQLFilter(f.propertyName, f.propertyValue, f.filterType, false, f.isArray, f.searchType)
        ),
      };
      const andBlock = allFilterFilters.map(f =>
        buildGraphQLFilter(f.propertyName, f.propertyValue, f.filterType, true, f.isArray)
      );
      if (orBlock.or.length) andBlock.push(orBlock);
      where = `where:{and:[${andBlock.map(f => `{${formatGraphQLInline(f, true)}}`).join(',')}]}`;
    } else {
      const combined = mergeDeep(filterMerged, searchMerged);
      where = `where:{${formatGraphQLInline(combined, true)}}`;
    }
  } else if (allSearchFilters.length) {
    const andConditions = allSearchFilters
      .filter(f => !f.operator || f.operator === 'and')
      .map(f => buildGraphQLFilter(f.propertyName, f.propertyValue, f.filterType, false, f.isArray, f.searchType));

    const orConditions = allSearchFilters
      .filter(f => f.operator === 'or')
      .map(f => buildGraphQLFilter(f.propertyName, f.propertyValue, f.filterType, false, f.isArray, f.searchType));

    if (andConditions.length && orConditions.length) {
      if (andConditions.length === 1 && Boolean(orConditions.length)) {
        // Case: Single and, or all without operator → treat as OR
        const orBlock = allSearchFilters.map(f =>
          buildGraphQLFilter(f.propertyName, f.propertyValue, f.filterType, false, f.isArray, f.searchType)
        );
        where = `where:{or:[${orBlock.map(f => `{${formatGraphQLInline(f, false)}}`).join(',')}]}`;
      } else {
        // Case: Mixed and + or
        const all = [ ...andConditions ];
        all.push({ or: orConditions });
        where = `where:{and:[${all.map(f => `{${formatGraphQLInline(f, false)}}`).join(',')}]}`;
      }
    } else if (orConditions.length) {
      // Only OR conditions
      where = `where:{or:[${orConditions.map(f => `{${formatGraphQLInline(f, false)}}`).join(',')}]}`;
    } else {
      // Fallback: AND merge
      const merged = andConditions.reduce((acc, f) => mergeDeep(acc, f), {});
      where = `where:{${formatGraphQLInline(merged, false)}}`;
    }
  } else if (allFilterFilters.length) {
    // Only filters
    const hasOrInFilter = filterCollection.some(f => f.operator === 'or');
    if (hasOrInFilter) {
      const orConditions = allFilterFilters.map(f =>
        buildGraphQLFilter(f.propertyName, f.propertyValue, f.filterType, true, f.isArray)
      );
      where = `where:{or:[${orConditions.map(obj => `{${formatGraphQLInline(obj, true)}}`).join(',')}]}`;
    } else {
      let merged = {};
      for (const f of allFilterFilters) {
        const obj = buildGraphQLFilter(f.propertyName, f.propertyValue, f.filterType, true, f.isArray);
        merged = mergeDeep(merged, obj);
      }
      where = `where:{${formatGraphQLInline(merged, true)}}`;
    }
  }

  const sort = sortCollection ? sortCollection[0] : [];
  const order = sort?.propertyName
    ? `order:[{${formatGraphQLInline(toGraphQLSort(sort.propertyName, sort.isAscending ? 'ASC' : 'DESC'))}}]`
    : '';

  return `query Search {${toCamelCase(collectionName)}(${[ where, skipTake, order ]
    .filter(Boolean)
    .join(',')}){items ${items}}`;
};

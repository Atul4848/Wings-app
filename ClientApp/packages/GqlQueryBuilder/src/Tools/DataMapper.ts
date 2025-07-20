const processRow = (row, parent, hasParent) => {
  let rowItem = {};
  const nestedItems = [];
  Object.keys(row || {}).forEach(key => {
    const _value = row[key];
    // item item is array type then we need to process it again
    if (Array.isArray(_value)) {
      // const items = generateFlatData(_value, parent.concat(key), true);
      // nestedItems.push(...items);

      _value.forEach(item => {
        const data = processRow(item, parent.concat(key), true);
        nestedItems.push(data.rowItem); // Flatten the result into nestedItems
        nestedItems.push(...data.nestedItems); // Include any further nested items
      });
      return;
    }

    if (typeof _value === 'object') {
      if (!_value) {
        rowItem[key] = '';
        return;
      }
      const data = processRow(_value, parent.concat(key), false) as any;
      rowItem[key] = data.rowItem;
      nestedItems.push(...data.nestedItems);
      return;
    }
    // If not array or object then continue
    rowItem[key] = _value;
  });

  if (hasParent) {
    const _rowItem = [...parent]
      .reverse()
      .reduce((acc, key) => ({ [key]: acc }), rowItem);
    return {
      rowItem: _rowItem,
      nestedItems,
    };
  }

  return { rowItem, nestedItems };
};

// Function to flatten any dynamic structure while maintaining hierarchy
export const generateFlatData = (arr, parent = [], hasParent = false) => {
  const result = [];
  arr.forEach(row => {
    const items = processRow(row, parent, hasParent) as any;
    result.push(items.rowItem);
    result.push(...items.nestedItems);
  });
  return result;
};

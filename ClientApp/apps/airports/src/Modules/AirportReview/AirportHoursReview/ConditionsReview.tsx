import React from 'react';
import { Box, Typography } from '@mui/material';
const labelOrder = [ 'ConditionType', 'ConditionalOperator', 'ConditionValues' ];
const labelMap = {
  ConditionType: 'Condition Type',
  ConditionalOperator: 'Conditional Operator',
  ConditionValues: 'Condition Values',
};
const formatSingleValue = (v, field) => {
  if (field === 'ConditionalOperator') {
    if (typeof v === 'object' && v !== null) {
      return v.operator || JSON.stringify(v);
    }
    return v?.toString() || '—';
  }
  if (typeof v === 'object' && v !== null) {
    return v.entityValue || v.name || JSON.stringify(v);
  }
  return v?.toString() || '—';
};
const formatValue = (value, field) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(v => formatSingleValue(v, field)).join(', ');
    }
    return formatSingleValue(value, field);
  }
  return value.toString();
};
const ConditionChanges = ({ data }) => {
  const grouped = React.useMemo(() => {
    const result = {};
    data.forEach(({ propertyName, oldValue, newValue }) => {
      const match = propertyName.match(/Conditions\[(\d+)\]\.(\w+)/);
      if (!match) return;
      const [ , index, field ] = match;
      if (!result[index]) result[index] = { before: {}, after: {} };
      result[index].before[field] = oldValue;
      result[index].after[field] = newValue;
    });
    return result;
  }, [ data ]);
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Conditions
      </Typography>
      {Object.entries(grouped).map(([ idx, { before, after }]) => (
        <Box key={idx} sx={{ mb: 4 }}>
          {/* Header */}
          <Box display="flex" mb={1}>
            {labelOrder.map(key => (
              <Box key={key} flex={1} fontWeight="bold">
                {labelMap[key]}
              </Box>
            ))}
          </Box>
          <Box display="flex" mb={3}>
            {labelOrder.map(field => {
              const oldVal = before[field];
              const newVal = after[field];
              const oldFormatted = formatValue(oldVal, field);
              const newFormatted = formatValue(newVal, field);
              const isChanged = oldFormatted !== newFormatted;
              return (
                <Box key={field} flex={1} pr={4}>
                  {isChanged ? (
                    <>
                      <Typography variant="body2" sx={{ color: 'red', textDecoration: 'line-through' }}>
                        {oldFormatted}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'green' }}>
                        {newFormatted}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2">{newFormatted}</Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
export default ConditionChanges;

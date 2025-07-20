export const escapeRegExp = string => {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'); // $& means the whole matched string
};

// helpers for mongo format
export const mongoFormatOp1 = (mop, mc, not, field, _op, value, useExpr) => {
  const mv = mc(value);
  if (mv === undefined) return undefined;
  if (not) {
    return !useExpr
      ? { [field]: { $not: { [mop]: mv } } }
      : { $not: { [mop]: ['$' + field, mv] } };
  } else {
    if (!useExpr && mop == '$eq') return { [field]: mv }; // short form
    return !useExpr ? { [field]: { [mop]: mv } } : { [mop]: ['$' + field, mv] };
  }
};

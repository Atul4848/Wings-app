import React from 'react';
import CustomerApp from './index';

function CustomerRoot(params: any) {
  return <CustomerApp basePath="customer" {...params} />;
}
export default CustomerRoot;

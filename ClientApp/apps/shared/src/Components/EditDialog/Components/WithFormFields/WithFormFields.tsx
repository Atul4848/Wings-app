import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

export const withFormFields = (WrappedComponent, fields) =>
  observer(props => {
    const [ isLoading, setIsLoading ] = useState(true);
    // Do Not render WrappedComponent Until Fields setup is Done
    useEffect(() => {
      props.useUpsert.setFormFields(fields);
      setIsLoading(false);
    }, []);
    return isLoading ? <></> : <WrappedComponent {...props} />;
  });

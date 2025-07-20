import { Button } from '@mui/material';
import React from 'react';

interface IProps {
  error: Error;
}

/**
 * @description Fallback UI State that is passed to React-Error-Boundary
 * @description REF: https://www.npmjs.com/package/react-error-boundary#usage
 * @param{error} Error object: from React-error-Boundary displayed in UI
 */

const ErrorFallbackDefault: React.FC<IProps> = ({ error }) => {
  return (
    <div role="alert" style={{ padding: '1rem', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '0' }}>Localized Error Contained:</h3>
      <p style={{ marginTop: '0' }}> (Try Refreshing Browser) </p>
      <Button variant="outlined" onClick={() => window?.location.reload()}>
        Refresh Page
      </Button>
      <pre>{`Error Info: ${error.message}`}</pre>
      <pre>For more info see console logs.</pre>
    </div>
  );
};
export default ErrorFallbackDefault;

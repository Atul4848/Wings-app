import React from 'react';
import { useParams, useNavigate, useSearchParams, Params, NavigateFunction } from 'react-router-dom';

export interface IWithRouterProps {
  params: Params;
  navigate: NavigateFunction;
  searchParams: URLSearchParams;
}

const withRouter = Component => {
  /* istanbul ignore next */
  const Wrapper = props => {
    const params = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    return <Component navigate={navigate} params={params} searchParams={searchParams} {...props} />;
  };

  return Wrapper;
};

export default withRouter;

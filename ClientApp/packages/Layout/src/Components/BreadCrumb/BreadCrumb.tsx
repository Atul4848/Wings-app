import React, { FC } from 'react';
import { Breadcrumbs, Link } from '@material-ui/core';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useStyles } from './BreadCrumb.styles';
import { VIEW_MODE } from '@wings/shared';
import { regex } from '@wings-shared/core';

const BreadCrumb: FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const params = useParams();
  const { pathname } = useLocation();
  const pathnames = pathname.split('/').filter(Boolean);

  const capitalizeAfterHyphen = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isEditOrDetail =
    params.viewMode &&
    (params.viewMode.includes(VIEW_MODE.EDIT.toLowerCase()) ||
      params.viewMode.includes(VIEW_MODE.DETAILS.toLowerCase()));

  const getRouteName = (name: string, index?: any) => {
    const modifiedName = name.toLowerCase();

    if (
      isEditOrDetail &&
      (modifiedName === 'edit' || modifiedName === 'details')
    ) {
      return 'Details';
    }
    return capitalizeAfterHyphen(name);
  };

  const getRedirectPath = (pathnames, currentIndex) => {
    const currentBreadcrumb = pathnames[currentIndex].toLowerCase();
    if (
      currentBreadcrumb === 'operational-requirements' ||
      currentBreadcrumb === 'custom-detail'
    ) {
      return `/${pathnames.join('/')}`;
    }
    return `/${pathnames.slice(0, currentIndex + 1).join('/')}`;
  };

  const containsNumberAndCharacterOrOnlyNumber = str =>
    regex.alphaNumericNumberOnly.test(str);

  return (
    <Breadcrumbs aria-label="breadcrumb" className={classes.root}>
      {pathnames.map((name, index) => {
        if (
          containsNumberAndCharacterOrOnlyNumber(name) ||
          name.includes('upsert') ||
          name.includes('source-location') ||
          name.includes(params?.icao) ||
          name.includes(params?.siteId)
        ) {
          return null;
        }
        const redirectTo = getRedirectPath(pathnames, index);
        const isLast = index === pathnames.length - 1;
        const routeName = getRouteName(name, index);
        if (routeName !== '') {
          return (
            <Link
              className={isLast ? classes.activeRoute : classes.nonActiveRoute}
              key={name}
              onClick={() => (isLast ? '' : navigate(redirectTo))}
            >
              {getRouteName(name, index)}
            </Link>
          );
        }
        return null;
      })}
    </Breadcrumbs>
  );
};

export default BreadCrumb;

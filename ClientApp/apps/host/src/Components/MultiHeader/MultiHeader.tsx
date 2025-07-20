import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useState, useEffect } from 'react';

import { IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { PinIcon, PinVerticalIcon, UvGoIcon, Search2Icon } from '@uvgo-shared/icons';
import { UIStore, Utilities, ViewPermission } from '@wings-shared/core';

import Logo from './logo.png';
import MainMenuButton from './MainMenuButton';
import { MainNavLink } from './MainNavLink';
import { styles } from './MultiHeader.styles';
import { IMainNavLink } from './types';
import { useLocation, useNavigate } from 'react-router';

interface Props {
  links: IMainNavLink[];
  classes: { [name: string]: string };
  uvGoLink: string;
  rightSide?: React.ReactNode;
  logoDoubleClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  exact?: boolean;
  delay?: number;
  showAdvanceSearch: boolean;
  hostEnvironment: string;
}

const advanceSearchMenu: IMainNavLink = {
  to: 'advance-search',
  icon: <Search2Icon size="x-large" />,
  label: 'Search',
  isMenuButton: true,
};

const MultiHeader: FunctionComponent<Props> = observer(props => {
  const [ isHeaderFocused, setIsHeaderFocused ] = useState(false);
  const [ activeModule, setActiveModule ] = useState<IMainNavLink>();

  const location = useLocation();
  const navigate = useNavigate();

  // On Page Refresh setup Active module from browser location
  useEffect(() => {
    const basePath = location.pathname.split('/').filter(Boolean)[0];

    // If user is on advance search then activate it else look for other modules
    if (Utilities.isEqual(basePath, advanceSearchMenu.to)) {
      setActiveModule(advanceSearchMenu);
      return;
    }

    const activeModule = props.links.find(x =>
      Array.isArray(x.childLinks) ? x.childLinks.some(y => Utilities.isEqual(y.to, `/${basePath}`)) : false
    );
    setActiveModule(activeModule);
  }, [ location.pathname ]);

  const environmentName = (): string => {
    switch (props.hostEnvironment?.toLowerCase()) {
      case 'dev':
        return 'DEV';
      case 'tst':
        return 'TEST';
      case 'stg':
        return 'STAGE';
      default:
        return '';
    }
  };

  // Render Modules Links
  const renderModules = () => {
    if (!props.links.length) {
      return null;
    }

    return props.links
      .filter(l => l.isVisible)
      .map((link: IMainNavLink, i: number) => {
        return (
          <div style={{ height: 'fit-content' }} onClick={e => setActiveModule(link)} key={i}>
            {link.isMenuButton ? (
              <MainMenuButton {...link} hasActiveClass={activeModule?.to === link.to} classes={props.classes} key={i} />
            ) : (
              <MainNavLink {...link} exact={props.exact} classes={props.classes} key={i} />
            )}
          </div>
        );
      });
  };

  // Render Child Apps For current activeModule Module
  const renderApps = () => {
    if (!activeModule || !Array.isArray(activeModule?.childLinks)) {
      return null;
    }

    return activeModule.childLinks
      .filter(l => l.isVisible)
      .map((link: IMainNavLink, i: number) => (
        <MainNavLink {...link} exact={props.exact} classes={props.classes} key={i} />
      ));
  };

  return (
    <div className={props.classes.headerWrapper} onMouseLeave={() => setIsHeaderFocused(false)}>
      <header className={props.classes.header}>
        <div className={props.classes.headerLeft}>
          <img
            className="main-nav-logo"
            src={Logo}
            alt="Universal Weather and Aviation, Inc."
            onDoubleClick={event => props.logoDoubleClick(event)}
          />
          <div className={props.classes.appEnvName}>{environmentName()}</div>
        </div>

        <div className={props.classes.headerCenter}>
          <div className={props.classes.headerNavlinks} onMouseEnter={() => setIsHeaderFocused(true)}>
            {renderModules()}
          </div>
        </div>

        <div className={props.classes.headerRight}>
          <div className={props.classes.menuButton}>
            <a target="_blank" href={props.uvGoLink}>
              <div className={`${props.classes.menuButton}__icon`}>
                <UvGoIcon size="x-large" />
              </div>
              <div className={`${props.classes.menuButton}__text`}>UVGo</div>
            </a>
          </div>
          <ViewPermission hasPermission={props.showAdvanceSearch}>
            <MainMenuButton
              {...advanceSearchMenu}
              hasActiveClass={activeModule?.to === advanceSearchMenu.to}
              classes={props.classes}
              buttonClicked={e => {
                navigate(advanceSearchMenu.to);
                setActiveModule(advanceSearchMenu);
              }}
            />
          </ViewPermission>
          {props.rightSide}
        </div>
      </header>

      {(isHeaderFocused || UIStore.isHeaderExpanded) && (
        <div className={UIStore.isHeaderExpanded ? props.classes.subHeaderExpanded : props.classes.subHeader}>
          <div className={props.classes.subHeaderLeft}></div>

          <div className={props.classes.subHeaderCenter}>{renderApps()}</div>

          <div className={props.classes.subHeaderRight}>
            <div className={props.classes.pinButtonWrapper}>
              <IconButton color="primary" onClick={() => UIStore.setIsHeaderExpanded()} aria-label="pin sub navigation">
                {UIStore.isHeaderExpanded ? <PinVerticalIcon size="x-large" /> : <PinIcon size="x-large" />}
              </IconButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MultiHeader.defaultProps = {
  logoDoubleClick: () => null,
  links: [],
  exact: false,
};

export default withStyles(styles, { name: 'layout-shared' })(MultiHeader);
export { MultiHeader as PureMultiHeader };

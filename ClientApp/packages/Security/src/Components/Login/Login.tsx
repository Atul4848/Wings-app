import React, { Component, ReactNode } from 'react';
import { AlertList } from '@uvgo-shared/alert';
import { Typography, withStyles } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { FirefoxIcon, EdgeIcon, ChromeIcon } from '@uvgo-shared/icons';
import { styles } from './Login.styles';
import { IClasses } from '@wings-shared/core';
import logoImg from './Logo';

const browserIcons: IOption[] = [
  { label: 'Edge', value: 'Version 40+' },
  { label: 'Chrome', value: 'Version 61+' },
  { label: 'Firefox', value: 'Version 56+' },
];

interface IOption {
  label: string;
  value: string | number;
}

interface Props {
  classes?: IClasses;
  onLoginClick?: () => void;
}

class Login extends Component<Props> {
  private browserIcon(label: string): ReactNode {
    switch (label) {
      case 'Edge':
        return <EdgeIcon />;
      case 'Firefox':
        return <FirefoxIcon />;
      default:
        return <ChromeIcon />;
    }
  }

  private iconsWrapper(icon: IOption): ReactNode {
    const { classes } = this.props;
    return (
      <div key={icon.label} className={classes.browser}>
        <div className={classes.icon}>{this.browserIcon(icon.label)}</div>
        <Typography color="textPrimary" variant="subtitle2">
          {icon.label}
        </Typography>
        <Typography color="textSecondary" variant="caption">
          {icon.value}
        </Typography>
      </div>
    );
  }

  render() {
    const { classes, onLoginClick } = this.props;

    return (
      <div className={classes.loginPage}>
        <div className={classes.main}>
          <div className={classes.login}>
            <div className={classes.wrapper}>
              <div className={classes.header}>
                <img
                  src={logoImg}
                  className={classes.logo}
                  alt="Universal Weather and Aviation, Inc."
                />
              </div>
              <div className={classes.content}>
                <div className={classes.column}>
                  <Typography color="primary" variant="h4">
                    WINGS
                  </Typography>
                  <div className={classes.subtitle}>
                    Manage the data behind successful missions.
                  </div>
                  <PrimaryButton
                    variant="contained"
                    size="large"
                    type="submit"
                    onClick={() => onLoginClick()}
                  >
                    Login
                  </PrimaryButton>
                </div>
              </div>
            </div>
            <div className={classes.overlay} />
          </div>

          <div className={classes.browsers}>
            <Typography>Supported Browsers</Typography>
            <br />
            <div className={classes.browserIcon}>
              {browserIcons.map((x) => this.iconsWrapper(x))}
            </div>
          </div>
        </div>
        <AlertList />
      </div>
    );
  }
}

export default withStyles(styles)(Login);

import React, { FC, ReactElement } from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Typography, withStyles } from '@material-ui/core';
import { styles } from './Collapsable.style';
import { Variant } from '@material-ui/core/styles/createTypography';
import { IClasses } from '@wings-shared/core';
import classNames from 'classnames';

interface Props {
  children: ReactElement;
  title: string;
  classes: IClasses;
  titleVariant?: Variant;
  subTitleVariant?: Variant;
  titleChildren?: ReactElement;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  subTitle?: string;
  onChange?: (_event: React.ChangeEvent<{}>, expanded: boolean) => void;
}

const Collapsable: FC<Props> = ({
  children,
  title,
  titleChildren,
  classes,
  onChange,
  isExpanded,
  titleVariant,
  subTitleVariant,
  subTitle,
  defaultExpanded = true,
}) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    expanded={isExpanded}
    className={classNames({
      [classes.root]: true,
    })}
    onChange={onChange}
  >
    <div className={classes.titleRoot}>
      <AccordionSummary
        className={classNames({
          [classes.titleRoot]: true,
          [classes.mainTitle]: true,
        })}
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography
          variant={titleVariant}
          className={classNames({ [classes.title]: true })}
        >
          {title}
        </Typography>
        {titleChildren}
      </AccordionSummary>
      {subTitle && (
        <Typography variant={subTitleVariant} className={classes.subTitle}>
          {subTitle}
        </Typography>
      )}
    </div>
    <AccordionDetails className={classNames({ [classes.contentRoot]: true })}>
      {children}
    </AccordionDetails>
  </Accordion>
);

Collapsable.defaultProps = {
  titleVariant: 'h5',
};

export default withStyles(styles)(Collapsable);

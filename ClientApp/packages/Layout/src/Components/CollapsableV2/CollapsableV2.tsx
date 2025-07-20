import React, { FC, ReactElement } from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Typography, withStyles } from '@material-ui/core';
import { styles } from './CollapsableV2.style';
import { Variant } from '@material-ui/core/styles/createTypography';
import { IClasses } from '@wings-shared/core';

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

const CollapsableV2: FC<Props> = ({
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
  <Accordion defaultExpanded={defaultExpanded} expanded={isExpanded} className={classes.root} onChange={onChange}>
    <div className={classes.titleRoot}>
      <AccordionSummary className={classes.titleRoot} expandIcon={<ExpandMoreIcon className={classes.collapseExpandIcon} />}>
        <Typography variant={titleVariant}>{title}</Typography>
        {titleChildren}
      </AccordionSummary>
      {subTitle && (
        <Typography variant={subTitleVariant} className={classes.subTitle}>
          {subTitle}
        </Typography>
      )}
    </div>
    <AccordionDetails className={classes.contentRoot}>{children}</AccordionDetails>
  </Accordion>
);

CollapsableV2.defaultProps = {
  titleVariant: 'h5',
};

export default withStyles(styles)(CollapsableV2);

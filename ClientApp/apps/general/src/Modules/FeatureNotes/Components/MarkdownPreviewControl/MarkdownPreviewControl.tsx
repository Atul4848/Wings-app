import React, { FC } from 'react';
import { MarkdownPreview } from 'react-marked-markdown';
import { styles } from './MarkdownPreviewControl.style';
import { withStyles } from '@material-ui/core';
import { IClasses } from '@wings-shared/core';

type Props = {
  classes: IClasses;
  value?: any;
};

const MarkdownPreviewControl: FC<Props> = ({ value, classes }) => {
  return (
    <div id="markdownPreview" className={classes.reactMarkdown}>
      <MarkdownPreview
        value={value}
        markedOptions={{
          pedantic: false,
          gfm: true,
          breaks: true,
          sanitize: false,
          smartLists: true,
          smartypants: true,
          xhtml: false,
        }}
      />
    </div>
  );
};
export default withStyles(styles)(MarkdownPreviewControl);

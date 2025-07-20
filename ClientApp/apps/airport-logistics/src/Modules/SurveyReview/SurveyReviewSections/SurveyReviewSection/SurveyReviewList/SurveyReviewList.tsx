import React, { FC } from 'react';
import { SurveyReviewListItem } from '../SurveyReviewListItem/SurveyReviewListItem';

type Props = {
  list: string[];
  classes: string;
};

export const SurveyReviewList: FC<Props> = ({ list, classes }) => {
  return (
    <div className={classes}>
      {list.map(item => (
        <SurveyReviewListItem key={item} item={item} />
      ))}
    </div>
  );
};

export default SurveyReviewList;

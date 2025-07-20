import { FC, ReactElement } from 'react';

interface Props {
  children: ReactElement;
  hasPermission: boolean;
}

const ViewPermission: FC<Props> = ({ children, hasPermission }) => (hasPermission ? children : null);
export default ViewPermission;

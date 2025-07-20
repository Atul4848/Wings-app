import React, { ReactElement } from 'react';
import { ResizeDivider } from './ResizeDivider/ResizeDivider';

type Props = {
  className?: string;
  children: ReactElement;
  maxHeight: number;
  minHeight: number;
  heighUnit?: 'px' | '%';
};

const Resizable = ({
  className,
  children,
  maxHeight,
  minHeight,
  heighUnit = 'px',
}: Props) => {
  const ref = React.useRef<HTMLDivElement>();
  const [isDragStarted, setIsDragStarted] = React.useState(false);
  const [showDivider, setShowDivider] = React.useState(false);
  const [initialPos, setInitialPos] = React.useState(null);
  const [initialHeight, setInitialSize] = React.useState(null);

  const initial = e => {
    if (ref.current) {
      setInitialPos(e.clientY);
      setInitialSize(ref.current.offsetHeight);
      setIsDragStarted(true);
    }
  };

  const resize = e => {
    const height =
      parseInt(initialHeight) +
      parseInt(((e.clientY as any) - initialPos) as any);
    if (height >= minHeight && height <= maxHeight) {
      ref.current.style.height = `${height}${heighUnit}`;
      ref.current.style.overflow = height <= minHeight + 5 ? 'hidden' : 'auto';
    }
  };

  return (
    <div
      style={{ maxHeight, minHeight, paddingBottom: '10px' }}
      onMouseEnter={() => setShowDivider(true)}
      onMouseLeave={() => {
        if (!isDragStarted) {
          setShowDivider(false);
        }
      }}
    >
      <div className={className} ref={ref}>
        {React.cloneElement(children as any, {})}
      </div>
      <ResizeDivider
        draggable={true}
        onDragStart={initial}
        onDrag={resize}
        showDragControl={showDivider}
        onDragEnd={() => {
          setIsDragStarted(false);
          setShowDivider(false);
        }}
      />
    </div>
  );
};

export default Resizable;

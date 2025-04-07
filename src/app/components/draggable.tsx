import React, { type MouseEvent, useRef, type ReactElement } from 'react';

interface IDraggable {
  className: string | undefined;
  children: ReactElement;
}

const Draggable = ({ className, children }: IDraggable) => {
  const slider = useRef<HTMLDivElement>(null);

  let mouseDown = false;
  let startX: number;
  let scrollLeft: number;

  const startDragging = (e: MouseEvent<HTMLDivElement>) => {
    mouseDown = true;
    startX = e.pageX - (slider.current?.offsetLeft ?? 0);
    scrollLeft = slider.current?.scrollLeft ?? 0;
  };
  const stopDragging = () => {
    mouseDown = false;
  };

  function mouseMoveEvent(e: MouseEvent<HTMLDivElement>) {
    if (!mouseDown || !slider.current) {
      return;
    }
    const x = e.pageX - slider.current.offsetLeft;
    const scroll = x - startX;
    slider.current.scrollLeft = scrollLeft - scroll;
  }

  return (
    <div
      ref={slider}
      onMouseDown={startDragging}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onMouseMove={mouseMoveEvent}
      className={className}
    >
      {children}
    </div>
  );
};

export default Draggable;

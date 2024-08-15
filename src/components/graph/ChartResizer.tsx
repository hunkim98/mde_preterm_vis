import React, { useEffect, useState } from "react";

type ChartResizerProps<T> = T & {
  children: React.ReactElement<{
    width: number;
  }>;
};

const ChartResizer = <T,>({ children }: ChartResizerProps<T>) => {
  // add resize observer here
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setContainerWidth(width);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  // Clone children and pass the container width as a prop
  const enhancedChildren = React.Children.map(children, (child) =>
    React.isValidElement<{
      width: number;
    }>(child)
      ? // override the width prop with the container width
        React.cloneElement(child, { width: containerWidth })
      : child
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
      }}
    >
      {enhancedChildren}
    </div>
  );
};

export default ChartResizer;

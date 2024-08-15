import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { ILabelItem } from "../../data/labels";
import { LabelColorer } from "../../constants/color";

interface TimeGraphInterface {
  data: Array<{
    date: string;
    [key: string]: number | string;
  }>;
  columns: Array<string>;
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  maxYValue: number;
}

const TIME_GRAPH_ID = "timeGraph";

const TimeGraph: React.FC<TimeGraphInterface> = ({
  width,
  height,
  margin,
  columns,
  data,
  maxYValue,
}) => {
  const svgContainerRef =
    useRef<d3.Selection<SVGSVGElement, unknown, HTMLElement, any>>();
  const svgGRef =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>();
  const clipPathRectRef =
    useRef<d3.Selection<SVGRectElement, unknown, HTMLElement, any>>();
  const xAxisGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>();
  const yAxisGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>();

  const areaGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>();

  const [tooltip, setTooltip] = useState({
    opacity: 0,
    content: "",
    x: 0,
    y: 0,
  });
  const xRef = useRef<d3.ScaleBand<string>>();
  const yRef = useRef<d3.ScaleLinear<number, number>>();

  const renderGraph = useCallback(() => {
    const fixedMargin = { ...margin };

    const svgWidth = width - fixedMargin.left - fixedMargin.right;
    const svgHeight = height - fixedMargin.top - fixedMargin.bottom;

    if (svgWidth <= 0 || svgHeight <= 0) return;

    if (svgContainerRef.current) {
      svgContainerRef.current.attr("width", width).attr("height", height);
    } else {
      svgContainerRef.current = d3
        .select(`#${TIME_GRAPH_ID}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    }

    const svgContainer = svgContainerRef.current;
    const svg = svgGRef.current
      ? svgGRef.current
      : (svgGRef.current = svgContainer
          .append("g")
          .attr(
            "transform",
            `translate(${fixedMargin.left},${fixedMargin.top})`
          ));

    if (clipPathRectRef.current) {
      clipPathRectRef.current.attr("width", svgWidth).attr("height", svgHeight); // update the clip size
    } else {
      clipPathRectRef.current = svg
        .append("clipPath")
        .attr("id", `clip-area-${TIME_GRAPH_ID}`)
        .append("rect")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    }

    const xAxisGroup = xAxisGroupRef.current
      ? xAxisGroupRef.current
      : (xAxisGroupRef.current = svg.append("g").attr("class", "x-axis"));

    const yAxisGroup = yAxisGroupRef.current
      ? yAxisGroupRef.current
      : (yAxisGroupRef.current = svg.append("g").attr("class", "y-axis"));

    // const xScale = d3
    //   .scaleBand()
    //   .domain(data.map((d) => d.date))
    //   .range([0, svgWidth])
    //   .padding(0.3);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, svgWidth]);
    xRef.current = xScale;
    // xRef.current = xScale;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxYValue * 1.2])
      .range([svgHeight, 0]);
    yRef.current = yScale;

    console.log(data);
    const stackedData = d3.stack().keys(columns)(data as any);

    const areaGroup = areaGroupRef.current
      ? areaGroupRef.current
      : (areaGroupRef.current = svg
          .append("g")
          .attr("clip-path", `url(#clip-area-${TIME_GRAPH_ID})`));

    const area = d3
      .area()
      .curve(d3.curveBasis)
      .x((d: any) => xScale(d.data.date as string)! + xScale.bandwidth() / 2)
      .y0(function (d) {
        return yScale(d[0]);
      })
      .y1(function (d) {
        return yScale(d[1]);
      });

    xAxisGroup
      .attr("transform", `translate(0,${svgHeight})`)
      .style("opacity", 0.5)
      .call(d3.axisBottom(xScale));

    yAxisGroup
      .attr("transform", `translate(0,0)`)

      .style("opacity", 0.5)
      .call(d3.axisLeft(yScale));

    svg.selectAll("path").remove();

    areaGroup
      .selectAll("mylayers")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("class", function (d) {
        return "myArea " + d.key;
      })
      .on("mouseover", function (d, i) {
        // @ts-ignore
        d3.select(this).style("opacity", 0.7);
      })
      .on("mousemove", function (d, i) {
        // @ts-ignore
        setTooltip({
          opacity: 1,
          content: `${d.key}: `,
          //   x: mouse[0],
          //   y: mouse[1],
        });
      })
      .on("mouseout", function (d, i) {
        // @ts-ignore
        d3.select(this).style("opacity", 1);
        setTooltip({
          ...tooltip,
          opacity: 0,
        });
      })
      .style("fill", function (d) {
        // @ts-ignore
        // @ts-ignore
        return LabelColorer(d.key);
      })
      .attr("d", area as any);
  }, [margin, height, width, data, maxYValue, columns]);

  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  return (
    <div
      id={TIME_GRAPH_ID}
      style={{
        height: height,
      }}
    >
      <pre
        className="tooltip"
        style={{
          zIndex: 100,
          opacity: tooltip.opacity,
          position: "absolute",
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
          transform: "translate(-50%,0%)",
          backgroundColor: "white",
          border: "1px solid rgba(0,0,0,0.1)",
          padding: "8px",
          pointerEvents: "none", // Makes the tooltip not block mouse events
          transition: "opacity 0.3s ease, left 0.2s ease, top 0.2s ease", // Smooth transitions
        }}
      >
        {tooltip.content}
      </pre>
    </div>
  );
};

export default TimeGraph;

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
import { useRepositoryContext } from "../../context/repositoryContext";

interface LabelBarGraphInterface {
  data: Array<[string, number]>;
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const BAR_GRAPH_ID = "barGraph";

const LabelBarGraph: React.FC<LabelBarGraphInterface> = ({
  data,
  width,
  height,
  margin,
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
  const barGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>();
  const behindGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>();
  const staticBehindGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>();
  const behindGroupRectRef =
    useRef<d3.Selection<SVGRectElement, unknown, HTMLElement, any>>();
  const staticBehindGroupRectRef =
    useRef<d3.Selection<SVGRectElement, unknown, HTMLElement, any>>();

  const isRendered = useRef(false);

  const { setSelectedLabel, selectedLabel } = useRepositoryContext();

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

    const maxYValue = d3.max(data, (d) => d[1]) as number;

    const svgWidth = width - fixedMargin.left - fixedMargin.right;
    const svgHeight = height - fixedMargin.top - fixedMargin.bottom;

    if (svgWidth <= 0 || svgHeight <= 0) return;

    if (svgContainerRef.current) {
      svgContainerRef.current.attr("width", width).attr("height", height);
    } else {
      svgContainerRef.current = d3
        .select(`#${BAR_GRAPH_ID}`)
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
        .attr("id", `clip-area-${BAR_GRAPH_ID}`)
        .append("rect")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    }

    const barGroup = barGroupRef.current
      ? barGroupRef.current
      : (barGroupRef.current = svg
          .append("g")
          .attr("clip-path", `url(#clip-area-${BAR_GRAPH_ID})`))
          .append("g")
          .attr("class", "bar-group");

    const xAxisGroup = xAxisGroupRef.current
      ? xAxisGroupRef.current
      : (xAxisGroupRef.current = svg.append("g").attr("class", "x-axis"));

    const yAxisGroup = yAxisGroupRef.current
      ? yAxisGroupRef.current
      : (yAxisGroupRef.current = svg.append("g").attr("class", "y-axis"));

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d[0]))
      .range([0, svgWidth])
      .padding(0.3);
    xRef.current = xScale;

    // let yScale: d3.ScaleLinear<number, number>;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxYValue * 1.2])
      .range([svgHeight, 0]);
    yRef.current = yScale;

    const behindGroup = behindGroupRef.current
      ? behindGroupRef.current
      : (behindGroupRef.current = svg
          .append("g")
          .attr("clip-path", `url(#clip-area-${BAR_GRAPH_ID})`)
          .append("g")
          .attr("class", "behindGroup"));

    const staticBehindGroup = staticBehindGroupRef.current
      ? staticBehindGroupRef.current
      : (staticBehindGroupRef.current = svg
          .append("g")
          .attr("clip-path", `url(#clip-area-${BAR_GRAPH_ID})`)
          .append("g")
          .attr("class", "static-behindGroup"));

    xAxisGroup
      .attr("transform", `translate(0,${svgHeight})`)
      .style("opacity", 0.5)
      .call(d3.axisBottom(xScale));

    yAxisGroup
      .attr("transform", `translate(0,0)`)
      .style("opacity", 0.5)
      .call(d3.axisLeft(yScale));

    // barGroup.selectAll("rect").remove();
    const bars = barGroup.selectAll(`rect.base`).data(data);

    bars
      .enter()
      .append("rect")
      .attr("class", `base`)
      .merge(bars as any)
      .attr("x", (d) => xScale(d[0]) as number)
      .attr("y", (d) => svgHeight)
      .attr("width", xScale.bandwidth())
      .attr("fill", (d, i) => {
        return LabelColorer(d[0]);
      })
      // start from bottom
      .transition()
      .duration(() => {
        if (!isRendered.current) {
          return 0;
        } else {
          return 500;
        }
      })
      .attr("y", (d) => {
        return yScale(d[1]) as number;
      })
      .attr("height", (d) => {
        return (svgHeight - yScale(d[1])) as number;
      });

    const xTicks = xAxisGroup.selectAll(".tick text");
    // add new line to the text that has a space
    xTicks.each(function (d, i) {
      const text = d3.select(this);
      const words = text.text().split(" ");
      text.text("");
      words.forEach((word, i) => {
        text
          .append("tspan")
          .attr("x", 0)
          .attr("y", 15)
          .attr("dy", `${i * 1.2}em`)
          .text(word);
      });
    });

    const behindGroupRectWidth =
      xScale.bandwidth() + xScale.paddingInner() * xScale.step();

    const behindGroupRect = (behindGroupRectRef.current = behindGroup
      .append("rect")
      .attr("fill", "none")
      .attr("width", behindGroupRectWidth)
      .attr("height", svgHeight))
      .attr("fill", "rgba(0,0,0,0.1)")
      .style("opacity", 0)
      .style("transition", "opacity 0.3s ease");

    (staticBehindGroupRectRef.current = staticBehindGroup
      .append("rect")
      .attr("fill", "none")
      .attr("width", behindGroupRectWidth)
      .attr("height", svgHeight))
      .attr("fill", "rgba(0,0,0,0.1)")
      .style("opacity", 0)
      .style("transition", "opacity 0.3s ease");

    staticBehindGroup.selectAll("rect").attr("opacity", 0);

    behindGroup.selectAll("rect").style("opacity", 0);

    svgContainer
      .on("mouseover", function (event) {
        if (selectedLabel) {
          return;
        }
        const coords = d3.pointer(event);
        const x = coords[0] - fixedMargin.left;
        const y = coords[1];
        let absoluteX = x;
        let absoluteY = y;
        const eachBand = xScale.step();
        const index = Math.floor(x / eachBand);
        if (index >= 0 && index < data.length) {
          setTooltip((prev) => ({
            ...prev,
            content: `${data[index][0]}: ${data[index][1]}`,
            opacity: 0.5,
          }));
          const x = xScale(data[index][0]) as number;
          const y = yScale(data[index][1]) as number;
          absoluteX = x + fixedMargin.left;
          absoluteY = y + fixedMargin.top;
          behindGroupRect
            .attr("x", x - (xScale.paddingInner() * xScale.step()) / 2)
            .attr("y", 0);
          behindGroupRect.style("opacity", 1);
          setTooltip((prev) => ({
            ...prev,
            x: absoluteX,
            y: absoluteY,
          }));
        }
      })
      .on("mousedown", function (event) {
        const coords = d3.pointer(event);
        const x = coords[0] - fixedMargin.left;
        const y = coords[1];
        let absoluteX = x;
        let absoluteY = y;
        const eachBand = xScale.step();
        const index = Math.floor(x / eachBand);
        if (index >= 0 && index < data.length) {
          setSelectedLabel(data[index][0]);
        } else {
          setSelectedLabel(null);
        }
      })
      .on("mouseleave", function () {
        behindGroupRect.style("opacity", 0);
        setTooltip((prev) => ({
          ...prev,
          opacity: 0,
        }));
      });
  }, [data, width, height, margin, selectedLabel]);

  useEffect(() => {
    const staticBehindRect = staticBehindGroupRectRef.current;
    staticBehindGroupRef.current?.selectAll("rect").style("opacity", 0);
    if (selectedLabel) {
      // highlight the selected label
      const xScale = xRef.current;
      const yScale = yRef.current;
      if (!staticBehindRect || !xScale || !yScale) return;
      const x = xScale(selectedLabel);
      if (!x) return;
      console.log("x ", x);
      staticBehindRect
        .attr("x", x - (xScale.paddingInner() * xScale.step()) / 2)
        .attr("y", 0);
      staticBehindRect.style("opacity", 1);
    } else {
      if (!staticBehindRect) return;
      staticBehindRect.style("opacity", 0);
    }
    console.log("selectedlabel", selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  return (
    <div
      id={BAR_GRAPH_ID}
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

export default LabelBarGraph;

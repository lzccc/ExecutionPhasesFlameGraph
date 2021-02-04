import React from "react";
import * as d3 from "d3";
import objectJson3 from "../../resources/objectJson3.json";
import objectJson from "../../resources/objectJson.json";
import flameGraphUtil from "../../utils/flameGraphUtil";
import commonUtil from "../../utils/commonUtil";
import "./flameGraph.css";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";

interface myStates {
  currProjects: any[];
  projectId: number;
  threadId: number;
  layerMap: any[];
}

class FlameGraph extends React.Component<any, myStates> {
  node: React.RefObject<SVGSVGElement>;
  groupMap: Map<number, any[]>;
  constructor(props) {
    super(props);
    this.createFlameGraph = this.createFlameGraph.bind(this);
    this.recersiveTree = this.recersiveTree.bind(this);
    this.node = React.createRef();
    this.groupMap = new Map<number, any[]>();
    this.state = {
      currProjects: [objectJson, objectJson3],
      projectId: 0,
      threadId: 0,
      layerMap: flameGraphUtil.rootNodeToLayerMapList(objectJson),
    };
  }
  componentDidMount() {
    window.addEventListener("resize", this.resizeTree);
    this.createFlameGraph();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.threadId !== prevState.threadId ||
      this.state.projectId !== prevState.projectId
    ) {
      console.log("zic");
      this.createFlameGraph();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeTree);
  }

  setTheadId(id: number) {
    if (this.state.threadId !== id) {
      this.setState({ threadId: id });
      this.removeSVGElements();
    }
  }

  setProjectId(id: number) {
    if (this.state.projectId !== id) {
      console.log("test");
      this.removeSVGElements();
      this.setState({
        projectId: id,
        threadId: 0,
        layerMap: flameGraphUtil.rootNodeToLayerMapList(
          this.state.currProjects[id]
        ),
      });
    }
  }

  resizeTree = commonUtil.debounce(this.forceUpdate.bind(this), 1000);

  getGraphInfo() {
    let layerMap = this.state.layerMap;
    const info = {
      svgHeight: 0,
      svgWidth: 0,
      renderedLayer: [] as any,
      smallestDepth: 0,
    };
    const node = this.node.current;
    const svg = d3.select(node);
    let svgHeight = svg.style("height");
    let svgWidth = svg.style("width");
    svgHeight = svgHeight.substring(0, svgHeight.length - 2);
    svgWidth = svgWidth.substring(0, svgWidth.length - 2);

    let renderedLayer = layerMap[this.state.threadId];
    let smallestDepth = flameGraphUtil.getSmallestDepth(renderedLayer);

    info.svgHeight = +svgHeight;
    info.svgWidth = +svgWidth;
    info.renderedLayer = renderedLayer;
    info.smallestDepth = smallestDepth;
    return info;
  }

  forceUpdate() {
    const graphInfo = this.getGraphInfo();

    this.recersiveTreeChange(
      50,
      graphInfo.svgWidth - 50,
      (graphInfo.renderedLayer.get(graphInfo.smallestDepth)[0] as any)
        .startTime,
      (graphInfo.renderedLayer.get(graphInfo.smallestDepth)[0] as any).endTime
    );
  }

  removeSVGElements() {
    const node = this.node.current;
    if (node.firstChild) node.removeChild(node.firstChild);
  }

  createFlameGraph() {
    let graphInfo = this.getGraphInfo();

    const node = this.node.current;
    const svg = d3.select(node);
    console.log("test3");
    svg.call(
      d3.zoom().on("zoom", (event: any) => {
        g.attr("transform", event.transform);
      })
    );
    d3.select("#wrapper").on("scroll", () => {
      console.log("test");
    });

    const g = svg.append("g");
    const rootRect = graphInfo.renderedLayer.get(graphInfo.smallestDepth)[0];
    console.log(graphInfo.renderedLayer.get(graphInfo.smallestDepth));
    this.recersiveTree(
      g,
      graphInfo.smallestDepth,
      graphInfo.renderedLayer.get(graphInfo.smallestDepth),
      50,
      graphInfo.svgWidth - 50,
      (rootRect as any).startTime,
      (rootRect as any).endTime
    );
    console.log("test6");
  }

  light(selections: any[]) {
    selections.forEach((v: any) => {
      v.transition().duration(200).attr("fill", "red").attr("opacity", ".85");
    });
  }

  lightAllSimilar(id: number) {
    if (id === 0) return;

    if (this.groupMap.get(id)) {
      this.light(this.groupMap.get(id));
      return;
    }
    this.groupMap.set(id, []);
    let selection = d3.selectAll("rect").filter(function (k: any) {
      return k.groupId === id;
    });
    this.groupMap.get(id).push(selection);
    selection.each((e: any) => {
      let rectSelection = d3.selectAll("rect").filter(function (k: any) {
        return (
          k.depth > e.depth &&
          k.startTime > e.startTime &&
          k.endTime < e.endTime
        );
      });
      this.groupMap.get(id).push(rectSelection);
    });
    this.light(this.groupMap.get(id));
  }

  extinguishAllSimilar(id: number) {
    if (!this.groupMap.get(id)) return;
    this.groupMap.get(id).forEach((v: any) => {
      v.transition()
        .duration(200)
        .attr("fill", "steelblue")
        .attr("opacity", "1");
    });
  }

  recersiveTree(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    layer: number,
    layerArr: any[],
    leftMost: number,
    rightMost: number,
    startTime: number,
    endTime: number
  ) {
    const xScalePosition = d3
      .scaleLinear()
      .domain([startTime, endTime])
      .range([leftMost, rightMost]);

    const target = this;
    g.selectAll("rect")
      .data(layerArr)
      .enter()
      .append("rect")
      .attr("x", (e: any) => {
        let tmpStart = xScalePosition(e.startTime);
        if (e.children && e.children.length != 0) {
          this.recersiveTree(
            g.append("g"),
            layer + 1,
            e.children,
            leftMost,
            rightMost,
            startTime,
            endTime
          );
        }
        return tmpStart;
      })
      .attr("y", 20 * (34 - layer))
      .attr("width", (e: any) => {
        let tmpWidth = xScalePosition(e.endTime) - xScalePosition(e.startTime);
        if (tmpWidth < 1) tmpWidth = 0;
        return tmpWidth;
      })
      .attr("height", 19)
      .attr("fill", "steelblue")
      // .attr("opacity", () => {
      //   return 0.5 + Math.random() * 0.5;
      // })
      .on("mouseover", function (d, i: any) {
        d3.select(this)
          .transition()
          .duration(50)
          .attr("opacity", ".85")
          .attr("fill", "steelblue");
        d3.select(".tooltip")
          .transition()
          .duration(50)
          .style("opacity", 1)
          .text(`${i.className}: ${i.name}: ${i.groupId}`)
          .style("left", d.pageX + 10 + "px")
          .style("top", d.pageY - 15 + "px");
        target.lightAllSimilar(i.groupId);
      })
      .on("mouseout", function (d, i: any) {
        d3.select(this)
          .transition()
          .duration(50)
          .attr("opacity", "1")
          .attr("fill", "steelblue");
        d3.select(".tooltip").transition().duration(50).style("opacity", 0);
        target.extinguishAllSimilar(i.groupId);
      })
      .on("click", function (d, i: any) {
        target.recersiveTreeChange(leftMost, rightMost, i.startTime, i.endTime);
      });
  }

  recersiveTreeChange(
    leftMost: number,
    rightMost: number,
    startTime: number,
    endTime: number
  ) {
    const xScalePosition = d3
      .scaleLinear()
      .domain([startTime, endTime])
      .range([leftMost, rightMost]);

    d3.select("svg")
      .selectAll("rect")
      .transition()
      .duration(200)
      .attr("x", (e: any) => {
        let tmpStart = xScalePosition(e.startTime);
        return tmpStart;
      })
      .attr("width", (e: any) => {
        let tmpWidth = xScalePosition(e.endTime) - xScalePosition(e.startTime);
        return tmpWidth;
      });
  }

  resetTree() {
    // this.removeSVGElements();
    // this.createFlameGraph();
    let graphInfo = this.getGraphInfo();
    const rootRect = graphInfo.renderedLayer.get(graphInfo.smallestDepth)[0];
    d3.select("svg")
      .selectAll("g")
      .transition()
      .duration(200)
      .attr("transform", "translate(0,0)");
    this.recersiveTreeChange(
      50,
      graphInfo.svgWidth - 50,
      rootRect.startTime,
      rootRect.endTime
    );
  }

  render() {
    return (
      <div>
        <div className="control-box">
          <Dropdown className="dropdown">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Choose Project
            </Dropdown.Toggle>
            {createProjectsDropdown(
              this.state.currProjects.length,
              this.setProjectId.bind(this)
            )}
          </Dropdown>
          <Dropdown className="dropdown">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Choose Thread
            </Dropdown.Toggle>
            {createDropdownItems(
              this.state.layerMap.length,
              this.setTheadId.bind(this)
            )}
          </Dropdown>
          <Button variant="primary" onClick={this.resetTree.bind(this)}>
            Reset
          </Button>{" "}
        </div>
        <div id="wrapper">
          <svg ref={this.node} height={700}></svg>
        </div>
        <div className="tooltip">test</div>
      </div>
    );
  }
}

function createDropdownItems(threadNum: number, fun: Function) {
  const dropdownItems = [];
  for (let i = 0; i < threadNum; i++) {
    dropdownItems.push(
      <Dropdown.Item onClick={fun.bind(this, i)} key={i}>
        Thread {i}
      </Dropdown.Item>
    );
  }
  return <Dropdown.Menu>{dropdownItems}</Dropdown.Menu>;
}

function createProjectsDropdown(proNum: number, fun: Function) {
  const dropdownItems = [];
  for (let i = 0; i < proNum; i++) {
    dropdownItems.push(
      <Dropdown.Item onClick={fun.bind(this, i)} key={i}>
        Project {i}
      </Dropdown.Item>
    );
  }
  return <Dropdown.Menu>{dropdownItems}</Dropdown.Menu>;
}

export default FlameGraph;

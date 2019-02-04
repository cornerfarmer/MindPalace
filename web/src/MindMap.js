import React from 'react';
import * as d3 from "d3";
import {Command} from "./App";
import File from "./File";
import MindMapNode from "./MindMapNode";

const layer_offset = 200;
const space_between = 50;
const node_width = 150;

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            enlarged_id: null
        };
        this.svg = React.createRef();
        this.nodes = React.createRef();
        this.enlarge = this.enlarge.bind(this);
    }

    componentDidMount() {
        window.addEventListener("resize", this.rebuildNodes.bind(this));
    }

  componentWillUnmount() {
    window.removeEventListener("resize", this.rebuildNodes.bind(this));
  }


    addChildNodes(mapNodes, mapConnections, parentMapNode, except_node=null) {

        var child_x = parentMapNode.x - this.calc_x_offset(parentMapNode.node.children.length - 1) / 2;
        for (const child_element of parentMapNode.node.children) {
            const child = child_element.node;
            if (except_node !== child) {
                let childMapNode = {node: child, x: child_x, y: parentMapNode.y + layer_offset};
                mapNodes.push(childMapNode);
                mapConnections.push({parent: parentMapNode, child: childMapNode});
            }
            child_x += space_between + node_width;
        }
    }

    addParentNodes(mapNodes, mapConnections, childMapNode) {
        var parent = childMapNode.node.main_parent;
        if (parent !== null) {
            var x_offset = this.calc_x_offset(parent.children.findIndex(e => e.node === childMapNode.node)) - this.calc_x_offset(parent.children.length - 1) / 2;

            var parentMapNode = {node: parent, x: childMapNode.x - x_offset, y: childMapNode.y - layer_offset};
            mapNodes.push(parentMapNode);
            mapConnections.push({parent: parentMapNode, child: childMapNode});

            this.addParentNodes(mapNodes, mapConnections, parentMapNode);
            this.addChildNodes(mapNodes, mapConnections, parentMapNode, childMapNode.node);
        }
    }

    calc_x_offset(node_number) {
        return node_number * (space_between + node_width)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.focusedNode in this.props.nodes) {
            this.rebuildNodes();
        }
    }

    enlarge(node_id) {
        this.setState({
            enlarged_id: node_id
        });
    }

    renderNode(node) {
        return <MindMapNode node={node} enlarged_id={this.state.enlarged_id} enlarge={this.enlarge} />
    }

    rebuildNodes() {
        var mapNodes = [];
        var mapConnections = [];
        var nodesContainer = d3.select(this.nodes.current);
        const focusedNode = this.props.nodes[this.props.focusedNode];

        mapNodes.push({node: focusedNode, x: nodesContainer.node().getBoundingClientRect().width / 2, y: nodesContainer.node().getBoundingClientRect().height / 2});
        this.addParentNodes(mapNodes, mapConnections, mapNodes[0]);
        this.addChildNodes(mapNodes, mapConnections, mapNodes[0]);

        var t = d3.transition();
        var nodeElements = nodesContainer
            .selectAll(".node")
            .data(mapNodes, d => d.node.id);

        let self = this;
        nodeElements.exit().remove();
        nodeElements.enter().append("div")
            .attr("class", d => (d.node.id === this.state.enlarged_id ? "node node-enlarged" : "node"))
            .on("click", function(d) {
                if (d3.event.target.nodeName === "DIV" || d3.event.target.nodeName === "SPAN")
                    self.props.focusNode(d.node.id);
            })
            .style("background", d => d.node.id === this.props.focusedNode ? "lightgrey" : "white")
            .style("left", d => d.x + "px")
            .style("top", d => d.y + "px")
            .append("div")
            .attr("id", d => "node-" + d.node.id);

        nodeElements
            .transition(t)
            .duration(500)
            .attr("class", d => (d.node.id === this.state.enlarged_id ? "node node-enlarged" : "node"))
            .style("background", d => d.node.id === this.props.focusedNode ? "lightgrey" : "white")
            .style("left", d => d.x + "px")
            .style("top", d => d.y + "px");

        for (const mapNode of mapNodes) {
            ReactDOM.render(this.renderNode(mapNode.node), document.getElementById('node-' + mapNode.node.id));
        }

        var connectionElements = d3.select(this.svg.current)
            .selectAll("path")
            .data(mapConnections, d => d.parent.node.id + "-" + d.child.node.id);

        connectionElements.exit().remove();

        var newConnectionElements = connectionElements.enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-width", 1.5)
            .attr("d", d3.linkVertical()
                    .source(d => d.parent)
                    .target(d => d.child)
                    .x(d => d.x)
                    .y(d => d.y));

        connectionElements
            .transition()
            .duration(500)
            .attr("d", d3.linkVertical()
                    .source(d => d.parent)
                    .target(d => d.child)
                    .x(d => d.x)
                    .y(d => d.y));

        /*newConnectionElements
            .each(function(d) { d.totalLength = this.getTotalLength() })
            .attr("stroke-dasharray", d => d.totalLength + " " + d.totalLength)
            .attr("stroke-dashoffset", d => d.totalLength)
            .transition("dash")
            .duration(2000)
            .attr("stroke-dashoffset", 0);*/

    }

    render() {
        return (
             <div className="mind-map">
                 <svg ref={this.svg}></svg>
                 <div ref={this.nodes} className="nodes" onClick={() => this.enlarge(null)}>
                 </div>
             </div>
        );
    }
}

export default MindMap;
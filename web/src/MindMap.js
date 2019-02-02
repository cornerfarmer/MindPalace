import React from 'react';
import * as d3 from "d3";
import {Command} from "./App";

const layer_offset = 100;
const space_between = 50;
const node_width = 70;

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.svg = React.createRef();
        this.nodes = React.createRef();
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
            .selectAll("div")
            .data(mapNodes, d => d.node.id);

        nodeElements.exit().remove();
        nodeElements.enter().append("div")
            .attr("class", "node")
            .on("click", d => this.props.focusNode(d.node.id))
            .text(d => d.node.content)
            .style("left", d => d.x + "px")
            .style("top", d => d.y + "px");

        nodeElements
            .transition(t)
            .duration(500)
            .text(d => d.node.content)
            .style("left", d => d.x + "px")
            .style("top", d => d.y + "px");

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
                 <div ref={this.nodes} className="nodes">
                 </div>
             </div>
        );
    }
}

export default MindMap;
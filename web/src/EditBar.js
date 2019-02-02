import React from 'react';
import * as d3 from "d3";
import EditNode from "./EditNode";
import {Command} from "./App";

class EditBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodeListing: [],
            selectedNode: ""
        };
        this.selectNode = this.selectNode.bind(this);
        this.selectNeighbour = this.selectNeighbour.bind(this);
        this.selectChild = this.selectChild.bind(this);
        this.selectParent = this.selectParent.bind(this);
        this.shiftIn = this.shiftIn.bind(this);
        this.shiftOut = this.shiftOut.bind(this);
    }

    componentDidMount() {
    }

    addNodesRecursive(nodeListing, node, sorting, level, maxLevels) {
        nodeListing.push({node: node, level: level, sorting: sorting});

        if (level < maxLevels) {
            for (const child of node.children) {
                this.addNodesRecursive(nodeListing, child.node, child.sorting, level + 1, maxLevels);
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if ((prevProps.nodes !== this.props.nodes || prevProps.focusedNode !== this.props.focusedNode) && this.props.focusedNode in this.props.nodes) {
            var nodeListing = [];
            const focusedNode = this.props.nodes[this.props.focusedNode];
            this.addNodesRecursive(nodeListing, focusedNode, -1, 0, 2);

            this.setState({
                nodeListing: nodeListing
            });
        }
    }

    selectNeighbour(node, dir) {
        var index = this.findNeighbour(node, dir);

        if (index < 0) {
            this.selectParent(node);
        } else if (index >= this.state.nodeListing.length) {
            this.selectChild(node);
        }  else {
            this.selectNode(this.state.nodeListing[index].node.id);
        }
    }

    selectParent(node) {
        if (node.main_parent !== null)
            this.selectNode(node.main_parent.id);
    }

    selectChild(node) {
        if (node.children.length > 0)
            this.selectNode(node.children[0].node.id);
    }

    selectNode(node_id) {
        this.setState({
            selectedNode: node_id
        });
    }

    findNeighbour(node, dir) {
        var start_index = this.state.nodeListing.findIndex(e => e.node === node);

        var index = start_index;
        do {
            index += dir;
            if (index >= this.state.nodeListing.length || index < 0)
                break;
        } while(this.state.nodeListing[start_index].level !== this.state.nodeListing[index].level);

        return index;
    }

    shiftIn(node) {
        if (node.main_parent !== null) {
            var index = this.findNeighbour(node, -1);
            if (index >= 0)
                this.props.onSendCommand(Command.MOVE, {old_parent_id: node.main_parent.id, new_parent_id: this.state.nodeListing[index].node.id, node_id: node.id});
        }
    }

    shiftOut(node) {
        if (node.main_parent !== null && node.main_parent.main_parent !== null) {
            var child = node.main_parent.main_parent.children.find(e => e.node === node.main_parent);
            this.props.onSendCommand(Command.MOVE, {old_parent_id: node.main_parent.id, new_parent_id: node.main_parent.main_parent.id, node_id: node.id, sorting: child.sorting + 1});
        }
    }

    render() {
        return (
             <div className="edit-bar">
                 {this.state.nodeListing.map((element) => (
                     <EditNode
                         key={element.node.id}
                         node={element.node}
                         sorting={element.sorting}
                         level={element.level}
                         onSendCommand={this.props.onSendCommand}
                         selected={element.node.id === this.state.selectedNode}
                         selectNode={this.selectNode}
                         selectNeighbour={this.selectNeighbour}
                         selectParent={this.selectParent}
                         selectChild={this.selectChild}
                         shiftIn={this.shiftIn}
                         shiftOut={this.shiftOut}
                        />
                 ))}
             </div>
        );
    }
}

export default EditBar;
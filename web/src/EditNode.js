import React from 'react';
import * as d3 from "d3";
import {Command} from "./App";
import FileUpload from "./FileUpload";
import File from "./File";

class EditNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: props.node.content
        };
        this.contentField = React.createRef();

        this.updateContent = this.updateContent.bind(this);
        this.deleteNode = this.deleteNode.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }

    componentDidMount() {
        if (this.props.selected) {
            this.contentField.current.focus();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selected !== this.props.selected && this.props.selected) {
            this.contentField.current.focus();
        }
    }

    updateContent(evt) {
        const newNode = {id: this.props.node.id, content: evt.target.value};

        this.props.onSendCommand(Command.UPDATE, newNode);
        this.setState({
            content: evt.target.value
        });
    }

    onPaste(event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                this.props.onSendCommand(Command.UPDATE_FILE, {file: items[i].getAsFile(), node_id: this.props.node.id});
                break;
            }
        }
    }

    onKeyDown(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.props.onSendCommand(Command.CREATE, {parent_id: this.props.level === 0 ? this.props.node.id : this.props.node.main_parent.id, sorting: this.props.sorting + 1}, result => this.props.selectNode(result.id));
        } else if (e.keyCode === 9) {
            e.preventDefault();
            if (e.shiftKey)
                this.props.shiftOut(this.props.node);
            else
                this.props.shiftIn(this.props.node);
        } else if (e.altKey) {
            if (e.keyCode === 38) {
                e.preventDefault();
                this.props.selectNeighbour(this.props.node, -1);
            } else if (e.keyCode === 40) {
                e.preventDefault();
                this.props.selectNeighbour(this.props.node, 1);
            } else if (e.keyCode === 37) {
                e.preventDefault();
                this.props.selectParent(this.props.node);
            } else if (e.keyCode === 39) {
                e.preventDefault();
                this.props.selectChild(this.props.node);
            }
        }
    }

    deleteNode() {
        this.props.onSendCommand(Command.DELETE, this.props.node.id);
    }

    deleteFile() {
        this.props.onSendCommand(Command.DELETE_FILE, this.props.node.id);
    }

    render() {
        return (
            <div className="edit-node">
                <div className={"content level-" + this.props.level}>
                    <input onPaste={this.onPaste} onKeyDown={this.onKeyDown} ref={this.contentField} type="text" name="content" value={this.state.content} onChange={evt => this.updateContent(evt)}/>
                    {this.props.node.file ?
                        <div>
                            <File file={this.props.node.file}/>
                            <div className="action" onClick={this.deleteFile} title="Delete file">
                                <i className="fas fa-times"></i>
                            </div>
                        </div>
                        :
                        <FileUpload onSendCommand={this.props.onSendCommand} node_id={this.props.node.id}/>
                    }
                </div>
                <div className="toolbar">
                    <div className="action" onClick={this.deleteNode} title="Delete node">
                        <i className="fas fa-trash-alt"></i>
                    </div>
                </div>
            </div>
        );
    }
}

export default EditNode;
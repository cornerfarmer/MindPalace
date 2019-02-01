import React from 'react';
import * as d3 from "d3";
import {Command} from "./App";

class EditNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: props.node.content
        };
        this.contentField = React.createRef();

        this.updateContent = this.updateContent.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    updateContent(evt) {
        const newNode = {id: this.props.node.id, content: evt.target.value};

        this.props.onSendCommand(Command.UPDATE, newNode);
        this.setState({
            content: evt.target.value
        });
    }

    onKeyDown(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.props.onSendCommand(Command.CREATE, this.props.level === 0 ? this.props.node.id : this.props.node.main_parent.id);
        }
    }

    render() {
        return (
             <div>
                 <input onKeyDown={this.onKeyDown} ref={this.contentField} type="text" name="content" value={this.state.content} onChange={evt => this.updateContent(evt)} />
             </div>
        );
    }
}

export default EditNode;
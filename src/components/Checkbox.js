import React, { Component } from 'react';
import './Checkbox.css';

export default class Checkbox extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="Checkbox">
                <input 
                    type="checkbox" 
                    checked={this.props.checked}
                    defaultChecked={true}
                    onChange={this.props.onCheck.bind(this)}
                    >
                </input>
                <a  href={this.props.client.dm_url}
                    className="checkbox">
                    {this.props.client.name}
                </a>
            </div>
        )
    }
}

import axios from 'axios';
import React, { Component } from 'react';
import './Notice.css';

export default class Notice extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.data.remaining > 0) {
            return (
                <div className="Notice">
                    <div className="uses">
                        Uses remaining: { this.props.data.remaining }
                    </div>
                    <div className="time-left">
                        Renews on: { new Date(this.props.data.time_stamp).toLocaleString() }
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className="Notice">
                    <div className="uses" style={{color: "#ff0000"}}>
                        Uses remaining: { this.props.data.remaining }
                    </div>
                    <div className="time-left">
                        Renews on: { new Date(this.props.data.time_stamp).toLocaleString() }
                    </div>
                </div>
            )           
        }
    }
}

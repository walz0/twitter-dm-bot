import axios from 'axios';
import React, { Component } from 'react';
import './Notice.css';

export default class Notice extends Component {

    constructor(props) {
        super(props);

        this.state = {
            remaining: null,
            max_uses: null,
            timestamp: null
        };
    }

    componentDidMount(props) {
        axios.get("http://localhost:5000/data")
            .then((res) => {
                this.setState(res.data);
                console.log(this.state);
            })
    }

    render() {
        return (
            <div className="Notice">
                <div className="uses">
                    Uses remaining: { this.state.remaining }
                </div>
                <div className="time-left">
                    Renews on: { new Date(this.state.time_stamp).toLocaleString() }
                </div>
            </div>
        )
    }
}

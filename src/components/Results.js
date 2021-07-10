import React, { Component } from 'react';
import './Results.css';

export default class Results extends Component {
    constructor(props) {
        super(props);
    }

    resultList() {
        let results = this.props.results;
        if (results.length > 0) {
            return(
                <div className="result-list">
                    {results.map(
                        (result) => {
                            if (result.status == 200) {
                                return (<div className="result">
                                    <a 
                                        className="name" 
                                        href={result.dm_url} 
                                        target="_blank"
                                        title="Go to conversation">{result.name} </a>
                                    <div className="status"> ✔️OK</div>
                                </div>);
                            } else {
                                return (<div className="result">
                                    <a 
                                        className="name" 
                                        href={result.dm_url}
                                        target="_blank"
                                        title="Go to conversation">{result.name} </a>
                                    <div className="status"> ️❌ERROR {result.status}</div>
                                </div>);                           
                            }
                        }, results)}
                </div>
            );
        }
        else {
            return null;
        }
    }

    render() {
        if (this.props.results.length == 0) {
            return (<div className="Results"></div>);
        }
        else {
            return (
                <div className="Results">
                    <h1>Results</h1>
                    { this.resultList() }
                </div>
            )
        }
    }
}

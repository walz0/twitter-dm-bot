import React, { Component } from 'react';
import './Config.css';

export default class Config extends Component {
    render() {
        return (
            <div className="Config">
                <h1>Google OAuth Token</h1>
                <input type="text" name="auth_code" placeholder="Paste google auth code here..." />
                <div class="button">
                    <input type="submit" value="Submit" />
                </div>
                <h1>
                    <a 
                        href="https://developer.twitter.com/en/portal/dashboard"
                        target="_blank">
                            Twitter API Keys
                    </a>
                </h1>
                <div className="container">
                    <input type="text" name="api_key" placeholder="Paste consumer key here..." />
                </div>
                <div className="container">
                    <input type="text" name="api_secret" placeholder="Paste consumer secret here..." />
                </div>
                <div className="container">
                    <input type="text" name="access_token" placeholder="Paste token here..." />
                </div>
                <div className="container">
                    <input type="text" name="token_secret" placeholder="Paste token secret here..." />
                </div>
                <div class="button">
                    <input type="submit" value="Submit" />
                </div>
            </div>
        )
    }
}

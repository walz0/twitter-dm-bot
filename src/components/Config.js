import axios from 'axios';
import React, { Component } from 'react';
import './Config.css';

export default class Config extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tokenStatus: 0,
            twitterAuth: false,
            tokenURL: "",
            googleInput: "",

            apiKey: "",
            apiSecret: "",
            accessToken: "",
            tokenSecret: ""
        };
    }

    componentDidMount() {
        axios.get("http://localhost:5000/check_token")
            .then((res) => {
                if (res.data == "OK") {
                    this.setState({tokenStatus: res.data});
                }
                else {
                    this.setState({tokenURL: res.data});
                }
                console.log(this.state);
            })
            .catch((err) => {
                console.log(err);
            });
        axios.get("http://localhost:5000/twitter_auth")
            .then((res) => {
                this.setState({
                    twitterAuth: res.data
                })
            })
    }

    submitGoogle() {
        axios({
            method: 'post',
            url: 'http://localhost:5000/submit_google',
            data: {
                "code": this.state.googleInput
            }
        })
            .then((res) => {
                this.setState({
                    tokenURL: "",
                    googleInput: ""
                });
            })
            .catch((err) => {console.log(err);})
    }

    googleAuth() {
        let url = this.state.tokenURL;
        if (this.state.tokenStatus !== "OK") {
            return (
                <div className="token-url">
                    <a href={url} target="_blank">Click this link to get token</a>
                </div>
            );
        }
        else {
            return null;
        }
    }

    googleForm() {
        if (this.state.tokenURL !== "") {
            return(<div>
                <h1>Google OAuth Token</h1>
                { this.googleAuth() }
                <input 
                    onChange={(e) => {
                        this.setState({googleInput: e.target.value});
                    }} 
                    type="text" 
                    value={this.state.googleInput} 
                    name="auth_code" 
                    placeholder="Paste google auth code here..." />
                <div class="button">
                    <input type="submit" value="Submit" onClick={this.submitGoogle.bind(this)}/>
                </div>
            </div>);
        }
        else {
            return (<div>
                <h1>Google OAuth Token</h1>
                <h2>✔️OK</h2>
            </div>);
        }
    }

    submitTwitter() {
        axios({
            method: 'post',
            url: 'http://localhost:5000/submit_twitter',
            data: {
                api_key: this.state.apiKey,
                api_secret: this.state.apiSecret,
                access_token: this.state.accessToken,
                token_secret: this.state.tokenSecret
            }
        })
        .then((res) => {
            axios.get("http://localhost:5000/twitter_auth")
                .then((response) => {
                    if (response.data == true) {
                        this.setState({twitterAuth: response.data})
                    }
                })
            this.setState({
                api_key: "",
                api_secret: "",
                access_token: "",
                token_secret: ""
            });
        })
        .catch((err) => {
            console.log(err);
        })
    }

    twitterForm() {
        if (!this.state.twitterAuth) {
            return (<div>
                <h1><a href="https://developer.twitter.com/en/portal/dashboard"
                    target="_blank">
                        Twitter API Keys
                </a></h1>
                <div className="container">
                    <input 
                        type="text" 
                        name="api_key" 
                        value={this.state.apiKey}
                        placeholder="Paste API key here..."
                        onChange={(e) => { this.setState({apiKey: e.target.value}) }} />
                </div>
                <div className="container">
                    <input 
                        type="text" 
                        value={this.state.apiSecret}
                        name="api_secret" 
                        placeholder="Paste API secret key here..."
                        onChange={(e) => { this.setState({apiSecret: e.target.value}) }} />
                </div>
                <div className="container">
                    <input 
                        type="text" 
                        value={this.state.accessToken}
                        name="access_token" 
                        placeholder="Paste token here..."
                        onChange={(e) => { this.setState({accessToken: e.target.value}) }} />
                </div>
                <div className="container">
                    <input 
                        type="text" 
                        value={this.state.tokenSecret}
                        name="token_secret" 
                        placeholder="Paste token secret here..."
                        onChange={(e) => { this.setState({tokenSecret: e.target.value}) }} />
                </div>
                <div class="button">
                    <input type="submit" value="Submit" onClick={this.submitTwitter.bind(this)} />
                </div>
            </div>)
        }
        else {
            return (<div>
                <h1>Twitter API Keys</h1>
                <h2>✔️OK</h2>
            </div>)
        }
    }

    render() {
        return (
            <div className="Config">
                { this.googleForm() }
                { this.twitterForm() }
            </div>
        )
    }
}

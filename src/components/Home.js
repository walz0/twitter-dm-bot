import React, { Component } from 'react';
import Checkbox from './Checkbox.js';
import Results from './Results.js';
import Notice from './Notice.js';
import axios from 'axios';
import './Home.css';

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: "", // Message to be sent
            clients: [], // Clients pulled from sheet
            results: [], // Message response codes
            sender: process.env.REACT_APP_SENDER, // Twitter ID of sender
            invalidToken: false, // If google token is valid
            data: [] // User data
        };
    }

    componentDidMount() {
        axios.get(process.env.REACT_APP_API + "/check_uses");
        axios.get(process.env.REACT_APP_API + "/data")
            .then((res) => {
                this.setState({
                    data: res.data
                })
            });
        axios.get(process.env.REACT_APP_API + "/clients")
            .then((res) => {
                let data = res.data;
                data = data.map((client) => {
                    return {
                        "name": client[0],
                        "dm_url": client[1],
                        "selected": true
                    };
                }, data);
                this.setState({
                    clients: data
                });
            })
            .catch((err) => {
                this.setState({invalidToken: true});
            });
    }

    handleInput(event) {
        this.setState({
            message: event.target.value
        });
    }

    inputBox() {
        return (
            <textarea 
                className="inputBox"
                placeholder="Message"
                value={this.state.message}
                onChange={this.handleInput.bind(this)}>
            </textarea>
        );
    }

    // Send DM to selected clients
    send() {
        // Clear results before sending again
        this.setState({results: []})

        function parseURL(sender_id, url) {
            let start = url.indexOf('messages/') + 'messages/'.length;
            let sliced = url.slice(start);
            let id_index = sliced.indexOf(sender_id);

            return (id_index == 0) ? 
                sliced.slice(sender_id.length).replace('-', '') : 
                sliced.slice(0, id_index).replace('-', '');
        }

        // let clients = this.state.clients;
        // let selected = clients.filter((client) => client.selected, clients);
        let selected = [{
            "name": "Walz0D",
            "dm_url": "https://twitter.com/messages/1412861778653028360-1412861778653028360"
        }];
        selected.map((client) => {
            let id = parseURL(this.state.sender, client.dm_url);
            axios({
                method: 'post',
                url: process.env.REACT_APP_API + '/direct_message',
                data: {
                    "id": id,
                    "message": this.state.message
                }
            }).then((res) => {
                let results = this.state.results;
                results.push({
                    "name": client.name,
                    "dm_url": client.dm_url,
                    "status": res.status
                });
                this.setState({"results": results})
            });
        });
        let data = this.state.data;
        data.remaining -= 1;
        this.setState({"data": data})
        axios.get(process.env.REACT_APP_API + '/decrement_uses');
    }

    handleSelectAll(event) {
        let clients = this.state.clients;
        clients = clients.map((client) => {
            client.selected = event.target.checked;
            return client;
        }, clients);
        this.setState({
            "clients": clients
        })
    }

    clientList() {
        if (!this.state.invalidToken) {
            if (this.state.clients !== undefined) {
                let clients = this.state.clients;
                return (
                <div className="clients">
                    {clients.map(
                        (client) => (
                            <Checkbox
                                client={client} 
                                checked={client.selected} 
                                onCheck={() => {
                                    clients.map((_, index) => {
                                        if (client.name == clients[index].name) {
                                            clients[index].selected = !client.selected;
                                            this.setState({"clients": clients});
                                        }
                                    }, clients);
                                }}
                            />
                        ),
                        clients)}
                </div>);
            }
        }
        else {
            return (
                <div>
                    An error occurred, google auth token is missing or expired
                </div>
            );
        }
    }

    render() {
        if (this.state.data.remaining > 0) {
            return (
                <div className="Home">
                    <h1>Twitter DM Bot</h1>
                    <Notice data={this.state.data}/>
                    {this.inputBox()}
                    <div className="button">
                        <input type="submit" onClick={this.send.bind(this)}></input>
                    </div>
                    <Results results={this.state.results}/>
                    <h3>
                        Recipients: {
                            this.state.clients.filter(
                                (client) => client.selected, 
                                this.state.clients).length
                            }
                    </h3>
                    <div className="select-all">
                        Select All
                        <input 
                            type="checkbox" 
                            defaultChecked={true}
                            onChange={this.handleSelectAll.bind(this)}
                            ></input>
                    </div>
                    {this.clientList()}
                </div>
            )
        }
        else {
            return(<Notice data={this.state.data}/>);
        }
    }
}

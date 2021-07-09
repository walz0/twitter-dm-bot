import React, { Component } from 'react';
import Checkbox from './Checkbox.js';
import axios from 'axios';
import './Home.css';

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: "", // Message to be sent
            clients: []
        };
    }

    componentDidMount() {
        axios.get("http://localhost:5000/clients")
            .then((response) => {
                let data = response.data;
                data = data.map((client) => {
                    return {
                        "name": client[0],
                        "dm_url": client[1]
                    };
                }, data);
                this.setState({
                    clients: data,
                });
            })
            .catch((err) => {
                console.log(err);
            })
        this.toggleAll();
    }

    handleInput(event) {
        this.setState({
            currentText: event.target.value
        });
    }

    inputBox() {
        return (
            <textarea 
                className="inputBox"
                placeholder="Message"
                value={this.state.currentText}
                onChange={this.handleInput.bind(this)}>
            </textarea>
        );
    }

    // Toggle all clients selected
    toggleAll() {
        let clients = this.state.clients; 
        clients.map((client) => {
            client.selected = !client.selected;
        }, clients);
        this.setState(clients);
    }

    clientList() {
        let clients = this.state.clients;
        return (<div className="list">
            {clients.map(
                (client) => (
                    <Checkbox
                        client={client} 
                        checked={client.selected} 
                        onCheck={(props) => {
                            client.selected = !client.selected;
                        }}
                    />
                ),
                clients)}
        </div>);
    }

    render() {
        return (
            <div className="Home">
                <h1>Twitter DM Bot</h1>
                {this.inputBox()}
                <div className="button">
                    <input type="submit"></input>
                </div>
                {this.clientList()}
            </div>
        )
    }
}

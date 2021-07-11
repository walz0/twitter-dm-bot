import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import md5 from 'md5';
import './Login.css';

export default class Login extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
        };
    }

    handleUsername(e) {
        this.setState({
            "username": e.target.value
        });
    }

    handlePassword(e) {
        this.setState({
            "password": md5(e.target.value)
        });
    }

    submit() {
        console.log(process.env.REACT_APP_API);
        axios.post(process.env.REACT_APP_API + '/token',
            {
                "username": this.state.username,
                "password": this.state.password
            })
            .then((res) => {
                let token = res.data.access_token;
                // Save token to cookies
                localStorage.setItem("token", token);
                console.log(this.props);
                this.props.auth();
            })
            .catch((err) => {})
    }

    render() {
        return (
            <div className="Login">
                <h1>Twitter Bot Login</h1>
                <div className="container">
                    <div className="container">
                        Username: 
                        <input 
                            type="text" 
                            onChange={this.handleUsername.bind(this)}>
                        </input> 
                    </div>
                    <div className="container">
                        Password: 
                        <input 
                            type="password" 
                            onChange={this.handlePassword.bind(this)}>
                        </input>
                    </div>
                </div>
                <Link to="/" className="button">
                    <input type="submit" onClick={this.submit.bind(this)}></input>
                </Link>
            </div>
        )
    }
}

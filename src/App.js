import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';
import Home from './components/Home';
import Config from './components/Config';
import Navbar from './components/Navbar';
import Login from './components/Login';
import { Component } from 'react';
import axios from 'axios';

export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            authenticated: false
        };
    }

    componentDidMount(props) {
        let token = localStorage.getItem("token");
        axios.post(process.env.REACT_APP_API + '/auth', 
            {"token": token})
        .then((res) => {
            if (res.status == 200) {
                this.setState({authenticated: true});
            }
            else {
                this.setState({authenticated: false});
            }
        })
    }

    authUser() {
        this.setState({authenticated: true});
        console.log(this.state);
    }

    app() {
        return (
            <Router>
                <Navbar />
                <Switch>
                    <Route path="/settings">
                        <Config />
                    </Route>
                    <Route path="/">
                        <Home />            
                    </Route>
                </Switch>
            </Router>
        );
    }

    render() {
        let auth = this.state.authenticated;
        return (
            <div className="App">
                <Router>
                { auth ? this.app() : <Login auth={this.authUser.bind(this)} /> }    
                </Router>
            </div>
        );
    }
}
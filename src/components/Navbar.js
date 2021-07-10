import React, { Component } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {
    render() {
        return (
            <div className="Navbar">
                <ul>
                    <li>
                        <Link to="/settings">
                            Settings
                        </Link>
                    </li>
                    <li>
                        <Link to="/">
                            Home
                        </Link>
                    </li>
                </ul>
            </div>
        )
    }
}

import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';
import Home from './components/Home';
import Config from './components/Config';
import Navbar from './components/Navbar';

function App() {
    return (
        <div className="App">
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
        </div>
    );
}

export default App;

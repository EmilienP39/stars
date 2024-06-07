import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Pegasus Constellation App</h1>
            <ul>
                <li><Link to="/home/stars/Markab">View coordinates of Markab</Link></li>
                <li><Link to="/home/stars/Scheat">View coordinates of Scheat</Link></li>
                <li><Link to="/home/stars/Algenib">View coordinates of Algenib</Link></li>
                <li><Link to="/home/stars/Alpheratz">View coordinates of Alpheratz</Link></li>
            </ul>
        </div>
    );
};

export default Home;

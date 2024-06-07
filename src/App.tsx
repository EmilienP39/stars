import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Stars from './components/Stars';
import Home from "./components/home.tsx";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/home/stars/:nomStar" element={<Stars />} />
                <Route path="/" element={<Home/>} />
            </Routes>
        </Router>
    );
};

export default App;

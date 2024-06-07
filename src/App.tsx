import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Stars from './components/Stars';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/home/stars/pegase" element={<Stars />} />
            </Routes>
        </Router>
    );
};

export default App;

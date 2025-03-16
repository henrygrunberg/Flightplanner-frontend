import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/sharedlayout/Header.jsx';
import FlightsTable from './components/pagecontent/FlightsTable.jsx';
import BookFlight from './components/pagecontent/BookFlight.jsx';
import SeatSelection from './components/pagecontent/SeatSelection.jsx';
import BookingConfirmation from './components/pagecontent/BookingConfirmation.jsx';

function MainApp() {
    const location = useLocation();

    return (
        <div className="App">
            <Header />
            <main>
                <Routes>
                    {/* Main Flights Table View */}
                    <Route path="/" element={<FlightsTable />} />
                    <Route path="/book/:flightId" element={<BookFlight />} />
                    <Route path="/seat-selection/:flightId" element={<SeatSelection />} />
                    <Route path="/confirmation/:flightId" element={<BookingConfirmation />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <MainApp />
        </Router>
    );
}

export default App;

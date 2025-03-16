import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/FlightsTable.css";
import { useNavigate } from "react-router-dom";

const FlightsTable = () => {
    const navigate = useNavigate();
    const [flights, setFlights] = useState([]); 
    const [searchCriteria, setSearchCriteria] = useState({
        departure: "",
        destination: "",
        minPrice: "",
        maxPrice: "",
        DepartureStartDate: "",
        DepartureEndDate: "",
        airlineName: "",
        page: 0,
        size: 10,
        sortBy: "departureDate",
        sortDirection: "asc",
    });

    useEffect(() => {
        fetchFlights();
    }, [searchCriteria.page]);

    const fetchFlights = async () => {
        try {
            const response = await axios.get("/api/flights/table", { params: searchCriteria });
    
            if (response.data && Array.isArray(response.data.content)) {
                console.log("API Response:", response.data);
                setFlights(response.data.content);
            } else {
                console.error("Unexpected API response format:", response.data);
                setFlights([]);
            }
        } catch (error) {
            console.error("Error fetching flights:", error);
            setFlights([]);
        }
    };

    const handleInputChange = (e) => {
        setSearchCriteria({ ...searchCriteria, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        fetchFlights();
    };

    return (
        <div className="page-container"> {/* Gray background */}
            <div className="flights-wrapper"> {/* White container */}
    
                {/* Search Section */}
                <div className="search-container">
                    <div className="flights-header">
                        <h2>Flights</h2>
                    </div>
                    <h3>Find the perfect flight for you</h3>
                    <div className="search-box">
                        {/* Row 1 */}
                        <div className="input-group">
                            <label>Departure:</label>
                            <input type="text" name="departure" placeholder="Enter departure city" value={searchCriteria.departure} onChange={handleInputChange} className="input" />
                        </div>

                        <div className="input-group">
                            <label>Destination:</label>
                            <input type="text" name="destination" placeholder="Enter destination city" value={searchCriteria.destination} onChange={handleInputChange} className="input" />
                        </div>

                        <div className="input-group">
                            <label>Min Price ($):</label>
                            <input type="number" name="minPrice" placeholder="0" value={searchCriteria.minPrice} onChange={handleInputChange} className="input" />
                        </div>

                        <div className="input-group">
                            <label>Max Price ($):</label>
                            <input type="number" name="maxPrice" placeholder="1000" value={searchCriteria.maxPrice} onChange={handleInputChange} className="input" />
                        </div>

                        {/* Row 2 */}
                        <div className="input-group">
                            <label>Departure Date:</label>
                            <input type="date" name="DepartureStartDate" value={searchCriteria.DepartureStartDate} onChange={handleInputChange} className="input" />
                        </div>

                        <div className="input-group">
                            <label>Return Date:</label>
                            <input type="date" name="DepartureEndDate" value={searchCriteria.DepartureEndDate} onChange={handleInputChange} className="input" />
                        </div>

                        <div className="input-group">
                            <label>Airline:</label>
                            <input type="text" name="airlineName" placeholder="Enter airline" value={searchCriteria.airlineName} onChange={handleInputChange} className="input" />
                        </div>

                        {/* Search Button (aligned right) */}
                        <div className="button-container">
                            <button onClick={handleSearch} className="search-button">Search</button>
                        </div>
                    </div>
                </div>
    
                {/* Flight Results */}
                {flights.length === 0 ? (
                    <p className="no-flights-message">No flights found.</p>
                ) : (
                    <div className="flights-list">
                        {flights.map((flight) => (
                            <div key={flight.flightId} className="flight-card">
                                <div className="flight-info">
                                    <h2 className="flight-route">
                                        {flight.departure} &nbsp;✈&nbsp; {flight.destination}
                                    </h2>
                                    <p><strong>Airline:</strong> {flight.airlineName}</p>
                                    <p><strong>Departure:</strong> {new Date(flight.departureDate).toLocaleString([], { hour: '2-digit', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    <p><strong>Arrival:</strong> {new Date(flight.arrivalDate).toLocaleString([], { hour: '2-digit', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    <h3><strong>Price:</strong> ${flight.price}</h3>
                                </div>

                                <img 
                                    src={`/${flight.airlineName.toLowerCase().replace(/\s+/g, '-')}.png`} 
                                    alt={flight.airlineName} 
                                    className="airline-logo"
                                />
    
                                <button 
                                    className="book-button" 
                                    onClick={() => navigate(`/book/${flight.flightId}`)}
                                >
                                    Book Now
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {/* Pagination Controls */}
                <div className="pagination">
                    <button 
                        className="pagination-button"
                        onClick={() => setSearchCriteria(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={searchCriteria.page === 0} // Disable on first page
                    >
                        Previous Page
                    </button>
                    
                    <span>Page {searchCriteria.page + 1}</span> {/* Show current page */}
                    
                    <button 
                        className="pagination-button"
                        onClick={() => setSearchCriteria(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={flights.length < searchCriteria.size} // Disable if no more flights
                    >
                        Next Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlightsTable;

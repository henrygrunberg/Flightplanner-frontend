import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API requests
import "../css/BookFlight.css";

const BookFlight = () => {
    const { flightId } = useParams();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [numPassengers, setNumPassengers] = useState(1);
    const [passengerData, setPassengerData] = useState([]);
    const [flightDetails, setFlightDetails] = useState(null);

    const [seatLayout, setSeatLayout] = useState([]);
    const [hasFirstClass, setHasFirstClass] = useState(false);

    // Fetch flight details when component mounts
    useEffect(() => {
        const fetchFlightDetails = async () => {
            try {
                const response = await axios.get(`/api/flights/${flightId}`);
                console.log("API response:", response.data);
                setFlightDetails(response.data);
            } catch (error) {
                console.error("Error fetching flight details:", error);
                alert("Failed to fetch flight details. Please try again.");
            }
        };

        fetchFlightDetails();
    }, [flightId]);

    useEffect(() => {
        const fetchSeatLayout = async () => {
            try {
                const response = await axios.get(`/api/seats/${flightId}`);
                console.log("Seat Layout API response:", response.data);
                setSeatLayout(response.data.seatRows);
    
                const hasFirstClassSeats = response.data.seatRows.some(row =>
                    row.seats.some(seat => seat.seatClass === "FIRST")
                );
                setHasFirstClass(hasFirstClassSeats);
            } catch (error) {
                console.error("Error fetching seat layout:", error);
                setSeatLayout([]);
                setHasFirstClass(false);
            }
        };
    
        fetchSeatLayout();
    }, [flightId]);

    // Ensure `passengerData` always matches `numPassengers`
    useEffect(() => {
        setPassengerData((prevPassengers) => {
            let updatedPassengers = [...prevPassengers];

            // If passengers are added
            while (updatedPassengers.length < numPassengers) {
                updatedPassengers.push({
                    passengerName: "",
                    nationality: "",
                    passportNumber: "",
                    seatClass: "ECONOMY",
                    seatPreference: "window",
                });
            }

            // If passengers are removed
            updatedPassengers = updatedPassengers.slice(0, numPassengers);

            // Ensure "Together" option is deselected if only 1 passenger
            if (numPassengers === 1) {
                updatedPassengers = updatedPassengers.map(passenger =>
                    passenger.seatPreference === "together" ? { ...passenger, seatPreference: "window" } : passenger
                );
            }

            return updatedPassengers;
        });
    }, [numPassengers]);

    // Handle number of passengers change
    const handlePassengerCountChange = (type) => {
        if (type === "increment" && numPassengers < 8) {
            setNumPassengers(numPassengers + 1);
        } else if (type === "decrement" && numPassengers > 1) {
            setNumPassengers(numPassengers - 1);
        }
    };

    // Handle input change for passenger details
    const handlePassengerChange = (index, field, value) => {
        const updatedPassengers = [...passengerData];
        updatedPassengers[index][field] = value;
        setPassengerData(updatedPassengers);
    };

    // Submit passenger data to backend
    const submitPassengerData = async () => {
        const bookingRequest = {
            flightId: parseInt(flightId, 10),
            passengers: passengerData
        };

        try {
            const response = await axios.post("/api/booking/recommend-seats", bookingRequest);

            // Move to seat selection step, passing recommendations
            navigate(`/seat-selection/${flightId}`, { state: { passengers: passengerData, recommendations: response.data, flightDetails, seatLayout  } });

        } catch (error) {
            console.error("Error submitting booking:", error);
            alert("Failed to fetch seat recommendations. Please try again.");
        }
    };

    const isFormComplete = () => {
        return passengerData.every(passenger =>
            passenger.passengerName.trim() !== "" &&
            passenger.nationality.trim() !== "" &&
            passenger.passportNumber.trim() !== ""
        );
    };
    
    const handleNextStep = () => {
        if (step === 1) {
            if (!isFormComplete()) {
                alert("Please fill in all required fields before proceeding.");
                return;
            }
            setStep(2);
            submitPassengerData();
        } else if (step === 2) {
            submitPassengerData();
        }
    };

    return (
        <div className="page-container"> {/* Gray background */}
            <div className="booking-wrapper"> {/* White container */}
                
                {/* Header */}
                <div className="booking-header">
                    <h2>Book Your Flight</h2>
                </div>
    
                {/* Flight Details */}
                {flightDetails ? (
                    <div className="flight-details-container">
                        <h3 className="flight-route">
                            {flightDetails.departure} &nbsp;&nbsp;✈&nbsp;&nbsp; {flightDetails.destination}
                        </h3>
                        <div className="flight-details">
                            <p><strong>Airline:</strong> {flightDetails.airlineName}</p>
                            <p><strong>Departure:</strong> {new Date(flightDetails.departureDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            <p><strong>Arrival:</strong> {new Date(flightDetails.arrivalDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                ) : (
                    <p className="loading-text">Loading flight details...</p>
                )}
    
                {/* Passenger Selection */}
                <div className="passenger-selection">
                    <h3>Step 1: Select Number of Passengers</h3>
                    <div className="passenger-counter">
                        <button className="passenger-btn decrease" onClick={() => handlePassengerCountChange("decrement")} disabled={numPassengers === 1}></button>
                        <span>{numPassengers}</span>
                        <button className="passenger-btn increase" onClick={() => handlePassengerCountChange("increment")} disabled={numPassengers === 8}></button>
                    </div>
                </div>
    
                {/* Passenger Details Form */}
                <div className="step-container">
                    <h3>Step 2: Enter Passenger Details</h3>
                    {passengerData.map((passenger, index) => (
                        <div key={index} className="passenger-form">
                            <h4>Passenger {index + 1}</h4>
    
                            <label>Full Name: *</label>
                            <label>Nationality: *</label>
                            <label>Passport Number: *</label>

                            {/* Row 2: Inputs */}
                            <input 
                                type="text"
                                placeholder="Full Name"
                                value={passenger.passengerName}
                                onChange={(e) => handlePassengerChange(index, "passengerName", e.target.value)}
                                required
                                className="input"
                            />
                            <input 
                                type="text"
                                placeholder="Nationality"
                                value={passenger.nationality}
                                onChange={(e) => handlePassengerChange(index, "nationality", e.target.value)}
                                required
                                className="input"
                            />
                            <input 
                                type="text"
                                placeholder="Passport Number"
                                value={passenger.passportNumber}
                                onChange={(e) => handlePassengerChange(index, "passportNumber", e.target.value)}
                                required
                                className="input"
                            />
    
                            <label>Select Seat Class:</label>
                            <div className="seat-class-container">
                                {[
                                    { value: "ECONOMY", label: `Economy - $${flightDetails?.price?.toFixed(2) || "Loading..."}` },
                                    { value: "BUSINESS", label: `Business - $${flightDetails?.price ? (flightDetails.price * 1.6).toFixed(2) : "Loading..."}` },
                                    hasFirstClass && { value: "FIRST", label: `First Class - $${flightDetails?.price ? (flightDetails.price * 3.5).toFixed(2) : "Loading..."}` }
                                ].filter(Boolean)
                                .map((option) => (
                                    <div 
                                        key={option.value} 
                                        className={`seat-class-option ${passenger.seatClass === option.value ? 'selected' : ''}`}
                                        onClick={() => handlePassengerChange(index, "seatClass", option.value)}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
    
                            <label>Select Seat Preference:</label>
                            <div className="seat-preference-container">
                                {["window", "aisle", "legroom", "exit", numPassengers > 1 ? "together" : null].map((option) => (
                                    option && (
                                        <div 
                                            key={option} 
                                            className={`seat-preference-option ${passenger.seatPreference === option ? 'selected' : ''}`}
                                            onClick={() => handlePassengerChange(index, "seatPreference", option)}
                                        >
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                    <button className="next-button" onClick={handleNextStep} disabled={step === 1 && !isFormComplete()}>Next</button>
                </div>
            </div>
        </div>
    );    
};

export default BookFlight;

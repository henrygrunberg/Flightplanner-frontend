import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/BookingConfirmation.css";

const BookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingDetails = location.state?.bookingDetails || {};
    const flightDetails = location.state?.flightDetails || {};

    if (!bookingDetails.passengers || bookingDetails.passengers.length === 0) {
        return (
            <div className="page-container">
                <div className="confirmation-wrapper">
                    <h2>Booking Confirmation</h2>
                    <p>No booking details found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="confirmation-wrapper">
                <h2 className="confirmation-header">BOOKING CONFIRMED!</h2>
                <p className="confirmation-flight-info">
                    <span className="confirmation-flight-date">
                        {new Date(flightDetails.departureDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false, day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    
                    <strong>{flightDetails.departure}</strong>&nbsp;&nbsp;&nbsp; ✈ &nbsp;&nbsp;&nbsp;<strong>{flightDetails.destination}</strong>

                    <span className="confirmation-flight-date">
                        {new Date(flightDetails.arrivalDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false, day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                </p>
                {/* Passenger List */}
                <div className="confirmed-passenger-list">
                    {bookingDetails.passengers.map((passenger, index) => (
                        <div key={index} className="confirmed-passenger-card">
                            <h3>Passenger {index + 1}</h3>
                            <p><strong>Name:</strong> {passenger.passengerName}</p>
                            <p><strong>Nationality:</strong> {passenger.nationality}</p>
                            <p><strong>Passport:</strong> {passenger.passportNumber}</p>
                            <p><strong>Seat:</strong> {passenger.seatNumber} ({passenger.seatClass})</p>
                        </div>
                    ))}
                </div>
                <div className="confirmed-back-home">
                    <h3 className="thanks">Thank you for booking your flight with us!</h3>
                    <button className="back-to-flights-button" onClick={() => navigate("/")}>
                        ⬅ Book more flights
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;

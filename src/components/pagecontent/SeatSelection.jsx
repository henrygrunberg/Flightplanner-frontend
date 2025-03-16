import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/SeatSelection.css";

const SeatSelection = () => {
    const { flightId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const flightDetails = location.state?.flightDetails || [];
    const passengers = location.state?.passengers || [];
    const [processedSeatLayout, setProcessedSeatLayout] = useState([]);
    const recommendations = location.state?.recommendations?.recommendations || [];

    const seatLayout = location.state?.seatLayout || [];
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [assignedSeats, setAssignedSeats] = useState({});

    // Pre-assign recommended seats
    useEffect(() => {
        const initialAssignments = {};
        passengers.forEach((passenger) => {
            const recommendation = recommendations.find((rec) => rec.passengerName === passenger.passengerName);
            if (recommendation) {
                initialAssignments[passenger.passengerName] = recommendation.recommendedSeat !== "N/A" 
                    ? recommendation.recommendedSeat 
                    : null;
            }
        });
        setAssignedSeats(initialAssignments);

        // Auto-select the first passenger
        if (passengers.length > 0) {
            setSelectedPassenger(passengers[0].passengerName);
        }
    }, [passengers, recommendations]);

    // Get a list of all already assigned seats
    const takenSeats = Object.values(assignedSeats).filter(seat => seat);

    // Handle seat selection
    const handleSeatClick = useCallback((rowNumber, seatPosition) => {
        if (!selectedPassenger) return;
    
        const seatKey = `${rowNumber}${seatPosition}`;
    
        setAssignedSeats((prev) => {
            if (Object.values(prev).includes(seatKey)) return prev; // Prevent duplicate assignment
            return { ...prev, [selectedPassenger]: seatKey };
        });
    }, [selectedPassenger]);

    // Cancel pending bookings if the user navigates away
    const cancelPendingBookings = async () => {
        try {
            await axios.delete(`/api/booking/cancel/${flightId}`);
            console.log("Pending bookings deleted successfully.");
        } catch (error) {
            console.error("Error canceling pending bookings:", error);
        }
    };

    // Finalize booking
    const finalizeBooking = async () => {
        const bookingRequest = {
            flightId: parseInt(flightId, 10),
            passengers: passengers.map((passenger) => ({
                passengerName: passenger.passengerName,
                nationality: passenger.nationality,
                passportNumber: passenger.passportNumber,
                seatClass: getSeatClass(assignedSeats[passenger.passengerName]),
                seatNumber: assignedSeats[passenger.passengerName] || "N/A",
                bookingStatus: "CONFIRMED",
            })),
        };
    
        try {
            await axios.post("/api/booking/finalize", bookingRequest);
            navigate(`/confirmation/${flightId}`, { state: { bookingDetails: bookingRequest, flightDetails: flightDetails } });
        } catch (error) {
            console.error("Error finalizing booking:", error);
            alert("Failed to finalize booking. Please try again.");
        }
    };

    const getSeatClass = (seatNumber) => {
        if (!seatNumber || seatNumber === "N/A") return "N/A";
    
        for (const row of seatLayout) {
            const foundSeat = row.seats.find(seat => `${row.rowNumber}${seat.seatPosition}` === seatNumber);
            if (foundSeat) {
                return foundSeat.seatClass;
            }
        }
        
        return "N/A"; // Default if not found
    };

    const formatSeatClass = (seatClass) => {
        if (!seatClass || seatClass === "N/A") return "";
        return seatClass.charAt(0).toUpperCase() + seatClass.slice(1).toLowerCase();
    };

    const handleCancel = useCallback(async () => {
        await cancelPendingBookings();
        navigate(-1);
    }, [navigate]);

    
    useEffect(() => {
        const handleHashChange = () => {
            handleCancel();
        };
    
        window.addEventListener("hashchange", handleHashChange);
        
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, [handleCancel]);
    
    const getInitials = (fullName) => {
        const nameParts = fullName.trim().split(" ");
        if (nameParts.length >= 2) {
            return `${nameParts[0][0].toUpperCase()}${nameParts[nameParts.length - 1][0].toUpperCase()}`;
        }
        return nameParts[0][0].toUpperCase(); // If only one name is available
    };    

    useEffect(() => {
        if (seatLayout.length > 0) {
            const newLayout = seatLayout.map((row) => {
                let columns = {};
                let columnIndex = 1;
                let previousSeatWasAisle = false;
    
                const sortedSeats = [...row.seats].sort((a, b) => a.seatPosition.localeCompare(b.seatPosition));
    
                // Handle first-class separate logic
                if (sortedSeats.length === 4 && sortedSeats.every(seat => seat.seatClass === "FIRST") && sortedSeats.every(seat => seat.isAisle)) {
                    columns[1] = [sortedSeats[0]];
                    columns[2] = [sortedSeats[1], sortedSeats[2]];
                    columns[3] = [sortedSeats[3]];
                } else if (sortedSeats.length === 2 && sortedSeats.every(seat => seat.seatClass === "FIRST")) {
                    if (sortedSeats.every(seat => seat.isAisle)) {
                        columns[2] = [sortedSeats[0], sortedSeats[1]];
                    }
                } else if (sortedSeats.length === 7 && sortedSeats.every(seat => seat.seatClass === "BUSINESS")) {
                    columns[1] = [sortedSeats[0], sortedSeats[1]];
                    columns[2] = [sortedSeats[2], sortedSeats[3], sortedSeats[4]];
                    columns[3] = [sortedSeats[5], sortedSeats[6]];
                } else if (sortedSeats.length === 6) {
                    columns[1] = [sortedSeats[0], sortedSeats[1], sortedSeats[2]];
                    columns[2] = [sortedSeats[3], sortedSeats[4], sortedSeats[5]];
                } else if (sortedSeats.length === 9 && sortedSeats.every(seat => seat.seatClass === "ECONOMY")) {
                    columns[1] = [sortedSeats[0], sortedSeats[1], sortedSeats[2]];
                    columns[2] = [sortedSeats[3], sortedSeats[4], sortedSeats[5]];
                    columns[3] = [sortedSeats[6], sortedSeats[7], sortedSeats[8]];
                } else if (sortedSeats.length === 4 && sortedSeats.every(seat => seat.seatClass === "FIRST")) {
                    columns[1] = [sortedSeats[0], sortedSeats[1]];
                    columns[2] = [sortedSeats[2], sortedSeats[3]];
                }
    
                return {
                    rowNumber: row.rowNumber,
                    columns,
                };
            });
    
            setProcessedSeatLayout(newLayout);
        }
    }, [seatLayout]);

    const getSeatPrice = (seatClass) => {
        const basePrice = flightDetails?.price;
        if (!basePrice) return "Loading...";
        
        switch (seatClass) {
            case "ECONOMY":
                return basePrice.toFixed(2);
            case "BUSINESS":
                return (basePrice * 1.6).toFixed(2);
            case "FIRST":
                return (basePrice * 3.5).toFixed(2);
            default:
                return "N/A";
        }
    };

    return (
        <div className="page-container"> {/* Gray background */}
            <div className="seat-selection-wrapper"> {/* White container */}
                {/* Wings */}
                <div className="left-wing"></div>
                <div className="right-wing"></div>
                {/* Header */}
                <div className="seat-selection-header">
                    <h2>SELECT SEATS</h2>
                    {flightDetails ? (
                        <p className="flight-info">
                            {flightDetails.departure}&nbsp;&nbsp;&nbsp; ✈ &nbsp;&nbsp;&nbsp;{flightDetails.destination}
                        </p>
                    ) : (
                        <p>Loading flight details...</p>
                    )}
                </div>
                <div className="seat-selection-container">
                    {/* Passenger List on the Left */}
                    <div className="passenger-list">
                        <h3>Passengers</h3>
                        {passengers.map((passenger, index) => {
                            const seatNumber = assignedSeats[passenger.passengerName] || "Not Assigned";
                            const seatClass = getSeatClass(seatNumber);

                            return (
                                <div
                                    key={index}
                                    className={`passenger ${selectedPassenger === passenger.passengerName ? "active" : ""}`}
                                    onClick={() => setSelectedPassenger(passenger.passengerName)}
                                >
                                    <p>{passenger.passengerName} ({passenger.passportNumber})</p>
                                    <p>Seat: {seatNumber} ({formatSeatClass(seatClass)})</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="seat-map-container">
                        {/* Overlay divs to cover the top and bottom */}
                        <div className="seat-map-overlay top"></div>

                        {/* Seat Layout */}
                        <div className="seat-map">
                            {processedSeatLayout.map((row) => {
                                const columnEntries = Object.entries(row.columns);

                                return (
                                    <div key={row.rowNumber} className={`seat-row ${Object.values(row.columns).some(column => column.some(seat => seat.isExtraLegroom)) ? "extra-legroom" : ""}`}>
                                        {columnEntries.map(([columnIndex, column], index) => (
                                            <React.Fragment key={index}>
                                                {/* Seat Column */}
                                                <div className={`seat-column column-${column.length}`}>
                                                    {column.map((seat, seatIndex) => {
                                                        const seatKey = `${row.rowNumber}${seat.seatPosition}`;
                                                        const isSelected = Object.values(assignedSeats).includes(seatKey);
                                                        const assignedPassenger = Object.keys(assignedSeats).find(
                                                            (p) => assignedSeats[p] === seatKey
                                                        );

                                                        return (
                                                            <div
                                                                key={seatIndex}
                                                                className={`seat ${seat.isAvailable ? "available" : "taken"} ${isSelected ? "selected" : ""}`}
                                                                onClick={() => seat.isAvailable && handleSeatClick(row.rowNumber, seat.seatPosition)}
                                                            >
                                                                {assignedPassenger ? getInitials(assignedPassenger) : ""}
                                                                {seat.isAvailable && (
                                                                    <div className="seat-tooltip">
                                                                        <span className="seat-tooltip-title">
                                                                            {row.rowNumber}{seat.seatPosition}
                                                                        </span>
                                                                        <br />
                                                                        {seat.seatClass} Class ${getSeatPrice(seat.seatClass)}
                                                                        <br />
                                                                        {seat.isExtraLegroom && (<>Extra Legroom</>)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Insert Aisle Row Number Between Columns */}
                                                {index < columnEntries.length - 1 && (
                                                    <div className="aisle-row-number">{row.rowNumber}</div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Overlay div to cover the bottom */}
                        <div className="seat-map-overlay bottom"></div>
                    </div>
                </div>

                {/* Buttons at the bottom */}
                <div className="booking-actions">
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                    <button className="finalize-button" onClick={finalizeBooking}>
                        <span className="IconContainer">
                            <svg viewBox="0 0 13 13" width="18px">
                            <path
                                fill="white"
                                d="M1.55989957,5.41666667 L5.51582215,5.41666667 L4.47015462,0.108333333 L4.47015462,0.108333333 C4.47015462,0.0634601974 4.49708054,0.0249592654 4.5354546,0.00851337035 L4.57707145,0 L5.36229752,0 C5.43359776,0 5.50087375,0.028779451 5.55026392,0.0782711996 L5.59317877,0.134368264 L7.13659662,2.81558333 L8.29565964,2.81666667 C8.53185377,2.81666667 8.72332694,3.01067661 8.72332694,3.25 C8.72332694,3.48932339 8.53185377,3.68333333 8.29565964,3.68333333 L7.63589819,3.68225 L8.63450135,5.41666667 L11.9308317,5.41666667 C12.5213171,5.41666667 13,5.90169152 13,6.5 C13,7.09830848 12.5213171,7.58333333 11.9308317,7.58333333 L8.63450135,7.58333333 L7.63589819,9.31666667 L8.29565964,9.31666667 C8.53185377,9.31666667 8.72332694,9.51067661 8.72332694,9.75 C8.72332694,9.98932339 8.53185377,10.1833333 8.29565964,10.1833333 L7.13659662,10.1833333 L5.59317877,12.8656317 C5.55725264,12.9280353 5.49882018,12.9724157 5.43174295,12.9907056 L5.36229752,13 L4.57707145,13 L4.55610333,12.9978962 C4.51267695,12.9890959 4.48069792,12.9547924 4.47230803,12.9134397 L4.47223088,12.8704208 L5.51582215,7.58333333 L1.55989957,7.58333333 L0.891288881,8.55114605 C0.853775374,8.60544678 0.798421006,8.64327676 0.73629202,8.65879796 L0.672314689,8.66666667 L0.106844414,8.66666667 L0.0715243949,8.66058466 L0.0715243949,8.66058466 C0.0297243066,8.6457608 0.00275502199,8.60729104 0,8.5651586 L0.00593007386,8.52254537 L0.580855011,6.85813984 C0.64492547,6.67265611 0.6577034,6.47392717 0.619193545,6.28316421 L0.580694768,6.14191703 L0.00601851064,4.48064746 C0.00203480725,4.4691314 0,4.45701613 0,4.44481314 C0,4.39994001 0.0269259152,4.36143908 0.0652999725,4.34499318 L0.106916826,4.33647981 L0.672546853,4.33647981 C0.737865848,4.33647981 0.80011301,4.36066329 0.848265401,4.40322477 L0.89131128,4.45169723 L1.55989957,5.41666667 Z"
                            ></path>
                            </svg>
                        </span>
                        <p className="text">Book Flight</p>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SeatSelection;

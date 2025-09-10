import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function OtpPage() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp } = useAuth();
    const [timer, setTimer] = useState(0);
    const [isExpired, setIsExpired] = useState(false);
    
    // Get email from navigation state (passed from login page)
    const email = location.state?.email;

    // If no email, redirect back to login
    React.useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    // Get OTP status from server to calculate remaining time
    React.useEffect(() => {
        if (!email) return;
        
        const fetchOtpStatus = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
                const response = await fetch(`${API_URL}/api/otp-status`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ email }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((data.expires - now) / 1000));
                    
                    console.log('OTP Debug from server:', { 
                        serverExpires: data.expires, 
                        now, 
                        remaining,
                        isExpired: data.isExpired 
                    });
                    
                    setTimer(remaining);
                    setIsExpired(remaining === 0 || data.isExpired);
                } else {
                    // If no OTP found, redirect back to login
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching OTP status:', error);
                // On error, redirect back to login
                navigate('/login');
            }
        };

        fetchOtpStatus();
    }, [email, navigate]);

    useEffect(() => {
        if (timer === 0) {
            setIsExpired(true);
            return;
        }
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleVerify = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!email) return;
        
        if (isExpired) {
            setError("OTP has expired. Please request a new code.");
            return;
        }
        
        setError("");
        setLoading(true);
        
        try {
            const success = await verifyOtp(email, otp);
            if (success) {
                navigate("/", { replace: true });
            } else {
                setError("Invalid OTP. Please try again.");
            }
        } catch (error: any) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        
        setLoading(true);
        setError("");
        
        try {
            // Call resend OTP API
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const response = await fetch(`${API_URL}/api/resend-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                const data = await response.json();
                const now = Date.now();
                const remaining = Math.max(0, Math.floor((data.expires - now) / 1000));
                
                console.log('Resend OTP - New expires from server:', { 
                    serverExpires: data.expires, 
                    now, 
                    remaining 
                });
                
                // Reset timer and expired state with server timestamp
                setTimer(remaining);
                setIsExpired(false);
                setOtp("");
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to resend OTP");
            }
            
        } catch (error) {
            setError("Failed to resend OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 flex-col">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800">
                    OTP Verification
                </h1>
                <p className="text-center text-gray-500 text-sm mt-2">
                    Enter the 6-digit code we sent to your email
                </p>
                <p className={`text-center text-sm mt-2 ${
                    isExpired ? "text-red-500 font-semibold" : "text-orange-500"
                }`}>
                    {isExpired ? "OTP has expired" : `Your OTP will expire in ${formatTime(timer)}`}
                </p>

                {/* Error Label */}
                {error && (
                    <p className="text-center text-red-600 text-sm mt-2 font-semibold">
                        {error}
                    </p>
                )}

                {/* OTP Input */}
                <div className="mt-6">
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-center text-2xl tracking-[1rem] border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        placeholder="••••••"
                    />
                </div>

                {/* Verify button */}
                <button
                    onClick={handleVerify}
                    disabled={loading || otp.length !== 6}
                    className="w-full mt-6 bg-green-700 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* Resend link */}
                <p className="text-center text-gray-500 text-sm mt-4">
                    Didn’t receive the code?{" "}
                    <button 
                        onClick={handleResend}
                        disabled={loading || (!isExpired && timer > 240)}
                        className="text-pink-600 hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? "Sending..." : "Resend"}
                    </button>
                </p>
            </div>
            <div className="text-center mt-6 sm:mt-8">
                <p className="text-green-700 font-semibold text-sm sm:text-base">
                    PharmaC
                </p>
            </div>
        </div>
    );
}

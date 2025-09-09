import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function OtpPage() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp } = useAuth();
    
    // Get email from navigation state (passed from login page)
    const email = location.state?.email;

    // If no email, redirect back to login
    React.useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleVerify = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!email) return;
        
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 flex-col">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800">
                    OTP Verification
                </h1>
                <p className="text-center text-gray-500 text-sm mt-2">
                    Enter the 6-digit code we sent to your email
                </p>
                <p className="text-center text-orange-500 text-sm mt-2">
                    Your OTP will expire in 5 minutes
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
                    <button className="text-pink-600 hover:underline font-medium">
                        Resend
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

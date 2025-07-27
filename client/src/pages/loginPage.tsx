import { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import medicineImage from "../assets/medicine.png"; // Adjust the path as necessary

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password, rememberMe });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col lg:flex-row">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#FAF9F8] flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-8 lg:py-0"  style={{ fontFamily: "'Assistant', sans-serif" }}>
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Welcome to
              <br />
              PharmaC
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm px-2">
              Revolutionizing pharmacy management with intelligent automation
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-4 sm:space-y-6">
            <div className=" bg-[#FAF9F8] rounded-lg p-4 sm:p-6 border border-gray-300 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
                Login
              </h2>

              {/* Email Input */}
              <div className="relative mb-4">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative mb-4">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    Remember Me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-xs sm:text-sm text-green-600 hover:text-green-700"
                >
                  Forget Password
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-green-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-green-700 font-semibold text-sm sm:text-base">
              PharmaC
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Promotional Content */}
      <div className="w-full lg:w-1/2 bg-[#D6CCC2] flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-8 lg:py-0 relative overflow-hidden min-h-64 lg:min-h-screen">
        {/* Main Content */}
        <div className="text-center z-10">
          <h2 className="font-tenor text-2xl sm:text-3xl lg:text-4xl  text-gray-800 mb-4 px-4" style={{ fontFamily: '"Tenor Sans", sans-serif' }}>
            Streamlined Operations,
            <br />
             One Login Away
           
          </h2>
        </div>
 
        <div className="relative mt-16 sm:mt-50 z-10">
          <div className="flex items-center justify-center">
            <img
              src={medicineImage}
              alt="Medicine"
              className="w-80 sm:w-80 h-auto "
            />
          </div>
        </div>
      </div>
    </div>
  );
}

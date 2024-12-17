import React from "react";
import { useNavigate, useRouteLoaderData } from "react-router-dom";

function Dashboard() {
  const { role } =
    useRouteLoaderData("Applicant-Root")?.data ||
    useRouteLoaderData("Validator-Root")?.data;

  const navigate = useNavigate();

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section
        className="relative w-full h-[91vh] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url('https://source.unsplash.com/1600x900/?technology,research')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-red-700 via-red-600 to-red-800 opacity-80"></div>
        <div className="text-center px-4 sm:px-6 md:px-8 relative z-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-wide drop-shadow-lg">
            Empowering Research Students with Financial Support
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 drop-shadow-md">
            Transforming ideas into reality by providing opportunities to
            advance knowledge and research with ease.
          </p>
         {role === "Applicant" && <button
            onClick={() => navigate("../form")}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-white text-red-700 font-semibold text-sm sm:text-base md:text-lg rounded-full shadow-lg hover:bg-red-100 hover:scale-110 transition-all transform"
          >
            NEW APPLICATION
          </button>}
        </div>
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2">
          <a
            href="#features"
            className="text-white text-lg sm:text-xl lg:text-2xl animate-bounce"
          >
            &#8595; Scroll Down
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-16 bg-gradient-to-b from-white via-gray-100 to-red-50"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-red-700 mb-8 sm:mb-12">
          Our Key Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
          {/* Feature 1 */}
          <div className="flex flex-col items-center bg-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2 hover:scale-105">
            <div className="text-4xl sm:text-5xl mb-4 text-red-700">🔍</div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-red-700">
              View Your Applications
            </h3>
            <p className="text-center text-sm sm:text-base md:text-lg mb-6 text-gray-700">
              Manage your applications, track their status, and see detailed
              feedback for rejections.
            </p>
            <button onClick={() => navigate("../dashboard/pending")} className="px-4 sm:px-6 py-2 bg-red-700 text-white font-semibold text-sm sm:text-base rounded-full hover:bg-red-600 transition-transform transform hover:scale-110 shadow-md">
              View Status
            </button>
          </div>
          {/* Feature 2 */}
          <div className="flex flex-col items-center bg-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2 hover:scale-105">
            <div className="text-4xl sm:text-5xl mb-4 text-red-700">📊</div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-red-700">
              View Insights
            </h3>
            <p className="text-center text-sm sm:text-base md:text-lg mb-6 text-gray-700">
              Analyze and gain insights about research funding and related data.
            </p>
            <button className="px-4 sm:px-6 py-2 bg-red-700 text-white font-semibold text-sm sm:text-base rounded-full hover:bg-red-600 transition-transform transform hover:scale-110 shadow-md">
              View Insights
            </button>
          </div>
          {/* Feature 3 */}
          <div className="flex flex-col items-center bg-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2 hover:scale-105">
            <div className="text-4xl sm:text-5xl mb-4 text-red-700">📚</div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-red-700">
              Understand the Policy
            </h3>
            <p className="text-center text-sm sm:text-base md:text-lg mb-6 text-gray-700">
              Learn about the eligibility, funding process, and guidelines for
              financial assistance.
            </p>
            <button className="px-4 sm:px-6 py-2 bg-red-700 text-white font-semibold text-sm sm:text-base rounded-full hover:bg-red-600 transition-transform transform hover:scale-110 shadow-md">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-red-700 py-1 sm:py-3 text-white text-center">
        <p className="text-xs sm:text-sm md:text-base">
          © {new Date().getFullYear()} Research Support. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;

import React, { useEffect, useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Root = () => {
  const { user, role } = useLoaderData().data;
  const [sidebarIsVisible, setSidebarIsVisible] = useState(true)

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setSidebarIsVisible(false); // Hide sidebar on small screens
    } else {
      setSidebarIsVisible(true); // Show sidebar on larger screens
    }
  };

  useEffect(() => {
    // Set initial visibility based on screen width
    handleResize();

    // Add event listener to handle resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <Navbar userData={user} role={role} setSidebarIsVisible={setSidebarIsVisible} sidebarIsVisible={sidebarIsVisible} />
      <div className= "flex h-full bg-gray-100 overflow-auto">
        {sidebarIsVisible && <Sidebar role={role} />}
        <div className="w-full h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Root;

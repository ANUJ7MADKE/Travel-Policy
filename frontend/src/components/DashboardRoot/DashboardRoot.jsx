import { React } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';


const studentIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 mr-1"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const DashboardRoot = ({ role }) => {
  // DATA
  const userData = useLoaderData().data.user;
  console.log(useLoaderData());
  const userDesignation = userData.designation || "Student";

  

  return (
    <>
      <Navbar role={ role }/>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar role={role} />
        <Outlet />
      </div>
    </>
  )
  
};

export default DashboardRoot;

export async function applicantLoader() {
  try {
    const res = await fetch(`http://localhost:3000/applicant/root`, {
      method: 'GET',
      credentials: 'include',  // Important to include cookies
    });
    
    if (res.status === 401) {
      throw new Response(JSON.stringify({message: 'Unauthorized access'}), {status: res.status});
    }

    if (!res.ok) {
      throw new Response(`Error: ${res.status} - ${res.statusText}`, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const data = await res.json();
    return { data } ;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function validatorLoader() {
  try {
    const res = await fetch(`http://localhost:3000/validator/root`, {
      method: 'GET',
      credentials: 'include',  // Important to include cookies
    });
    
    if (res.status === 401) {
      throw new Response(JSON.stringify({message: 'Unauthorized access'}), {status: res.status});
    }

    if (!res.ok) {
      throw new Response(`Error: ${res.status} - ${res.statusText}`, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const data = await res.json();
    return { data };
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
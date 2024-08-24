import React from 'react'
import { useRouteLoaderData, useParams, useNavigate } from 'react-router-dom';
import ApplicationTable from './components/ApplicationTable';
  
const Dashboard = ({ role }) => {
  const navigate = useNavigate()
  console.log(useRouteLoaderData(`${role}-Root`).data)
  const { applications } = useRouteLoaderData(`${role}-Root`).data

  const { status } = useParams();

  const getApplicationsByStatus = (status) => {
    const appData = applications[status.toUpperCase()];
    return appData.length > 0 ? (
      <ApplicationTable 
        title={`${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()} Applications`} 
        applications={appData} 
      />
    ) : (
      <p className="text-gray-600">No {status.toLowerCase()} applications found.</p>
    );
  };
  

  const renderContent = () => {
    if (status) {
      return getApplicationsByStatus(status);
    }
  
    return (
      <>
        {Object.keys(applications).map((statusKey) => {
          const appData = applications[statusKey];
          return appData.length > 0 ? (
            <ApplicationTable 
              key={statusKey} 
              title={`${statusKey.charAt(0).toUpperCase() + statusKey.slice(1).toLowerCase()} Applications`} 
              applications={appData}
            />
          ) : null;
        })}
      </>
    );
  };
  

  return (

    <main className="flex-1 p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-gray-200 p-4 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{status ? `${status.toUpperCase()} APPLICATIONS` : "DASHBOARD"}</h1>
            {role === "Applicant" && (
              <button onClick={()=>navigate("../form")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 inline-block mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-sm">Create New Application</span>
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-6">
            Easily track the details and statuses of all your submitted applications in one place.
          </p>
        </div>
        {renderContent()}
      </div>
    </main>
  
  
    
  );
};

export default Dashboard;

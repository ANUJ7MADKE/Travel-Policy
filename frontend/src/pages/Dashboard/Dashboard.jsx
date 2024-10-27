import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSubmit } from 'react-router-dom';
import ApplicationTable from './components/ApplicationTable';
import Modal from '../../components/Modal/Modal';
import ApplicationDisplay from '../ApplicationDisplay/ApplicationDisplay';
import Pagination from '../../components/Pagination';
import axios from 'axios';

const Dashboard = ({ role }) => {
  const navigate = useNavigate();
  const submit = useSubmit();

  const [numOfApplications, setNumOfApplications] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationDisplay, setApplicationDisplay] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { status } = useParams();

  // Effect to reset currentPage when status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  // Fetch applications based on status and pagination
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const skip = (currentPage - 1) * itemsPerPage;
        const res = await axios.get(`http://localhost:3000/general/get${status.charAt(0).toUpperCase() + status.slice(1)}Applications?take=${itemsPerPage}&&skip=${skip}`, {
          withCredentials: true,
        });
        setNumOfApplications(res.data.totalApplications);
        setApplications(res.data.applications);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [status, currentPage]);

  // Fetch full application data on row click
  const getFullApplication = async (applicationId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/general/getApplicationData/${applicationId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch application data: ${response.status} ${response.statusText}`);
      }

      const fullApplication = await response.json();
      setApplicationDisplay({ ...fullApplication, currentStatus });
    } catch (error) {
      console.error('Error fetching application data:', error);
    }
  };

  const handleRowClick = (application) => {
    getFullApplication(application.applicationId, application.currentStatus);
  };

  const closeModal = () => {
    setApplicationDisplay(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSubmit = (applicationId, action) => {
    const formData = new FormData();
    formData.append('applicationId', applicationId);
    formData.append('action', action);

    // Use the submit function to send a PUT request with the form data
    submit(formData, { method: "POST" });
  };

  const renderContent = () => {
    return applications.length > 0 ? (
      <ApplicationTable
        title={`${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()} Applications`}
        applications={applications}
        onRowClick={handleRowClick}
      />
    ) : (
      <p className="text-gray-600">No {status.toLowerCase()} applications found.</p>
    );
  };

  // Show loading or error state
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="flex-1 p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-20">
        <div className="bg-gray-200 p-4 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{status ? `${status.toUpperCase()} APPLICATIONS` : "DASHBOARD"}</h1>
            {role === "Applicant" && (
              <button onClick={() => navigate("../form")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
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

        {/* Render Application Table */}
        {renderContent()}

        {/* Pagination Component */}
        <Pagination
          numOfItems={numOfApplications}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        {/* Modal for Application Details */}
        {applicationDisplay && (
          <Modal onClose={closeModal} title={applicationDisplay.formData.eventName}>
            <ApplicationDisplay applicationId={applicationDisplay.applicationId} formData={applicationDisplay.formData} />
            <div className="flex justify-between mt-4">
              {(role === "Validator" && applicationDisplay.currentStatus === "Pending") &&
                <div className="flex space-x-4">
                  <button onClick={() => handleSubmit(applicationDisplay.applicationId, "accepted")} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Accept
                  </button>
                  <button onClick={() => handleSubmit(applicationDisplay.applicationId, "rejected")} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Reject
                  </button>
                </div>
              }
              <button onClick={closeModal} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Close
              </button>
            </div>
          </Modal>
        )}
      </div>
    </main>
  );
};

export default Dashboard;

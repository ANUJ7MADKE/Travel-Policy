import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSubmit, useRouteLoaderData } from 'react-router-dom';
import ApplicationTable from '../Applications/components/ApplicationTable';
import Modal from '../../components/Modal/Modal';
import ApplicationDisplay from '../ApplicationView/FormDisplay';
import Pagination from '../../components/Pagination';
import axios from 'axios';
import ApplicationView from '../ApplicationView/ApplicationView';
import ApplicationsStatusDescription from './components/ApplicationsStatusDescription';

const Applications = () => {

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

  const renderTable = () => {
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

        {/*Applications Status Description Box*/}
        <ApplicationsStatusDescription />

        {/* Render Application Table */}
        {renderTable()}

        {/* Pagination Component */}
        <Pagination
          numOfItems={numOfApplications}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        {/* Modal for Application Details */}
        {applicationDisplay && <ApplicationView applicationDisplay={applicationDisplay} closeModal={closeModal}/>}
      </div>
    </main>
  );
};

export default Applications;

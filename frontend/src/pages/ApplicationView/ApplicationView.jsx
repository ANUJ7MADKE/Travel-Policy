import React, { useEffect, useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
  useRouteLoaderData,
  useSubmit,
} from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import ValidationStatus from "./ValidationStatus";
import Form from "../ApplicationForm/Form";
import FormDisplay from "./FormDisplay";

function ApplicationView() {
  const { role } =
    useRouteLoaderData("Applicant-Root")?.data ||
    useRouteLoaderData("Validator-Root")?.data;
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleSubmit = (applicationId, action) => {
    const formData = new FormData();
    formData.append("applicationId", applicationId);
    formData.append("action", action);

    // Use the submit function to send a PUT request with the form data
    submit(formData, { method: "POST" });
  };

  const [applicationDisplay, setApplicationDisplay] = useState(null);

  const applicationId = useParams().applicationId;
  const statusParam = useParams().status;

  const getFullApplication = async (applicationId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_API_URL
        }/general/getApplicationData/${applicationId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok)
        throw new Error(
          `Failed to fetch application data: ${response.status} ${response.statusText}`
        );
      const fullApplication = await response.json();
      setApplicationDisplay(fullApplication);
    } catch (error) {
      console.error("Error fetching application data:", error);
    }
  };
  let currentStatus = applicationDisplay?.currentStatus?.toLowerCase();
  useEffect(() => {
    getFullApplication(applicationId);
  }, [applicationId]);

  if (
    statusParam !== currentStatus ||
    applicationId !== applicationDisplay?.applicationId
  ) {
    const location = window.location.pathname;
    const newPath = location.split("/").slice(0, -2).join("/");
    navigate(
      `${newPath}/${currentStatus}/${applicationDisplay?.applicationId}`
    );
  }

  let title = applicationDisplay?.formData?.eventName;

  return (
    <div className="min-w-min bg-white shadow rounded-lg p-4 m-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">{title}</h1>

      <ValidationStatus
        validations={{
          fdccoordinatorValidation:
            applicationDisplay?.fdccoordinatorValidation,
          supervisorValidation: applicationDisplay?.supervisorValidation,
          hodValidation: applicationDisplay?.hodValidation,
          hoiValidation: applicationDisplay?.hoiValidation,
        }}
      />

      <FormDisplay
        applicantDesignation={applicationDisplay?.applicant?.designation}
        formData={applicationDisplay?.formData}
      />

      <div className="flex justify-between items-center mt-6 gap-2">
        {role === "Validator" && currentStatus === "pending" && (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() =>
                handleSubmit(applicationDisplay?.applicationId, "accepted")
              }
              className="bg-green-500 text-white font-semibold text-sm sm:text-sm md:text-lg px-4 py-2 rounded-md hover:bg-green-600 focus:outline-double transition duration-200 hover:scale-110 hover:animate-spin"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() =>
                handleSubmit(applicationDisplay?.applicationId, "rejected")
              }
              className="bg-red-500 text-white font-semibold text-sm sm:text-sm md:text-lg px-4 py-2 rounded-md hover:bg-red-600 focus:outline-double transition duration-200 hover:scale-110 hover:animate-spin"
            >
              Reject
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white font-semibold text-sm sm:text-sm md:text-lg px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-double transition duration-200 hover:scale-110"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ApplicationView;

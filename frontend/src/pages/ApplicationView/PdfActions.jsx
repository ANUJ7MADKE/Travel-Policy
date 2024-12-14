// PdfActions.js
import React, { useState } from "react";
import axios from "axios";
import Modal from "../../components/Modal/Modal.jsx";
import PdfViewer from "../../components/PdfViewer.jsx";

function PdfActions({ fileName, applicationId }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFileBlob = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_URL
        }/general/getFile/${applicationId}/${fileName}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      if (response.data.type !== "application/pdf") {
        throw new Error("Invalid file format received.");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setFileUrl(url);

      return () => URL.revokeObjectURL(url); // Clean up URL when component unmounts
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  const handleView = async () => {
    if (!fileUrl) await fetchFileBlob(); // Only fetch if fileUrl is not set
    setIsModalOpen(true);
  };

  const handleDownload = async () => {
    if (!fileUrl) await fetchFileBlob(); // Only fetch if fileUrl is not set

    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", `${fileName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center md:justify-between">
      <button
        type="button"
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
        onClick={handleView}
      >
        View PDF
      </button>

      <button
        type="button"
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
        onClick={handleDownload}
      >
        Download PDF
      </button>

      {/* Modal to view PDF */}
      {isModalOpen && fileUrl && (
        <PdfViewer fileUrl={fileUrl} setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}

export default PdfActions;
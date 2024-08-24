import React from 'react';

const ApplicationTable = ({ title, applications}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-4 text-gray-700">Topic</th>
            <th className="border-b p-4 text-gray-700">Name</th>
            <th className="border-b p-4 text-gray-700">Submitted</th>
            <th className="border-b p-4 text-gray-700">Branch</th>
            <th className="border-b p-4 text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => (
            <tr key={index} onClick={()=>{/*Display The Form*/}} className="odd:bg-gray-50 even:bg-white" style={{ height: '50px' }}>
              <td className="p-4">{app.formData.eventName}</td>
              <td className="p-4">{app.formData.applicantFullName}</td>
              <td className="p-4">{formatDateToDDMMYYYY(app.createdAt)}</td>
              <td className="p-4">{app.formData.applicantDepartment}</td>
              <td className="p-4 text-green-500">{title.split(" ")[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};
export default ApplicationTable;




function formatDateToDDMMYYYY(dateString) {
  // Convert the ISO string to a Date object
  const date = new Date(dateString);

  // Extract the day, month, and year
  const day = String(date.getDate()).padStart(2, '0'); // Ensures two-digit format
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
  const year = date.getFullYear();

  // Format the date as dd/mm/yyyy
  return `${day}/${month}/${year}`;
}
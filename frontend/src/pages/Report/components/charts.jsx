import React, { useState } from "react";
import ChartWithDropdown from "./approved";
import Cards from "./cards";
import "./cards.css";
import BasicTable from "./Table";
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Table from "./Table";

// Register chart components for all three types (Line, Bar, Pie)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Charts({ reportData }) {
  const { data, query } = reportData;
  
  if (data.length === 0) {
    return <div className="text-center text-xl text-red-700 py-10">No Data Found</div>;
  }

  const tableData = [];
  const groupedData = {};
  if (data) {
    for (const item of data) {
      const { institute, department, formData } = item;
      const { totalExpense, purposeOfTravel } = formData;

      if (!groupedData[institute]) {
        groupedData[institute] = {};
      }

      if (query.institute) {
        if (!groupedData[institute][department]) {
          groupedData[institute][department] = {
            totalExpense: 0,
            purposeOfTravel: purposeOfTravel || "Not Provided",
            applications: 0,
          };
        }

        // Aggregate the data
        groupedData[institute][department].totalExpense +=
          parseFloat(totalExpense); // Summing the expenses
        groupedData[institute][department].applications += 1;
      } else {
        if (!groupedData[institute].applications) {
          groupedData[institute] = {
            totalExpense: 0,
            purposeOfTravel: purposeOfTravel || "Not Provided",
            applications: 0,
          };
        }

        // Aggregate the data
        groupedData[institute].totalExpense += parseFloat(totalExpense); // Summing the expenses
        groupedData[institute].applications += 1;
      }
    }
  }

  // Step 2: Transform grouped data into desired table format
  if (query.institute) {
    for (const institute in groupedData) {
      for (const department in groupedData[institute]) {
        const departmentData = groupedData[institute][department];

        tableData.push({
          id: tableData.length + 1,
          Stream: department,
          Scholarship: departmentData.applications, // Assuming each application is one scholarship
          Purpose_of_Travel: departmentData.purposeOfTravel,
          Funds: departmentData.totalExpense.toFixed(2), // Formatting funds to 2 decimal places
        });
      }
    }
  } else {
    for (const institute in groupedData) {
      const instituteData = groupedData[institute];

      tableData.push({
        id: tableData.length + 1,
        Stream: institute,
        Scholarship: instituteData.applications, // Assuming each application is one scholarship
        Purpose_of_Travel: instituteData.purposeOfTravel,
        Funds: instituteData.totalExpense.toFixed(2), // Formatting funds to 2 decimal places
      });
    }
  }
  
  // Line Chart Data and Options
  const lineOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Number of Applications Over the Years ",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Applications",
        },
        ticks: {
          beginAtZero: true,
        },
      },
    },
  };

  const lineData = {
    labels: [2020, 2021, 2022, 2023, 2024],
    datasets: [
      {
        label: "Applications",
        data: [1200, 1500, 1800, 2200, 2500], // Updated data for number of applications
        borderColor: "rgb(75, 192, 192)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Bar Chart Data and Options
  const barOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Number of Applications Over the Years ",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Applications",
        },
        ticks: {
          beginAtZero: true,
        },
      },
    },
  };

  const barData = {
    labels: [2020, 2021, 2022, 2023, 2024],
    datasets: [
      {
        label: "Applications",
        data: [1200, 1500, 1800, 2200, 200], // Updated data for number of applications
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
    ],
  };

  // Pie Chart Data and Options
  const pieOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Purpose of Travel",
      },
    },
  };

  const pieData = {
    labels: ["Academic", "Research", "Personal", "Other"],
    datasets: [
      {
        data: [1200, 1500, 1800, 2200], // Updated data for number of applications
        backgroundColor: [
          "rgba(75, 192, 192, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgb(75, 192, 192)",
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Approved and Rejected Applications Over the Years",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Applications",
        },
        ticks: {
          beginAtZero: true,
        },
      },
    },
  };
  const [selectedOption, setSelectedOption] = useState("approved");
  const chartDataOptions = {
    labels: [2020, 2021, 2022, 2023, 2024], // Years
    datasets: [
      {
        label: "Approved Applications",
        data: [800, 1100, 1300, 1600, 180], // Data for approved applications
        backgroundColor: "rgba(54, 162, 235, 0.5)", // Blue color
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
      },
      {
        label: "Rejected Applications",
        data: [400, 400, 500, 600, 20], // Data for rejected applications
        backgroundColor: "rgba(255, 99, 132, 0.5)", // Red color
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl mb-6">Travel Policy Report</h1>

      {/* Container for all three charts */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
        {/* Bar Chart */}
        <div className="w-full">
          <Bar options={barOptions} data={barData} />
        </div>

        {/* Pie Chart */}
        <div className="w-full">
          <Pie options={pieOptions} data={pieData} />
        </div>
      </div>
      <div className="cards">
        <Cards />

        <div className="generalInfo">
          <div className="card2">
            <ChartWithDropdown />
          </div>
        </div>
      </div>
      <div className="Table">
        <Table tableData={tableData} />
      </div>
      {/* Line Chart */}
      {/* <div className="w-full">
        <Line options={lineOptions} data={lineData} />
      </div> */}
    </div>
  );
}

export default Charts;

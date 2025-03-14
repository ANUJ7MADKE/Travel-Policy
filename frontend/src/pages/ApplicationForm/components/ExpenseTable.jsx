import React from "react";
import { useTable } from "react-table";
import axios from "axios";
import {
  MdDangerous,
  MdDeleteOutline,
  MdEdit,
  MdVerified
} from "react-icons/md";
import PdfActions from "../../ApplicationView/PdfActions";
import { useParams, useRouteLoaderData } from "react-router-dom";

const ExpenseTable = ({
  expenses,
  setPdfIsVisible,
  setFileUrl,
  deleteExpense,
  editExpense,
  disabled,
}) => {
  const applicationId = useParams().applicationId;
  const { role } =
    useRouteLoaderData("Applicant-Root")?.data ||
    useRouteLoaderData("Validator-Root")?.data;

  const handleExpenseAction = async (expense, action) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/validator/expenseAction`,
        { expense, action, applicationId },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error performing expense action:", error);
    }
  };

  const columns = React.useMemo(() => {
    // Common columns
    const baseColumns = [
      {
        Header: "Expense Category",
        accessor: "expenseCategory",
      },
      {
        Header: "Expense Name",
        accessor: "expenseName",
      },
      {
        Header: "Amount",
        accessor: "expenseAmount",
        Cell: ({ value }) => `₹${value}`,
      },
      {
        Header: "Expense Proof",
        accessor: "expenseProof",
        Cell: ({ value, row }) => {
          if (applicationId) {
            return (
              <div className="max-w-72 m-auto">
                <PdfActions
                  fileName={"expenseProof" + row.id}
                  applicationId={applicationId}
                />
              </div>
            );
          } else if (value && value.name) {
            return (
              <button
                type="button"
                onClick={() => {
                  setPdfIsVisible(true);
                  setFileUrl(URL.createObjectURL(value));
                }}
                className="text-blue-600 hover:text-blue-700 focus:outline-none"
              >
                View Document
              </button>
            );
          }
          return "No Document";
        },
      },
    ];

    // Add the "Delete" column only if 'disabled' is false
    if (!disabled) {
      baseColumns.push({
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          row?.original?.proofStatus != "verified" ?(
          <div className="flex justify-center space-x-7">
            <div className="text-center">
              <button
                type="button"
                onClick={() => deleteExpense(row.original)}
                className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors focus:outline-none"
              >
                <MdDeleteOutline />
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => editExpense(row.original)}
                className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none"
              >
                <MdEdit />
              </button>
            </div>
          </div>) : <h1 className="text-green-600">Approved</h1>
        ),
      });
    }

    if (role === "Validator") {
      baseColumns.push({
        Header: "Approval",
        accessor: "approval",
        Cell: ({ row }) => (
          <div className="flex justify-center space-x-7">
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleExpenseAction(row.original, "verified")}
                className="bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors focus:outline-none"
              >
                <MdVerified />
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleExpenseAction(row.original, "rejected")}
                className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors focus:outline-none"
              >
                <MdDangerous />
              </button>
            </div>
          </div>
        ),
      });
    }

    return baseColumns;
  }, [deleteExpense, setPdfIsVisible, setFileUrl, disabled]);

  // Using the useTable hook to create the table instance
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: expenses || [], // Data passed to the table
    });

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Expense Breakdown
      </h2>

      {/* Wrapping the table inside a scrollable div for responsiveness */}
      <div className="overflow-x-auto">
        <table
          {...getTableProps()}
          className="min-w-full bg-white border border-gray-300 table-auto"
        >
          {/* Table header */}
          <thead className="bg-gray-100 sticky top-0 z-10">
            {headerGroups.map((headerGroup) => {
              const { key, ...restHeaderProps } =
                headerGroup.getHeaderGroupProps(); // Destructure `key` here
              return (
                <tr key={key} {...restHeaderProps}>
                  {headerGroup.headers.map((column) => {
                    const { key, ...restColumnProps } = column.getHeaderProps(); // Destructure `key` here
                    return (
                      <th
                        key={column.id} // Explicitly add key for th
                        {...restColumnProps}
                        className="px-3 py-2 text-center text-sm font-bold text-gray-600 border-b border-gray-300"
                      >
                        {column.render("Header")}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>

          {/* Table body */}
          <tbody {...getTableBodyProps()} className="text-sm text-gray-700">
            {rows.map((row) => {
              prepareRow(row);
              const { key, ...restRowProps } = row.getRowProps(); // Destructure `key` here
              return (
                <tr key={key} {...restRowProps} className="hover:bg-gray-50">
                  {row.cells.map((cell) => {
                    const { key, ...restCellProps } = cell.getCellProps(); // Destructure `key` here
                    return (
                      <td
                        key={cell.column.id} // Explicitly add key for td
                        {...restCellProps}
                        className="px-3 py-2 border-t border-b border-gray-300"
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;

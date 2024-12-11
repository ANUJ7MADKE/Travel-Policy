import React from "react";
import { useTable } from "react-table";
import { MdDeleteOutline } from "react-icons/md";
import PdfViewer from "../../../components/PdfViewer";  

const ExpenseTable = ({ expenses, setPdfIsVisible, setFileUrl, deleteExpense }) => {
  const columns = React.useMemo(
    () => [
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
        Cell: ({ value }) => {
          if (value && value.name) {
            return (
              <button
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
      {
        Header: "Delete",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="text-center">
            <button
              onClick={() => deleteExpense(row.original)} 
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors focus:outline-none"
            >
              <MdDeleteOutline />
            </button>
          </div>
        ),
      },
    ],
    [deleteExpense, setPdfIsVisible, setFileUrl]
  );

  // Using the useTable hook to create the table instance
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: expenses || [], // Data passed to the table
  });

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
  
      {/* Wrapping the table inside a scrollable div for responsiveness */}
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full bg-white border border-gray-300 table-auto">
          {/* Table header */}
          <thead className="bg-gray-100 sticky top-0 z-10">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps()}
                    className="px-4 py-2 text-center text-sm font-bold text-gray-600 border-b border-gray-300"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
  
          {/* Table body */}
          <tbody {...getTableBodyProps()} className="text-sm text-gray-700">
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-50">
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      className="px-4 py-2 border-t border-b border-gray-300"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
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

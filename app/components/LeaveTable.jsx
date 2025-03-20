import React from "react";
import { formatDate } from "../utils";

function LeaveTable({ leaves, isAdmin, onApprove, onReject }) {
  return (
    <div className="bg-white shadow-md rounded my-6">
      <h2 className="block text-gray-700 text-lg font-bold mb-3 px-8 pt-6">
        Your last leaves
      </h2>
      <table className="min-w-max w-full table-auto">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Date From</th>
            <th className="py-3 px-6 text-left">Date To</th>
            <th className="py-3 px-6 text-left">Type</th>
            <th className="py-3 px-6 text-left">State</th>
            <th className="py-3 px-6 text-left">Leave Days</th>
            <th className="py-3 px-6 text-left">Status</th>
            {isAdmin && <th className="py-3 px-6 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {leaves.map((leave, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                {formatDate(leave.start_date)}
              </td>
              <td className="py-3 px-6 text-left whitespace-nowrap">
                {formatDate(leave.end_date)}
              </td>
              <td className="py-3 px-6 text-left">Annual Leave</td>
              <td className="py-3 px-6 text-left">
                <span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">
                  {leave.status}
                </span>
              </td>
              <td className="py-3 px-6 text-left">
                {/* Calculate leave days here */}
                {getLeaveDays(leave.start_date, leave.end_date)}
              </td>
              <td className="py-3 px-6 text-left">
                <div className="flex items-center">
                  <span>{leave.status}</span>
                </div>
              </td>
              {isAdmin && (
                <td className="py-3 px-6 text-left">
                  {leave.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onApprove(leave.id)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(leave.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getLeaveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  const days = diff / (1000 * 60 * 60 * 24) + 1;
  return days;
}

export default LeaveTable;

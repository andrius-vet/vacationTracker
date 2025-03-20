import React, { useState } from "react";
import supabase from "../../supabaseClient";
import { formatDate } from "../utils";

function LeaveForm({ onLeaveSubmit }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("annual"); // Default to annual leave
  const [status, setStatus] = useState("pending"); // Default status

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      alert(`Session error: ${sessionError.message}`);
      return;
    }

    console.log("Session data:", session); // Debug log session

    if (!session?.session?.user?.id) {
      console.error("User ID not found in session");
      alert("User ID not found in session. Please log in again.");
      return;
    }

    const userId = session.session.user.id;
    console.log("User ID:", userId); // Debug log userId


    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("End date must be after start date.");
      return;
    }


    const leaveDays = getLeaveDays(startDate, endDate);


    const newLeave = {
      user_id: userId,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      type: leaveType,
      status: status,
      leave_days: leaveDays,
    };

    console.log("New leave object:", newLeave); // Debug log newLeave

    try {
      const { data, error } = await supabase
        .from("vacation_requests")
        .insert([newLeave])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        alert(`Failed to submit leave request: ${error.message}`);
      } else {
        console.log("Leave request submitted successfully:", data);
        alert("Leave request submitted successfully!");
        if (onLeaveSubmit) {
          onLeaveSubmit(); // Notify parent component to refresh leaves
        }
        // Reset form fields
        setStartDate("");
        setEndDate("");
        setLeaveType("annual");
        setStatus("pending");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert(`Unexpected error: ${error.message}`);
    }
  };

  const getLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = diff / (1000 * 60 * 60 * 24) + 1;
    return days;
  };


  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="block text-gray-700 text-lg font-bold mb-3">
        Request Vacation
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="startDate"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="endDate"
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="leaveType"
          >
            Leave Type
          </label>
          <select
            id="leaveType"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Request Leave
          </button>
        </div>
      </form>
    </div>
  );
}

export default LeaveForm;

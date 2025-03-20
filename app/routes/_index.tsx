import type { MetaFunction } from "@remix-run/node";
import LeaveForm from "../components/LeaveForm";
import LeaveTable from "../components/LeaveTable";
import TotalDays from "../components/TotalDays";
import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";
import { useNavigate } from "@remix-run/react"; // Import useNavigate

export const meta: MetaFunction = () => {
  return [
    { title: "Vacation Manager" },
    { name: "description", content: "Manage your vacations easily" },
  ];
};

export default function Index() {
  const [leaves, setLeaves] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        // Fetch user role from Supabase (assuming you have a 'profiles' table)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          alert(`Error fetching profile: ${profileError.message}`);
        } else {
          setIsAdmin(profile?.role === 'admin');
        }
      } else {
        navigate("/auth"); // Use navigate for redirection
      }
    };

    checkAuth();
  }, [navigate]); // Add navigate to the dependency array

  useEffect(() => {
    if (userId) {
      fetchLeaves(userId, isAdmin);
    }
  }, [userId, isAdmin]);

  const fetchLeaves = async (userId, isAdmin) => {
    try {
      let query = supabase
        .from("vacation_requests")
        .select("*");

      if (!isAdmin) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leaves:", error);
        alert(`Error fetching leaves: ${error.message}`);
      } else {
        setLeaves(data || []);
        console.log("Fetched leaves:", data);
      }
    } catch (error) {
      console.error("Unexpected error fetching leaves:", error);
      alert(`Unexpected error fetching leaves: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      alert(`Logout error: ${error.message}`);
    } else {
      navigate("/auth"); // Redirect to auth page after logout
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      const { error } = await supabase
        .from("vacation_requests")
        .update({ status: 'approved' })
        .eq('id', leaveId);

      if (error) {
        console.error("Error approving leave:", error);
        alert(`Error approving leave: ${error.message}`);
      } else {
        fetchLeaves(userId, isAdmin); // Refresh leaves
      }
    } catch (error) {
      console.error("Unexpected error approving leave:", error);
      alert(`Unexpected error approving leave: ${error.message}`);
    }
  };

  const handleReject = async (leaveId) => {
    try {
      const { error } = await supabase
        .from("vacation_requests")
        .update({ status: 'rejected' })
        .eq('id', leaveId);

      if (error) {
        console.error("Error rejecting leave:", error);
        alert(`Error rejecting leave: ${error.message}`);
      } else {
        fetchLeaves(userId, isAdmin); // Refresh leaves
      }
    } catch (error) {
      console.error("Unexpected error rejecting leave:", error);
      alert(`Unexpected error rejecting leave: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Overview</h1>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={handleLogout}
      >
        Logout
      </button>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <LeaveForm onLeaveSubmit={() => fetchLeaves(userId, isAdmin)} />
        </div>
        <div>
          <TotalDays days="16.12" />
        </div>
      </div>
      <LeaveTable leaves={leaves} isAdmin={isAdmin} onApprove={handleApprove} onReject={handleReject} />
    </div>
  );
}

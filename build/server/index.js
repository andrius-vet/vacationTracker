import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useNavigate } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
const supabaseUrl = "https://etiaigvjbvqaffjiwucd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0aWFpZ3ZqYnZxYWZmaml3dWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzkyMjgsImV4cCI6MjA1ODA1NTIyOH0.sQqcSCoM0RDdeFwPECzQFNDNhfphvUc00-f3hCA4aUs";
const supabase = createClient(supabaseUrl, supabaseKey);
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
function LeaveForm({ onLeaveSubmit }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("annual");
  const [status, setStatus] = useState("pending");
  const handleSubmit = async (event) => {
    var _a, _b;
    event.preventDefault();
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      alert(`Session error: ${sessionError.message}`);
      return;
    }
    console.log("Session data:", session);
    if (!((_b = (_a = session == null ? void 0 : session.session) == null ? void 0 : _a.user) == null ? void 0 : _b.id)) {
      console.error("User ID not found in session");
      alert("User ID not found in session. Please log in again.");
      return;
    }
    const userId = session.session.user.id;
    console.log("User ID:", userId);
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
    const leaveDays = getLeaveDays2(startDate, endDate);
    const newLeave = {
      user_id: userId,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      type: leaveType,
      status,
      leave_days: leaveDays
    };
    console.log("New leave object:", newLeave);
    try {
      const { data, error } = await supabase.from("vacation_requests").insert([newLeave]).select();
      if (error) {
        console.error("Supabase error:", error);
        alert(`Failed to submit leave request: ${error.message}`);
      } else {
        console.log("Leave request submitted successfully:", data);
        alert("Leave request submitted successfully!");
        if (onLeaveSubmit) {
          onLeaveSubmit();
        }
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
  const getLeaveDays2 = (startDate2, endDate2) => {
    const start = new Date(startDate2);
    const end = new Date(endDate2);
    const diff = end.getTime() - start.getTime();
    const days = diff / (1e3 * 60 * 60 * 24) + 1;
    return days;
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "block text-gray-700 text-lg font-bold mb-3", children: "Request Vacation" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            className: "block text-gray-700 text-sm font-bold mb-2",
            htmlFor: "startDate",
            children: "Start Date"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            id: "startDate",
            value: startDate,
            onChange: (e) => setStartDate(e.target.value),
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            className: "block text-gray-700 text-sm font-bold mb-2",
            htmlFor: "endDate",
            children: "End Date"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            id: "endDate",
            value: endDate,
            onChange: (e) => setEndDate(e.target.value),
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            className: "block text-gray-700 text-sm font-bold mb-2",
            htmlFor: "leaveType",
            children: "Leave Type"
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "leaveType",
            value: leaveType,
            onChange: (e) => setLeaveType(e.target.value),
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            children: [
              /* @__PURE__ */ jsx("option", { value: "annual", children: "Annual Leave" }),
              /* @__PURE__ */ jsx("option", { value: "sick", children: "Sick Leave" }),
              /* @__PURE__ */ jsx("option", { value: "other", children: "Other" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
          type: "submit",
          children: "Request Leave"
        }
      ) })
    ] })
  ] });
}
function LeaveTable({ leaves, isAdmin, onApprove, onReject }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-md rounded my-6", children: [
    /* @__PURE__ */ jsx("h2", { className: "block text-gray-700 text-lg font-bold mb-3 px-8 pt-6", children: "Your last leaves" }),
    /* @__PURE__ */ jsxs("table", { className: "min-w-max w-full table-auto", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-200 text-gray-600 uppercase text-sm leading-normal", children: [
        /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-left", children: "Date From" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-left", children: "Date To" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-left", children: "Type" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-left", children: "State" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-left", children: "Leave Days" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-left", children: "Status" }),
        isAdmin && /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "text-gray-600 text-sm font-light", children: leaves.map((leave, index) => /* @__PURE__ */ jsxs(
        "tr",
        {
          className: "border-b border-gray-200 hover:bg-gray-100",
          children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-left whitespace-nowrap", children: formatDate(leave.start_date) }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-left whitespace-nowrap", children: formatDate(leave.end_date) }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-left", children: "Annual Leave" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-left", children: /* @__PURE__ */ jsx("span", { className: "bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs", children: leave.status }) }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-left", children: getLeaveDays(leave.start_date, leave.end_date) }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-left", children: /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsx("span", { children: leave.status }) }) }),
            isAdmin && /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-left", children: leave.status === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onApprove(leave.id),
                  className: "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2",
                  children: "Approve"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onReject(leave.id),
                  className: "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded",
                  children: "Reject"
                }
              )
            ] }) })
          ]
        },
        index
      )) })
    ] })
  ] });
}
function getLeaveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  const days = diff / (1e3 * 60 * 60 * 24) + 1;
  return days;
}
function TotalDays({ days }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "block text-gray-700 text-sm font-bold mb-2", children: "Total days left" }),
    /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-gray-800", children: days })
  ] });
}
const meta = () => {
  return [
    { title: "Vacation Manager" },
    { name: "description", content: "Manage your vacations easily" }
  ];
};
function Index() {
  const [leaves, setLeaves] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          alert(`Error fetching profile: ${profileError.message}`);
        } else {
          setIsAdmin((profile == null ? void 0 : profile.role) === "admin");
        }
      } else {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);
  useEffect(() => {
    if (userId) {
      fetchLeaves(userId, isAdmin);
    }
  }, [userId, isAdmin]);
  const fetchLeaves = async (userId2, isAdmin2) => {
    try {
      let query = supabase.from("vacation_requests").select("*");
      if (!isAdmin2) {
        query = query.eq("user_id", userId2);
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
      navigate("/auth");
    }
  };
  const handleApprove = async (leaveId) => {
    try {
      const { error } = await supabase.from("vacation_requests").update({ status: "approved" }).eq("id", leaveId);
      if (error) {
        console.error("Error approving leave:", error);
        alert(`Error approving leave: ${error.message}`);
      } else {
        fetchLeaves(userId, isAdmin);
      }
    } catch (error) {
      console.error("Unexpected error approving leave:", error);
      alert(`Unexpected error approving leave: ${error.message}`);
    }
  };
  const handleReject = async (leaveId) => {
    try {
      const { error } = await supabase.from("vacation_requests").update({ status: "rejected" }).eq("id", leaveId);
      if (error) {
        console.error("Error rejecting leave:", error);
        alert(`Error rejecting leave: ${error.message}`);
      } else {
        fetchLeaves(userId, isAdmin);
      }
    } catch (error) {
      console.error("Unexpected error rejecting leave:", error);
      alert(`Unexpected error rejecting leave: ${error.message}`);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto py-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Overview" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4",
        onClick: handleLogout,
        children: "Logout"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(LeaveForm, { onLeaveSubmit: () => fetchLeaves(userId, isAdmin) }) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(TotalDays, { days: "16.12" }) })
    ] }),
    /* @__PURE__ */ jsx(LeaveTable, { leaves, isAdmin, onApprove: handleApprove, onReject: handleReject })
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: error2 } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error2) {
        setError(error2.message);
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-10", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md p-6 bg-white rounded-md shadow-md", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800 text-center mb-6", children: "Login" }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4", role: "alert", children: [
      /* @__PURE__ */ jsx("strong", { className: "font-bold", children: "Error!" }),
      /* @__PURE__ */ jsxs("span", { className: "block sm:inline", children: [
        " ",
        error
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "email",
            className: "block text-gray-700 text-sm font-bold mb-2",
            children: "Email"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "email",
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            placeholder: "Email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "password",
            className: "block text-gray-700 text-sm font-bold mb-2",
            children: "Password"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            id: "password",
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            placeholder: "Password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
          type: "submit",
          disabled: loading,
          children: loading ? "Logging in..." : "Log In"
        }
      ) })
    ] })
  ] }) });
};
function AuthRoute() {
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(LoginForm, {}) });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AuthRoute
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-fMoePzH-.js", "imports": ["/assets/jsx-runtime-DSTfpXA4.js", "/assets/components-BYdXwDPx.js", "/assets/index-DvkXgWiQ.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DgfDXuXd.js", "imports": ["/assets/jsx-runtime-DSTfpXA4.js", "/assets/components-BYdXwDPx.js", "/assets/index-DvkXgWiQ.js"], "css": ["/assets/root-CUyo1gYg.css"] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-Dpk_FsqL.js", "imports": ["/assets/jsx-runtime-DSTfpXA4.js", "/assets/supabaseClient-D5N2WE3t.js", "/assets/index-DvkXgWiQ.js"], "css": [] }, "routes/auth": { "id": "routes/auth", "parentId": "root", "path": "auth", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth-COSDk82J.js", "imports": ["/assets/jsx-runtime-DSTfpXA4.js", "/assets/supabaseClient-D5N2WE3t.js"], "css": [] } }, "url": "/assets/manifest-dd0b23bc.js", "version": "dd0b23bc" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/auth": {
    id: "routes/auth",
    parentId: "root",
    path: "auth",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};

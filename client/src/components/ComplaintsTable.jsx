import { useEffect, useState } from "react";
import RejectModel from "./RejectModel";
import AcceptModal from "./common/AcceptModal";
import API from "../api/axios";

function ComplaintsTable({ district, mandal, department }) {
  const [complaints, setComplaints] = useState([]);
  const [showReject, setShowReject] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewComplaint, setViewComplaint] = useState(null);

  // ✅ image popup state
  const [showImagePopup, setShowImagePopup] = useState(false);

  const fetchComplaints = async () => {
    try {
      let query = `/officer/complaints?district=${district}&mandal=${mandal}`;
      if (department) query += `&department=${department}`;
      const res = await API.get(query);
      setComplaints(res.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [district, mandal, department]);

  useEffect(() => {
    if (viewComplaint || showAccept || showReject || showImagePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [viewComplaint, showAccept, showReject, showImagePopup]);

  const updateStatus = async (id, status, extraData = null) => {
    try {
      const payload = { status };
      if (status === "Rejected") payload.reason = extraData;
      if (status === "Accepted") payload.assignedWorker = extraData;

      await API.put(`/officer/complaints/${id}/status`, payload);

      setShowReject(false);
      setShowAccept(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch {
      alert("Status update failed.");
    }
  };

  const deleteComplaint = async (id) => {
    if (window.confirm("Permanently delete this report?")) {
      await API.delete(`/officer/complaints/${id}`);
      fetchComplaints();
    }
  };

  return (
    <>
      {/* ================= TABLE ================= */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white">
              <tr>
                <th className="ps-4 py-3 small fw-bold text-uppercase">Village</th>
                <th className="py-3 small fw-bold text-uppercase">Grievance Summary</th>
                <th className="py-3 small fw-bold text-uppercase text-center">Status</th>
                <th className="text-center py-3 pe-4 small fw-bold text-uppercase">Manage</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted fw-bold">
                    NO ACTIVE RECORDS FOUND
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id}>
                    <td className="ps-4 fw-bold text-primary pointer" onClick={() => setViewComplaint(c)}>
                      {c.village}
                    </td>
                    <td className="pointer" onClick={() => setViewComplaint(c)} style={{ maxWidth: 320 }}>
                      <div className="text-truncate fw-semibold">{c.description}</div>
                      <small className="text-muted">ID: {c._id.substring(0, 8)}</small>
                    </td>
                    <td className="text-center pointer" onClick={() => setViewComplaint(c)}>
                      <span className={`status-pill ${c.status.toLowerCase()}`}>{c.status}</span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex justify-content-center gap-2">
                        {c.status === "Pending" && (
                          <>
                            <button
                              className="btn btn-sm btn-success rounded-pill fw-bold"
                              onClick={() => { setSelectedComplaint(c); setShowAccept(true); }}
                            >
                              APPROVE
                            </button>
                            <button
                              className="btn btn-sm btn-danger rounded-pill fw-bold"
                              onClick={() => { setSelectedComplaint(c); setShowReject(true); }}
                            >
                              REJECT
                            </button>
                          </>
                        )}
                        {c.status === "Accepted" && (
                          <button
                            className="btn btn-sm btn-primary rounded-pill fw-bold"
                            onClick={() => updateStatus(c._id, "Completed")}
                          >
                            MARK RESOLVED
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-circle border-0"
                          onClick={() => deleteComplaint(c._id)}
                        >
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAccept && (
        <AcceptModal
          onSubmit={(workerData) =>
            updateStatus(selectedComplaint._id, "Accepted", workerData)
          }
          onClose={() => setShowAccept(false)}
        />
      )}

      {showReject && (
        <RejectModel
          onSubmit={(reason) =>
            updateStatus(selectedComplaint._id, "Rejected", reason)
          }
          onClose={() => setShowReject(false)}
        />
      )}

      {/* ================= ADMIN MODAL ================= */}
      {viewComplaint && (
        <div
          className="admin-modal-overlay"
          onClick={() => { setViewComplaint(null); setShowImagePopup(false); }}
        >
          <div
            className="admin-modal-box animate-scale-up"
            style={{ maxWidth: "900px", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="admin-modal-header">
              <h5 className="fw-bold m-0 text-uppercase">
                Case File: {viewComplaint._id.toUpperCase()}
              </h5>
              <button
                className="btn-close btn-close-white"
                onClick={() => { setViewComplaint(null); setShowImagePopup(false); }}
              />
            </div>

            {/* BODY */}
            <div className="admin-modal-body p-4">
              <div className="row g-4">

                {/* LEFT: IMAGE */}
                <div className="col-md-5">
                  <label className="text-muted fw-bold d-block mb-2">
                    EVIDENCE ORIGINAL
                  </label>

                  {viewComplaint.imageUrl ? (
                    <img
                      src={viewComplaint.imageUrl}
                      alt="Evidence"
                      className="img-fluid rounded-3 border shadow-sm w-100"
                      style={{ objectFit: "contain", cursor: "zoom-in" }}
                      onClick={() => setShowImagePopup(true)}
                    />
                  ) : (
                    <div className="bg-light border rounded-3 p-4 text-center">
                      No Evidence Provided
                    </div>
                  )}
                </div>

                {/* RIGHT: DETAILS */}
                <div className="col-md-7">
                  <label className="text-muted fw-bold d-block mb-2">
                    CURRENT STATUS
                  </label>

                  <div className="d-flex gap-2 flex-wrap">
                    <span className={`status-pill ${viewComplaint.status.toLowerCase()} px-4 py-2`}>
                      {viewComplaint.status}
                    </span>

                    {viewComplaint.userFeedback?.resolutionStatus === "SOLVED" && (
                      <span className="bg-success px-3 py-2 text-white rounded-4">
                        User Feedback : Problem Solved
                      </span>
                    )}

                    {viewComplaint.userFeedback?.resolutionStatus === "NO_ACTION" && (
                      <span className="bg-danger px-3 py-2 text-white rounded-4">
                        User Feedback : Still No Action
                      </span>
                    )}
                  </div>

                  {/* LOCATION */}
                  <div className="mt-4 p-3 bg-light rounded-3 border">
                    <label className="text-muted fw-bold">
                      LOCATION & JURISDICTION
                    </label>
                    <p className="fw-bold mb-0 text-primary">
                      {viewComplaint.village}, {viewComplaint.mandal}
                    </p>
                    <small className="text-muted">
                      {viewComplaint.district} District
                    </small>
                  </div>

                  {/* AI ANALYSIS */}
                  {viewComplaint.aiAnalysis && (
                    <div className="mt-4 p-3 bg-warning bg-opacity-10 rounded-3 border-start border-4 border-warning">
                      <label className="text-warning fw-bold">
                        AI ANALYSIS
                      </label>
                      <p className="fw-bold mb-2">
                        Department:
                        <span className="ms-2 text-dark">
                          {viewComplaint.aiAnalysis.department || "Not Identified"}
                        </span>
                      </p>
                      <p className="fw-bold mb-0">
                        Urgency Level:
                        <span className="ms-2 badge bg-info text-dark">
                          {viewComplaint.aiAnalysis.urgency || "LOW"}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* ASSIGNED WORKER */}
                  {viewComplaint.status === "Accepted" && viewComplaint.assignedWorker && (
                    <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-3 border-start border-4 border-success">
                      <label className="text-success fw-bold">
                        ASSIGNED FIELD WORKER
                      </label>
                      <p className="fw-bold m-0">
                        {viewComplaint.assignedWorker.name}
                      </p>
                      <p className="small m-0 text-muted">
                        {viewComplaint.assignedWorker.dept} | {viewComplaint.assignedWorker.phone}
                      </p>
                    </div>
                  )}
                </div>

                {/* CITIZEN DESCRIPTION */}
                <div className="col-12">
                  <div className="p-3 bg-primary bg-opacity-10 rounded-3 border-start border-4 border-primary">
                    <label className="text-primary fw-bold">
                      CITIZEN DESCRIPTION
                    </label>
                    <p className="fw-semibold text-dark mt-2 mb-0">
                      {viewComplaint.aiAnalysis?.reason}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="admin-modal-footer text-end">
              <button
                className="btn btn-secondary rounded-pill px-5 fw-bold"
                onClick={() => { setViewComplaint(null); setShowImagePopup(false); }}
              >
                Close Ledger
              </button>
            </div>

            {/* IMAGE POPUP */}
            {showImagePopup && viewComplaint.imageUrl && (
              <div
                className="modal-overlay"
                style={{ zIndex: 3000 }}
                onClick={() => setShowImagePopup(false)}
              >
                <div
                  className="bg-white rounded-4 shadow-lg p-3"
                  style={{ maxWidth: "90vw", maxHeight: "90vh", position: "relative" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn-close position-absolute"
                    style={{ top: 10, right: 10 }}
                    onClick={() => setShowImagePopup(false)}
                  />
                  <img
                    src={viewComplaint.imageUrl}
                    alt="Large Evidence"
                    className="img-fluid rounded-3"
                    style={{ maxHeight: "80vh", objectFit: "contain" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ComplaintsTable;

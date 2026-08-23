import React, { useEffect, useState } from "react";
import "../../styles/Detailpopup.css";
import axios from "axios";

function DetailPopup({ item, onClose }) {
  if (!item) return null;

  const [userResponse, setUserResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ NEW: image fullscreen state
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    if (item.userFeedback?.resolutionStatus) {
      setUserResponse(item.userFeedback.resolutionStatus);
    }
  }, [item]);

  const canShowFeedback =
    item.status === "Accepted" || item.status === "Completed";

  const isFeedbackGiven =
    userResponse === "SOLVED" || userResponse === "NO_ACTION";

  async function handleFeedbackSubmit(type) {
    if (submitting || isFeedbackGiven) return;

    try {
      setSubmitting(true);
      await axios.put(
        `http://localhost:5000/api/complaints/update-user-feedback/${item._id}`,
        { resolutionStatus: type }
      );
      setUserResponse(type);
    } catch (err) {
      alert("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box bg-white rounded-4 shadow-lg"
        style={{ maxWidth: "900px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="p-4 bg-dark text-white d-flex rounded-4 justify-content-between">
          <div>
            <h5 className="fw-bold m-0">Official Grievance Report</h5>
            <small className="text-white">
              Tracking ID: {item._id}
            </small>
          </div>
          <button className="btn-close btn-close-white" onClick={onClose} />
        </div>

        {/* ================= BODY ================= */}
        <div className="p-4">
          <div className="row g-4">
            {/* ---------- LEFT: IMAGE + FIELD WORKER ---------- */}
            <div className="col-md-5">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt="Evidence"
                  className="img-fluid rounded-3 border w-100"
                  style={{ objectFit: "contain", cursor: "zoom-in" }}
                  onClick={() => setShowImagePreview(true)} // ✅ click to fullscreen
                />
              ) : (
                <div className="bg-light border rounded-3 p-4 text-center">
                  No Image Provided
                </div>
              )}

              {item.assignedWorker && (
                <div className="mt-3 p-3 bg-success bg-opacity-10 rounded-3 border-start border-4 border-success">
                  <small className="text-success fw-bold">
                    ASSIGNED FIELD WORKER
                  </small>

                  <p className="fw-bold mb-1">
                    {item.assignedWorker.name}
                  </p>

                  {item.assignedWorker.department && (
                    <small className="text-muted d-block">
                      {item.assignedWorker.department}
                    </small>
                  )}

                  {item.assignedWorker.phone && (
                    <small className="text-muted d-block">
                      📞 {item.assignedWorker.phone}
                    </small>
                  )}
                </div>
              )}
            </div>

            {/* ---------- RIGHT: DETAILS ---------- */}
            <div className="col-md-7 d-flex flex-column gap-3">
              <div>
                <span className={`status-pill ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>

                {userResponse && (
                  <span className="badge bg-success ms-2">
                    User Feedback: {userResponse}
                  </span>
                )}
              </div>

              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted fw-bold">LOCATION</small>
                <p className="fw-bold mb-0">
                  {item.village}, {item.mandal}
                </p>
                <small className="text-muted">
                  {item.district} District
                </small>
              </div>

              {item.aiAnalysis && (
                <div className="p-3 bg-warning bg-opacity-10 rounded-3 border-start border-4 border-warning">
                  <small className="text-warning fw-bold">
                    AI ANALYSIS
                  </small>

                  <p className="mb-1">
                    <strong>Department:</strong>{" "}
                    {item.aiAnalysis.department || "N/A"}
                  </p>

                  <p className="mb-0">
                    <strong>Urgency:</strong>{" "}
                    <span className="badge bg-info text-dark">
                      {item.aiAnalysis.urgency || "LOW"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ================= BOTTOM ================= */}
          <div className="mt-4">
            <div className="p-3 bg-primary bg-opacity-10 rounded-3 border-start border-4 border-primary mb-3">
              <small className="text-primary fw-bold">
                CITIZEN DESCRIPTION
              </small>
              <p className="mb-0 mt-2">{item.description}</p>
            </div>

            {item.aiAnalysis?.reason && (
              <div className="p-3 bg-warning bg-opacity-10 rounded-3 border-start border-4 border-warning mb-3">
                <small className="text-warning fw-bold">
                  AI DESCRIPTION
                </small>
                <p className="mb-0 mt-2">
                  {item.aiAnalysis.reason}
                </p>
              </div>
            )}

            {canShowFeedback && (
              <div>
                {!isFeedbackGiven && (
                  <div className="d-flex gap-2">
                    <button
                      id="feedback-solved"
                      className="btn btn-success rounded-pill px-4"
                      disabled={submitting}
                      onClick={() => handleFeedbackSubmit("SOLVED")}
                    >
                      Problem Solved
                    </button>

                    <button
                      id="feedback-no-action"
                      className="btn btn-outline-danger rounded-pill px-4"
                      disabled={submitting}
                      onClick={() => handleFeedbackSubmit("NO_ACTION")}
                    >
                      Still No Action
                    </button>
                  </div>
                )}

                {userResponse && (
                  <div className="alert alert-info mt-3">
                    Feedback submitted:{" "}
                    <strong>{userResponse}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="p-3 bg-light border-top text-end">
          <button className="btn btn-dark px-4" onClick={onClose}>
            Close
          </button>
        </div>

        {/* ================= FULLSCREEN IMAGE OVERLAY ================= */}
        {showImagePreview && (
          <div
            className="modal-overlay"
            style={{ zIndex: 3000 }}
            onClick={() => setShowImagePreview(false)}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "95vw",
                maxHeight: "95vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn btn-danger position-absolute"
                style={{ top: 10, right: 10, zIndex: 3100 }}
                onClick={() => setShowImagePreview(false)}
              >
                ✕
              </button>

              <img
                src={item.imageUrl}
                alt="Full Evidence"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailPopup;

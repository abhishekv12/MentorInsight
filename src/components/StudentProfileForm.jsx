import React from "react";

const StudentProfileForm = ({ student, userData }) => {
  const profileData = userData?.profileData || null;

  const display = (val) =>
    val !== undefined && val !== null && val !== "" ? val : "—";

  // ✅ FIXED: Match exact field names from backend UserSchema.profileData
  // Backend stores: profilePhotoURL, resumeURL, contact1, contact2, birthDate,
  // bloodGroup, category, aadharNo, sscMarks, sscBoard, sscPercentage, sscYear,
  // hscMarks, hscBoard, hscPercentage, hscYear,
  // fatherName, fatherOccupation, fatherContact,
  // motherName, motherOccupation, motherContact,
  // hobbies: { singing, dance, games, sports, other }

  const photoUrl = profileData?.profilePhotoURL || null;
  const resumeUrl = profileData?.resumeURL || null;

  const displayHobby = (val) => {
    if (val === true || val === "true") return "Yes";
    if (val === false || val === "false" || val === null || val === undefined || val === "") return "—";
    return val; // for "other" string field
  };

  return (
    <div className="spf-wrapper">
      {/* Header Bar */}
      <div className="spf-header-bar">
        <div className="spf-header-left">
          <i className="fa-solid fa-id-card"></i>
          <div>
            <h2>Student Profile</h2>
            <p>Complete student information from the portal</p>
          </div>
        </div>
        <div className="spf-header-right">
          <span className="spf-roll-badge">
            Roll No: {student.rollNo || "—"}
          </span>
        </div>
      </div>

      {/* Incomplete Notice */}
      {!profileData && (
        <div className="spf-notice">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Profile Incomplete</strong>
            <p>
              This student has not yet filled in their portal profile. Basic
              enrollment data is shown below.
            </p>
          </div>
        </div>
      )}

      {/* ── PERSONAL INFORMATION ── */}
      <div className="spf-section-title spf-blue">
        <i className="fa-solid fa-user"></i> Personal Information
      </div>

      <div className="spf-card">
        {/* Photo Column */}
        <div className="spf-photo-col">
          {photoUrl ? (
            <img src={photoUrl} alt="Student" className="spf-photo" />
          ) : (
            <div className="spf-photo-placeholder">
              {student.name?.charAt(0) || "?"}
            </div>
          )}
          <span className="spf-photo-label">Student Photo</span>
        </div>

        {/* Details Table */}
        <div className="spf-details-col">
          <table className="spf-table">
            <tbody>
              <tr>
                <td className="spf-label">Full Name</td>
                <td className="spf-value">
                  {display(profileData?.name || student.name)}
                </td>
                <td className="spf-label">Address</td>
                {/* ✅ FIXED: was profileData?.address — matches schema */}
                <td className="spf-value">{display(profileData?.address)}</td>
              </tr>
              <tr>
                <td className="spf-label">Mobile</td>
                {/* ✅ FIXED: was profileData?.mobile → now contact1 */}
                <td className="spf-value">
                  {display(profileData?.contact1 || student.phone)}
                </td>
                <td className="spf-label">Alternate Mobile</td>
                {/* ✅ FIXED: was profileData?.alternateMobile → now contact2 */}
                <td className="spf-value">
                  {display(profileData?.contact2)}
                </td>
              </tr>
              <tr>
                <td className="spf-label">Email</td>
                <td className="spf-value">
                  {display(profileData?.email || student.email)}
                </td>
                <td className="spf-label">Date of Birth</td>
                {/* ✅ FIXED: was profileData?.dob → now birthDate */}
                <td className="spf-value">{display(profileData?.birthDate)}</td>
              </tr>
              <tr>
                <td className="spf-label">Blood Group</td>
                {/* ✅ bloodGroup — matches schema exactly */}
                <td className="spf-value">
                  {display(profileData?.bloodGroup)}
                </td>
                <td className="spf-label">Category</td>
                {/* ✅ category — matches schema exactly */}
                <td className="spf-value">{display(profileData?.category)}</td>
              </tr>
              <tr>
                <td className="spf-label">Aadhar No.</td>
                {/* ✅ FIXED: was profileData?.aadhar → now aadharNo */}
                <td className="spf-value">{display(profileData?.aadharNo)}</td>
                <td className="spf-label">Resume</td>
                <td className="spf-value">
                  {resumeUrl ? (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="spf-resume-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fa-solid fa-file-pdf"></i> View Resume
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ACADEMIC RECORD ── */}
      <div className="spf-section-title spf-pink">
        <i className="fa-solid fa-graduation-cap"></i> Academic Record
      </div>

      <div className="spf-card spf-card-full">
        <table className="spf-table spf-full-table">
          <thead>
            <tr>
              <th>Exam</th>
              <th>Total Marks</th>
              <th>Obtained Marks</th>
              <th>Board / University</th>
              <th>Percentage</th>
              <th>Year of Passing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="spf-label">SSC (10th)</td>
              {/* ✅ FIXED: was sscTotalMarks/sscObtainedMarks → now sscMarks (total) */}
              <td className="spf-value">
                {display(profileData?.sscMarks)}
              </td>
              <td className="spf-value">
                {/* Backend stores sscMarks as total/obtained — show same or "—" */}
                {display(null)}
              </td>
              {/* ✅ FIXED: was sscBoard → matches schema */}
              <td className="spf-value">{display(profileData?.sscBoard)}</td>
              {/* ✅ FIXED: was sscPercentage → matches schema */}
              <td className="spf-value">
                {profileData?.sscPercentage
                  ? `${profileData.sscPercentage}%`
                  : "—"}
              </td>
              {/* ✅ FIXED: was sscYear → matches schema */}
              <td className="spf-value">{display(profileData?.sscYear)}</td>
            </tr>
            <tr>
              <td className="spf-label">HSC (12th)</td>
              {/* ✅ FIXED: was hscTotalMarks/hscObtainedMarks → now hscMarks */}
              <td className="spf-value">
                {display(profileData?.hscMarks)}
              </td>
              <td className="spf-value">
                {display(null)}
              </td>
              {/* ✅ FIXED: was hscBoard → matches schema */}
              <td className="spf-value">{display(profileData?.hscBoard)}</td>
              {/* ✅ FIXED: was hscPercentage → matches schema */}
              <td className="spf-value">
                {profileData?.hscPercentage
                  ? `${profileData.hscPercentage}%`
                  : "—"}
              </td>
              {/* ✅ FIXED: was hscYear → matches schema */}
              <td className="spf-value">{display(profileData?.hscYear)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── PARENT DETAILS ── */}
      <div className="spf-section-title spf-purple">
        <i className="fa-solid fa-people-roof"></i> Parent Details
      </div>

      <div className="spf-card spf-card-full">
        <table className="spf-table spf-full-table">
          <tbody>
            <tr>
              {/* ✅ fatherName, fatherOccupation, fatherContact — all match schema */}
              <td className="spf-label">Father's Name</td>
              <td className="spf-value">
                {display(profileData?.fatherName)}
              </td>
              <td className="spf-label">Father's Occupation</td>
              <td className="spf-value">
                {display(profileData?.fatherOccupation)}
              </td>
              <td className="spf-label">Father's Contact</td>
              <td className="spf-value">
                {display(profileData?.fatherContact)}
              </td>
            </tr>
            <tr>
              {/* ✅ motherName, motherOccupation, motherContact — all match schema */}
              <td className="spf-label">Mother's Name</td>
              <td className="spf-value">
                {display(profileData?.motherName)}
              </td>
              <td className="spf-label">Mother's Occupation</td>
              <td className="spf-value">
                {display(profileData?.motherOccupation)}
              </td>
              <td className="spf-label">Mother's Contact</td>
              <td className="spf-value">
                {display(profileData?.motherContact)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── HOBBIES ── */}
      <div className="spf-section-title spf-green">
        <i className="fa-solid fa-star"></i> Hobbies &amp; Interests
      </div>

      <div className="spf-card spf-card-full">
        <table className="spf-table spf-full-table">
          <tbody>
            <tr>
              {/* ✅ FIXED: hobbies are nested under profileData.hobbies.* */}
              <td className="spf-label">Singing</td>
              <td className="spf-value">{displayHobby(profileData?.hobbies?.singing)}</td>
              <td className="spf-label">Dance</td>
              <td className="spf-value">{displayHobby(profileData?.hobbies?.dance)}</td>
              <td className="spf-label">Games</td>
              <td className="spf-value">{displayHobby(profileData?.hobbies?.games)}</td>
            </tr>
            <tr>
              <td className="spf-label">Sports</td>
              <td className="spf-value">{displayHobby(profileData?.hobbies?.sports)}</td>
              <td className="spf-label">Other</td>
              {/* ✅ FIXED: was profileData?.otherHobbies → now hobbies.other */}
              <td className="spf-value" colSpan={3}>
                {display(profileData?.hobbies?.other)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentProfileForm;


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mentor-insight.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mentorinsight.portal@gmail.com",
    pass: "qpzykucxoyxqgfbu",
  },
});

// ----------------------------------------------------
// 1. CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ----------------------------------------------------
// 2. SCHEMAS & MODELS
// ----------------------------------------------------

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: String,
  role: String,
  collegeName: String,
  batchName: String,
  mentorId: String,
  rollNo: String,
  mobile: String,
  department: String,
  profileData: {
    name: String,
    email: String,
    profilePhotoURL: String,
    resumeURL: String,
    address: String,
    contact1: String,
    contact2: String,
    birthDate: String,
    bloodGroup: String,
    category: String,
    aadharNo: String,
    sscMarks: String,
    sscBoard: String,
    sscPercentage: String,
    sscYear: String,
    hscMarks: String,
    hscBoard: String,
    hscPercentage: String,
    hscYear: String,
    fatherName: String,
    fatherOccupation: String,
    fatherContact: String,
    motherName: String,
    motherOccupation: String,
    motherContact: String,
    hobbies: {
      singing: { type: Boolean, default: false },
      dance: { type: Boolean, default: false },
      games: { type: Boolean, default: false },
      sports: { type: Boolean, default: false },
      other: String
    }
  },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", UserSchema);

const BatchSchema = new mongoose.Schema({
  name: { type: String },
  batchName: { type: String },
  academicYear: { type: String },
  course: { type: String },
  department: String,
  collegeName: { type: String, required: true },
  year: String,
  semester: String,
  mentorId: String,
  assignedMentor: { type: String, default: "Unassigned" },
  facultyUid: { type: String },
  facultyName: String,
  facultyEmail: String,
  studentCount: { type: Number, default: 0 },
  students: [
    {
      name: { type: String, required: true },
      rollNo: { type: String, required: true },
      enrollmentNo: { type: String },
      email: { type: String, default: "" },
      phone: { type: String },
      mobile: { type: String },
      division: { type: String },
      year: { type: String },
      status: { type: String, default: "Active" },
      attendance: { type: Number, default: 0 },
      assignments: { type: Number, default: 0 },
      attendanceByYear: {
        type: Map,
        of: {
          academicYear: String,
          year: String,
          batchName: String,
          months: [{
            month: String,
            percentage: Number
          }],
          averageAttendance: Number
        },
        default: {}
      },
      attendanceRecords: [{
        month: String,
        percentage: Number,
      }],
      promotedFrom: { type: String, default: null },
      semesters: [{
        semesterNumber: Number,
        semesterName: String,
        subjects: [{
          subjectName: String,
          avg: Number,
          semesterEnd: Number,
          practicalMarks: Number,
          theoryTotal: Number,
          practicalTotal: Number,
          theoryGrade: String,
          practicalGrade: String,
          theoryGP: Number,
          practicalGP: Number,
          theoryCP: Number,
          practicalCP: Number,
          theoryCG: Number,
          practicalCG: Number,
          totalCP: Number,
          totalCG: Number,
        }],
        totalCredits: Number,
        totalCG: Number,
        semesterSGPA: Number,
        semesterGrade: String,
        hasATKT: Boolean,
        atktCount: Number,
        status: String
      }],
      createdAt: { type: Date, default: Date.now },
    },
  ],
  promotedStudentIds: [{ type: String }],
  promotedFromBatchId: { type: String, default: null },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Batch = mongoose.model("Batch", BatchSchema);

const OrgSchema = new mongoose.Schema({
  collegeName: { type: String, required: true, unique: true },
  secretCode: { type: String, required: true },
  instituteCode: { type: String, required: true },
  adminEmail: { type: String, required: true },
  collegeType: { type: String },
});
const Organization = mongoose.model("Organization", OrgSchema);

// ✅ SESSION SCHEMA — single definition
const SessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  sessionDate: { type: Date, required: true },
  sessionTime: String,
  venue: String,
  sessionType: {
    type: String,
    enum: ['lecture', 'practical', 'tutorial', 'seminar', 'workshop', 'exam', 'other'],
    required: true
  },
  duration: Number,
  isImportant: { type: Boolean, default: false },
  targetBatchId: { type: String, required: true },
  targetBatchName: { type: String, required: true },
  targetDivision: String,
  facultyUid: { type: String, required: true },
  facultyName: String,
  facultyEmail: String,
  collegeName: String,
  createdAt: { type: Date, default: Date.now },
  sentToCount: { type: Number, default: 0 },

  // ✅ NEW: Student applications
  attendees: [{
    studentId: { type: String, required: true },
    rollNo: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    division: { type: String, default: "" },
    enrollmentNo: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now }
  }],

  // ✅ NEW: Max capacity (optional)
  maxCapacity: { type: Number, default: null },

  // ✅ NEW: Allow applications toggle
  acceptingApplications: { type: Boolean, default: true }
});
const Session = mongoose.model("Session", SessionSchema);


const BroadcastSchema = new mongoose.Schema({
  subject:         { type: String, required: true },
  body:            { type: String, required: true },
  priority:        { type: String, enum: ["normal","high","urgent","info"], default: "normal" },
  tag:             { type: String, default: "Announcement" },
  targetBatchId:   { type: String, required: true },
  targetBatchName: { type: String },
  targetDivision:  { type: String, default: "all" },
  facultyUid:      { type: String },
  sentBy:          { type: String },
  sentAt:          { type: Date, default: Date.now },
}, { timestamps: true });

const Broadcast = mongoose.model("Broadcast", BroadcastSchema);

const LearningResourceSchema = new mongoose.Schema({
  type:           { type: String, enum: ["video","image","link","note","file"], required: true },
  title:          { type: String, required: true },
  description:    { type: String, default: "" },
  url:            { type: String, default: "" },
  thumbnail:      { type: String, default: "" },
  tags:           [{ type: String }],
  isPinned:       { type: Boolean, default: false },
  views:          { type: Number, default: 0 },
  targetBatchId:  { type: String, required: true },
  targetBatchName:{ type: String },
  targetDivision: { type: String, default: "all" },
  facultyUid:     { type: String, required: true },
  sharedBy:       { type: String },
  facultyEmail:   { type: String },
}, { timestamps: true });

const LearningResource = mongoose.model("LearningResource", LearningResourceSchema);

const ReviewCampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  teacherId: String,
  teacherName: String,
  batchId: String,
  batchName: String,
  college: String,
  questions: [String],
  deadline: String,
  status: { type: String, default: "active" }, // "active" | "closed"
  responses: { type: Number, default: 0 },
}, { timestamps: true });
const ReviewCampaign = mongoose.model("ReviewCampaign", ReviewCampaignSchema);

const FacultyReviewSchema = new mongoose.Schema({
  campaignId: String,
  teacherId: String,
  teacherName: String,
  batchName: String,
  college: String,
  studentId: String,
  studentName: String,
  rollNo: String,
  overallRating: Number,
  questionRatings: Object,  // { "0": 4, "1": 5, ... }
  comment: String,
  anonymous: { type: Boolean, default: true },
}, { timestamps: true });
const FacultyReview = mongoose.model("FacultyReview", FacultyReviewSchema);

const TeacherSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  dept:     { type: String, default: "" },
  subjects: [{ type: String }],
  college:  { type: String, required: true },
}, { timestamps: true });
const Teacher = mongoose.model("Teacher", TeacherSchema);

// Add to College schema (find existing College schema and add these fields):
// assignedTeachers: [{ batchId: String, teacherIds: [String] }]

// ----------------------------------------------------
// 3. API ROUTES
// ----------------------------------------------------

// --- USER AUTHENTICATION (UPSERT) ---
app.post("/api/users", async (req, res) => {
  const { uid, email } = req.body;
  try {
    const existingByEmail = await User.findOne({ email: email });
    if (existingByEmail && existingByEmail.uid !== uid) {
      const user = await User.findOneAndUpdate(
        { email: email },
        { $set: { ...req.body, uid: uid } },
        { new: true }
      );
      return res.status(200).json(user);
    }
    const user = await User.findOneAndUpdate(
      { uid: uid },
      req.body,
      { new: true, upsert: true }
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/users/check-email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      res.json({
        exists:      true,
        uid:         user.uid,
        role:        user.role,
        name:        user.name,          // ← added
        collegeName: user.collegeName,
      });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:uid", async (req, res) => {
  try {
    let user = await User.findOne({ uid: req.params.uid });
    if (user) return res.json(user);
    res.json({
      uid: req.params.uid,
      mentorId: null,
      department: null,
      collegeName: null,
      role: null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;

    console.log('📝 Profile update request for UID:', uid);

    if (updateData.profileData?.profilePhotoURL) {
      const base64Size = updateData.profileData.profilePhotoURL.length;
      const sizeInMB = (base64Size * 3) / 4 / (1024 * 1024);
      if (sizeInMB > 5) {
        return res.status(400).json({ error: "Image size exceeds 5MB limit." });
      }
    }

    if (updateData.profileData?.resumeURL) {
      const base64Size = updateData.profileData.resumeURL.length;
      const sizeInMB = (base64Size * 3) / 4 / (1024 * 1024);
      if (sizeInMB > 10) {
        return res.status(400).json({ error: "Resume size exceeds 10MB limit." });
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid: uid },
      {
        $set: {
          'profileData.name': updateData.profileData?.name,
          'profileData.email': updateData.profileData?.email,
          'profileData.profilePhotoURL': updateData.profileData?.profilePhotoURL,
          'profileData.resumeURL': updateData.profileData?.resumeURL,
          'profileData.address': updateData.profileData?.address,
          'profileData.contact1': updateData.profileData?.contact1,
          'profileData.contact2': updateData.profileData?.contact2,
          'profileData.birthDate': updateData.profileData?.birthDate,
          'profileData.bloodGroup': updateData.profileData?.bloodGroup,
          'profileData.category': updateData.profileData?.category,
          'profileData.aadharNo': updateData.profileData?.aadharNo,
          'profileData.sscMarks': updateData.profileData?.sscMarks,
          'profileData.sscBoard': updateData.profileData?.sscBoard,
          'profileData.sscPercentage': updateData.profileData?.sscPercentage,
          'profileData.sscYear': updateData.profileData?.sscYear,
          'profileData.hscMarks': updateData.profileData?.hscMarks,
          'profileData.hscBoard': updateData.profileData?.hscBoard,
          'profileData.hscPercentage': updateData.profileData?.hscPercentage,
          'profileData.hscYear': updateData.profileData?.hscYear,
          'profileData.fatherName': updateData.profileData?.fatherName,
          'profileData.fatherOccupation': updateData.profileData?.fatherOccupation,
          'profileData.fatherContact': updateData.profileData?.fatherContact,
          'profileData.motherName': updateData.profileData?.motherName,
          'profileData.motherOccupation': updateData.profileData?.motherOccupation,
          'profileData.motherContact': updateData.profileData?.motherContact,
          'profileData.hobbies': updateData.profileData?.hobbies
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({
      error: "Failed to update profile.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// --- STUDENT VERIFICATION ROUTE ---
app.post("/api/student/verify-login", async (req, res) => {
  const { rollNo, mobile } = req.body;
  try {
    const batch = await Batch.findOne({
      students: { $elemMatch: { rollNo: rollNo, mobile: mobile } },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "No record found. Please ask your Faculty to add you to the roster.",
      });
    }

    const studentDetails = batch.students.find(
      (s) => s.rollNo === rollNo && s.mobile === mobile
    );

    res.json({
      success: true,
      data: {
        name:        studentDetails.name,
        rollNo:      studentDetails.rollNo,
        email:       studentDetails.email || "",   // ← KEY: return the faculty-entered email
        batchName:   batch.batchName || batch.name,
        mentorId:    batch.mentorId,
        collegeName: batch.collegeName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FACULTY DASHBOARD ROUTE (legacy) ---
app.get('/api/faculty/my-batch/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid: uid });

    if (!user) {
      return res.json({ hasBatch: false, reason: "User not found in DB" });
    }

    const dbName = user.name;
    const dbEmail = user.email;
    const searchConditions = [];

    if (dbName) {
      const nameRegex = new RegExp(`^${dbName}$`, 'i');
      searchConditions.push({ mentorId: { $regex: nameRegex } });
      searchConditions.push({ assignedMentor: { $regex: nameRegex } });
    }

    if (dbEmail) {
      const emailRegex = new RegExp(`^${dbEmail}$`, 'i');
      searchConditions.push({ mentorId: { $regex: emailRegex } });
      searchConditions.push({ assignedMentor: { $regex: emailRegex } });
    }

    const batch = await Batch.findOne({ $or: searchConditions });

    if (!batch) {
      return res.json({ hasBatch: false, reason: "No batch matches DB records" });
    }

    const isHOD = batch.mentorId && batch.mentorId.toLowerCase() === dbName.toLowerCase();

    res.json({
      hasBatch: true,
      batchName: batch.name,
      batchId: batch._id,
      students: batch.students,
      department: batch.department,
      role: isHOD ? "Head of Department" : "Faculty Mentor"
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/faculty/add-student", async (req, res) => {
  const { batchId, studentName, rollNo, mobile, enrollmentNo, email, division, year } = req.body;
  try {
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    const exists = batch.students.find((s) => s.rollNo === rollNo);
    if (exists) return res.status(400).json({ error: "Student with this Roll No already exists!" });

    batch.students.push({
      name: studentName,
      rollNo: rollNo,
      mobile: mobile,
      phone: mobile,
      enrollmentNo: enrollmentNo || '',
      email: email || '',
      division: division || 'A',
      year: year || batch.year || 'FY',
      status: "Active",
      attendance: Math.floor(Math.random() * 30) + 70,
      assignments: 0,
      attendanceByYear: {}
    });

    batch.studentCount = batch.students.length;
    batch.updatedAt = new Date();
    await batch.save();

    res.json({ message: "Student Added Successfully", student: batch.students[batch.students.length - 1] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// FACULTY DASHBOARD ROUTES
// ========================================

// 1. GET ALL BATCHES FOR A FACULTY
app.get("/api/faculty/batches/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const batches = await Batch.find({ facultyUid: uid }).sort({ createdAt: -1 });
    res.json({
      batches: batches.map(batch => ({
        id: batch._id,
        batchName: batch.batchName || batch.name,
        academicYear: batch.academicYear,
        course: batch.course || batch.department,
        year: batch.year,
        department: batch.department,
        status: batch.status,
        students: batch.students,
        promotedStudentIds: batch.promotedStudentIds || [],
        createdAt: batch.createdAt
      }))
    });
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE NEW BATCH/CLASS
app.post("/api/faculty/create-batch", async (req, res) => {
  try {
    const { batchName, academicYear, course, year, department, uid, facultyName, facultyEmail, collegeName } = req.body;

    if (!batchName || !academicYear || !course || !year || !uid) {
      return res.status(400).json({
        error: "Missing required fields: batchName, academicYear, course, year, uid"
      });
    }

    let finalCollegeName = collegeName;
    if (!finalCollegeName) {
      const user = await User.findOne({ uid });
      finalCollegeName = user?.collegeName || "Default College";
    }

    const newBatch = new Batch({
      batchName,
      academicYear,
      course,
      year,
      department: department || course,
      collegeName: finalCollegeName,
      facultyUid: uid,
      facultyName: facultyName || "Unknown",
      facultyEmail: facultyEmail || "",
      students: [],
      promotedStudentIds: [],
      status: "Active",
      name: batchName,
      mentorId: facultyName,
    });

    await newBatch.save();
    console.log("✅ Batch created:", newBatch.batchName);

    res.status(201).json({
      message: "Batch created successfully",
      batch: {
        id: newBatch._id,
        batchName: newBatch.batchName,
        academicYear: newBatch.academicYear,
        course: newBatch.course,
        year: newBatch.year,
        department: newBatch.department,
        students: newBatch.students
      }
    });
  } catch (err) {
    console.error("Error creating batch:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. GET BATCH DETAILS BY ID
app.get("/api/faculty/batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const promotedIds = new Set(batch.promotedStudentIds || []);
    const remainingStudents = batch.students.filter(
      s => !promotedIds.has(s._id?.toString())
    );

    const divisions = [...new Set(
      remainingStudents.map(s => s.division).filter(Boolean)
    )].sort();

    const totalOriginal = batch.students.length;
    const totalRemaining = remainingStudents.length;
    const totalPromoted = totalOriginal - totalRemaining;

    res.json({
      id: batch._id,
      batchName: batch.batchName || batch.name,
      academicYear: batch.academicYear,
      course: batch.course || batch.department,
      year: batch.year,
      department: batch.department,
      students: batch.students,
      remainingStudents: remainingStudents,
      promotedStudentIds: batch.promotedStudentIds || [],
      divisions: divisions,
      totalStudents: totalRemaining,
      totalOriginal: totalOriginal,
      promotedCount: totalPromoted,
      status: batch.status,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    });
  } catch (err) {
    console.error("Error fetching batch:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. ADD STUDENT TO BATCH
app.post("/api/faculty/batch/:batchId/add-student", async (req, res) => {
  try {
    const { batchId } = req.params;
    const { name, rollNo, enrollmentNo, email, phone, division, year } = req.body;

    if (!name || !rollNo || !enrollmentNo || !email || !phone || !division) {
      return res.status(400).json({
        error: "Missing required fields: name, rollNo, enrollmentNo, email, phone, division"
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const existingStudent = batch.students.find(
      s => s.rollNo === rollNo || s.enrollmentNo === enrollmentNo
    );
    if (existingStudent) {
      return res.status(400).json({
        error: "Student with this Roll No or Enrollment No already exists"
      });
    }

    const newStudent = {
      name,
      rollNo,
      enrollmentNo,
      email,
      phone,
      mobile: phone,
      division,
      year: year || batch.year,
      status: "Active",
      attendance: 0,
      assignments: 0,
      attendanceRecords: [],
      attendanceByYear: {},
      semesters: [],
      createdAt: new Date()
    };

    batch.students.push(newStudent);
    batch.studentCount = batch.students.length;
    batch.updatedAt = new Date();
    await batch.save();

    console.log(`✅ Student ${name} added to batch ${batch.batchName || batch.name}`);

    // Send welcome email
    let emailSent = false;
    try {
      const mailOptions = {
        from: '"Mentor Insight Portal" <mentorinsight.portal@gmail.com>',
        to: email,
        subject: `Welcome to ${batch.batchName || batch.name} - ${batch.collegeName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { padding: 30px; }
              .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .info-box h3 { margin: 0 0 10px 0; color: #333; font-size: 18px; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
              .info-row:last-child { border-bottom: none; }
              .info-label { font-weight: 600; color: #666; }
              .info-value { color: #333; font-weight: 500; }
              .credentials-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .credentials-box strong { color: #856404; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Welcome to Mentor Insight Portal!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.95;">You've been successfully enrolled</p>
              </div>
              <div class="content">
                <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>! 👋</p>
                <p>You have been successfully added to the academic portal by your faculty mentor.</p>
                <div class="info-box">
                  <h3>📚 Your Academic Details</h3>
                  <div class="info-row">
                    <span class="info-label">Batch/Class:</span>
                    <span class="info-value">${batch.batchName || batch.name}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Roll Number:</span>
                    <span class="info-value">${rollNo}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Enrollment No:</span>
                    <span class="info-value">${enrollmentNo}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Division:</span>
                    <span class="info-value">${division}</span>
                  </div>
                </div>
                <div class="credentials-box">
                  <strong>⚠️ IMPORTANT - Your Login Credentials</strong>
                  <p style="margin: 10px 0;">Use these details to access the student portal:</p>
                  <div style="background: white; padding: 12px; border-radius: 4px; margin: 10px 0;">
                    <div style="margin: 8px 0;"><strong>Roll No:</strong> ${rollNo}</div>
                    <div style="margin: 8px 0;"><strong>Mobile:</strong> ${phone}</div>
                  </div>
                </div>
              </div>
              <div class="footer">
                <p style="margin: 5px 0;"><strong>${batch.collegeName}</strong></p>
                <p style="margin: 5px 0;">Mentor Insight Portal - Academic Management System</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`✅ Welcome email sent to ${name} at ${email}`);
    } catch (emailError) {
      console.error("⚠️ Email sending error:", emailError);
    }

    res.json({
      message: "Student added successfully",
      student: newStudent,
      totalStudents: batch.students.length,
      emailSent: emailSent
    });
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. GET STUDENTS BY DIVISION
app.get("/api/faculty/batch/:batchId/division/:division", async (req, res) => {
  try {
    const { batchId, division } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const divisionStudents = batch.students.filter(s => s.division === division);
    res.json({
      batchName: batch.batchName || batch.name,
      division: division,
      students: divisionStudents,
      count: divisionStudents.length
    });
  } catch (err) {
    console.error("Error fetching division students:", err);
    res.status(500).json({ error: err.message });
  }
});

// 6. GET STUDENT DETAILS BY ID
app.get("/api/faculty/batch/:batchId/student/:studentId", async (req, res) => {
  try {
    const { batchId, studentId } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const student = batch.students.id(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      student: student,
      batchInfo: {
        batchName: batch.batchName || batch.name,
        academicYear: batch.academicYear,
        course: batch.course || batch.department,
        department: batch.department
      }
    });
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ error: err.message });
  }
});

// 7. UPDATE STUDENT DETAILS
app.put("/api/faculty/batch/:batchId/student/:studentId", async (req, res) => {
  try {
    const { batchId, studentId } = req.params;
    const updates = req.body;

    console.log('📝 UPDATE REQUEST:', { batchId, studentId });

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const student = batch.students.id(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    Object.keys(updates).forEach(key => {
      if (key === 'semesters' || key === 'attendanceRecords') {
        student[key] = updates[key];
        batch.markModified(`students.${batch.students.indexOf(student)}.${key}`);
      } else if (key === 'attendanceByYear') {
        student[key] = updates[key];
        batch.markModified(`students.${batch.students.indexOf(student)}.attendanceByYear`);
      } else if (student[key] !== undefined) {
        student[key] = updates[key];
      }
    });

    batch.updatedAt = new Date();
    const savedBatch = await batch.save();
    const savedStudent = savedBatch.students.id(studentId);

    console.log('💾 SAVED STUDENT:', {
      name: savedStudent.name,
      semestersCount: savedStudent.semesters?.length || 0,
    });

    res.json({
      message: "Student updated successfully",
      student: savedStudent
    });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ error: err.message });
  }
});

// 8. DELETE STUDENT FROM BATCH
app.delete("/api/faculty/batch/:batchId/student/:studentId", async (req, res) => {
  try {
    const { batchId, studentId } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const student = batch.students.id(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.remove();
    batch.studentCount = batch.students.length;
    batch.updatedAt = new Date();
    await batch.save();

    res.json({
      message: "Student removed successfully",
      totalStudents: batch.students.length
    });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: err.message });
  }
});

// 9. UPDATE BATCH DETAILS
app.put("/api/faculty/batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const updates = req.body;

    const batch = await Batch.findByIdAndUpdate(
      batchId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res.json({
      message: "Batch updated successfully",
      batch: {
        id: batch._id,
        batchName: batch.batchName || batch.name,
        academicYear: batch.academicYear,
        course: batch.course,
        year: batch.year,
        department: batch.department
      }
    });
  } catch (err) {
    console.error("Error updating batch:", err);
    res.status(500).json({ error: err.message });
  }
});

// 10. DELETE BATCH
app.delete("/api/faculty/batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findByIdAndDelete(batchId);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res.json({
      message: "Batch deleted successfully",
      batchName: batch.batchName || batch.name
    });
  } catch (err) {
    console.error("Error deleting batch:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// BATCH PROMOTION ROUTE
// ========================================
app.post("/api/faculty/promote-batch", async (req, res) => {
  try {
    const { batchId, currentYear, currentAcademicYear, eligibleStudentIds, targetAcademicYear } = req.body;

    const sourceBatch = await Batch.findById(batchId);
    if (!sourceBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const yearMap = { FY: "SY", SY: "TY", TY: "GRADUATED" };
    const nextYear = yearMap[currentYear] || currentYear;

    let nextAcademicYear = targetAcademicYear;
    if (!nextAcademicYear) {
      const parts = currentAcademicYear.split("-");
      const startYear = parseInt(parts[0]);
      const endShort = parseInt(parts[1]);
      nextAcademicYear = `${startYear + 1}-${endShort + 1}`;
    }

    const newBatchName = sourceBatch.batchName.replace(currentYear, nextYear);

    let targetBatch = await Batch.findOne({
      facultyUid: sourceBatch.facultyUid,
      year: nextYear,
      academicYear: nextAcademicYear,
      course: sourceBatch.course,
      department: sourceBatch.department,
    });

    const studentsToPromote = sourceBatch.students.filter((s) =>
      eligibleStudentIds.includes(s._id.toString()),
    );

    const buildPromotedStudent = (s, currentAcademicYear, currentYear) => {
      const studentObj = s.toObject ? s.toObject() : s;
      const previousYearKey = `${currentAcademicYear}-${currentYear}`;
      const preservedAttendanceByYear = {};

      if (studentObj.attendanceByYear) {
        const attendanceMap = studentObj.attendanceByYear instanceof Map
          ? Object.fromEntries(studentObj.attendanceByYear)
          : studentObj.attendanceByYear;
        Object.assign(preservedAttendanceByYear, attendanceMap);
      }

      if (!preservedAttendanceByYear[previousYearKey] && studentObj.attendanceRecords?.length > 0) {
        preservedAttendanceByYear[previousYearKey] = {
          academicYear: currentAcademicYear,
          year: currentYear,
          batchName: `${currentYear} ${currentAcademicYear}`,
          months: studentObj.attendanceRecords,
          averageAttendance: studentObj.attendance || 0
        };
      }

      return {
        ...studentObj,
        _id: undefined,
        year: nextYear,
        promotedFrom: s._id.toString(),
        attendanceByYear: preservedAttendanceByYear,
        attendanceRecords: [],
        attendance: 0,
        semesters: studentObj.semesters || [],
      };
    };

    if (!targetBatch) {
      targetBatch = new Batch({
        batchName: newBatchName,
        academicYear: nextAcademicYear,
        course: sourceBatch.course,
        year: nextYear,
        department: sourceBatch.department,
        collegeName: sourceBatch.collegeName,
        facultyUid: sourceBatch.facultyUid,
        facultyName: sourceBatch.facultyName,
        facultyEmail: sourceBatch.facultyEmail,
        students: studentsToPromote.map(s => buildPromotedStudent(s, currentAcademicYear, currentYear)),
        promotedStudentIds: [],
        status: "Active",
        name: newBatchName,
        mentorId: sourceBatch.mentorId || sourceBatch.facultyName,
        promotedFromBatchId: sourceBatch._id.toString(),
      });
      await targetBatch.save();
    } else {
      const alreadyPromotedIds = targetBatch.students.map((s) => s.promotedFrom).filter(Boolean);
      const newStudentsToAdd = studentsToPromote.filter(
        (s) => !alreadyPromotedIds.includes(s._id.toString()),
      );

      if (newStudentsToAdd.length === 0) {
        return res.json({
          message: "All eligible students are already in the target batch.",
          newBatch: { id: targetBatch._id, batchName: targetBatch.batchName, academicYear: targetBatch.academicYear, year: targetBatch.year },
          promotedCount: 0,
          skipped: true,
        });
      }

      targetBatch.students.push(...newStudentsToAdd.map(s => buildPromotedStudent(s, currentAcademicYear, currentYear)));
      targetBatch.studentCount = targetBatch.students.length;
      targetBatch.updatedAt = new Date();
      await targetBatch.save();
    }

    const alreadyTracked = new Set(sourceBatch.promotedStudentIds || []);
    studentsToPromote.forEach((s) => alreadyTracked.add(s._id.toString()));
    sourceBatch.promotedStudentIds = Array.from(alreadyTracked);
    sourceBatch.updatedAt = new Date();
    await sourceBatch.save();

    console.log(`✅ Promoted ${studentsToPromote.length} students → ${targetBatch.batchName}`);

    res.json({
      message: "Batch promoted successfully with attendance history preserved",
      newBatch: {
        id: targetBatch._id,
        batchName: targetBatch.batchName,
        academicYear: targetBatch.academicYear,
        year: targetBatch.year,
        totalStudents: targetBatch.students.length,
      },
      sourceBatch: {
        id: sourceBatch._id,
        batchName: sourceBatch.batchName,
        totalStudents: sourceBatch.students.length,
        promotedStudentIds: sourceBatch.promotedStudentIds,
        remainingCount: sourceBatch.students.length - (sourceBatch.promotedStudentIds?.length || 0),
      },
      promotedCount: studentsToPromote.length,
      retainedCount: sourceBatch.students.length - studentsToPromote.length,
    });
  } catch (err) {
    console.error("Error promoting batch:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// ADMIN ROUTES
// ========================================

app.get("/api/admin/stats", async (req, res) => {
  const { college } = req.query;
  const filter = college ? { collegeName: college } : {};
  try {
    const studentCount = await User.countDocuments({ ...filter, role: "student" });
    const facultyCount = await User.countDocuments({ ...filter, role: "faculty" });
    const batchCount = await Batch.countDocuments(filter);
    res.json({ students: studentCount, faculty: facultyCount, batches: batchCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/batches", async (req, res) => {
  const { college } = req.query;
  const filter = college ? { collegeName: college } : {};
  try {
    const batches = await Batch.find(filter).sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/batches", async (req, res) => {
  try {
    const newBatch = new Batch(req.body);
    await newBatch.save();
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/faculty-list", async (req, res) => {
  const { college } = req.query;
  const filter = college ? { role: "faculty", collegeName: college } : { role: "faculty" };
  try {
    const faculty = await User.find(filter);
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/overview-data", async (req, res) => {
  const { college } = req.query;
  const filter = college ? { collegeName: college } : {};
  try {
    const recentBatches = await Batch.find(filter).sort({ createdAt: -1 }).limit(5);
    const recentStudents = await User.find({ ...filter, role: "student" }).sort({ createdAt: -1 }).limit(5);
    const recentFaculty = await User.find({ ...filter, role: "faculty" }).sort({ createdAt: -1 }).limit(5);
    res.json({ recentBatches, recentStudents, recentFaculty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/register", async (req, res) => {
  try {
    const { collegeName, secretCode, instituteCode, adminEmail, collegeType } = req.body;
    if (!instituteCode) {
      return res.status(400).json({ message: "Institute Code is required." });
    }
    const existing = await Organization.findOne({ collegeName });
    if (existing) {
      return res.status(400).json({ message: "College Name already registered." });
    }
    const newOrg = new Organization({ collegeName, secretCode, instituteCode, adminEmail, collegeType });
    await newOrg.save();
    res.status(201).json({ message: "Admin Registered Successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/verify", async (req, res) => {
  const { collegeName, secretCode, instituteCode, email } = req.body;
  try {
    const org = await Organization.findOne({ collegeName });
    if (!org) return res.status(404).json({ valid: false, message: "College not found." });
    if (org.secretCode !== secretCode) return res.status(401).json({ valid: false, message: "Invalid Secret Code." });
    if (org.instituteCode !== instituteCode) return res.status(401).json({ valid: false, message: "Invalid Institute Code." });
    if (org.adminEmail !== email) return res.status(403).json({ valid: false, message: "This Google Account is not the registered Admin." });
    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/faculty/verify-inst", async (req, res) => {
  const { collegeName, instituteCode } = req.body;
  try {
    const org = await Organization.findOne({
      collegeName: { $regex: new RegExp(`^${collegeName}$`, "i") },
      instituteCode: instituteCode,
    });
    if (!org) {
      return res.status(404).json({ valid: false, message: "Invalid College Name or Institute Code" });
    }
    res.json({ valid: true, collegeName: org.collegeName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/assign-mentor", async (req, res) => {
  const { batchId, mentorName, mentorEmail, mentorMobile, collegeName, departmentName } = req.body;
  try {
    await User.findOneAndUpdate(
      { email: mentorEmail },
      {
        uid: "generated_" + Date.now(),
        name: mentorName,
        email: mentorEmail,
        mobile: mentorMobile,
        role: "faculty",
        collegeName: collegeName,
        mentorId: departmentName,
      },
      { new: true, upsert: true },
    );

    await Batch.findByIdAndUpdate(batchId, { assignedMentor: mentorName });

    const mailOptions = {
      from: '"Mentor Insight Portal" <mentorinsight.portal@gmail.com>',
      to: mentorEmail,
      subject: `Action Required: You have been assigned as Mentor for ${departmentName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Welcome to ${collegeName}</h2>
          <p>Hello <strong>${mentorName}</strong>,</p>
          <p>You have been assigned as a <strong>Mentor</strong> for <strong>${departmentName}</strong>.</p>
          <p>Please login with: <span style="color: #0ea5e9;">${mentorEmail}</span></p>
          <a href="http://localhost:3000/login/faculty">Login Here</a>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("Error sending email:", error);
      else console.log("Email sent: " + info.response);
    });

    res.json({ success: true, message: "Mentor Assigned & Email Sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- GET STUDENT FULL DATA ---
app.get("/api/student/full-data/:rollNo/:mobile", async (req, res) => {
  const { rollNo, mobile } = req.params;
  try {
    const batches = await Batch.find({
      students: { $elemMatch: { rollNo: rollNo, mobile: mobile } },
    }).sort({ createdAt: -1 });

    if (!batches || batches.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found in any batch." });
    }

    console.log(`📚 Found ${batches.length} batch(es) for student ${rollNo}`);

    let currentBatch = null;
    let studentData = null;

    for (const batch of batches) {
      const student = batch.students.find(
        (s) => s.rollNo === rollNo && s.mobile === mobile
      );
      if (!student) continue;

      const isPromoted = batch.promotedStudentIds?.includes(student._id?.toString());
      if (!isPromoted) {
        currentBatch = batch;
        studentData = student;
        console.log(`✅ Current batch found: ${batch.batchName} (${batch.year})`);
        break;
      }
    }

    if (!currentBatch) {
      currentBatch = batches[0];
      studentData = currentBatch.students.find(
        (s) => s.rollNo === rollNo && s.mobile === mobile
      );
    }

    let processedAttendanceByYear = {};
    if (studentData.attendanceByYear) {
      if (studentData.attendanceByYear instanceof Map) {
        processedAttendanceByYear = Object.fromEntries(studentData.attendanceByYear);
      } else if (typeof studentData.attendanceByYear === 'object') {
        for (let key in studentData.attendanceByYear) {
          if (studentData.attendanceByYear[key] && typeof studentData.attendanceByYear[key] === 'object') {
            processedAttendanceByYear[key] = studentData.attendanceByYear[key];
          }
        }
      }
    }

    const responseData = {
      ...studentData.toObject(),
      attendanceByYear: processedAttendanceByYear
    };

    res.json({
      success: true,
      student: responseData,
      batchInfo: {
        _id: currentBatch._id,
        batchId: currentBatch._id,
        batchName: currentBatch.batchName || currentBatch.name,
        academicYear: currentBatch.academicYear,
        year: currentBatch.year,
        course: currentBatch.course || currentBatch.department,
        collegeName: currentBatch.collegeName,
      }
    });
  } catch (err) {
    console.error("❌ Error fetching student data:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// SESSION ROUTES
// ========================================

// ✅ SEND SESSION & SAVE TO DB (single, correct version)
app.post("/api/faculty/send-session", async (req, res) => {
  try {
    const {
      title, description, sessionDate, sessionTime, venue,
      targetBatch, targetDivision, sessionType, duration,
      isImportant, facultyUid, facultyName, facultyEmail, collegeName,
    } = req.body;

    if (!title || !sessionDate || !sessionTime || !targetBatch) {
      return res.status(400).json({
        error: "Missing required fields: title, sessionDate, sessionTime, targetBatch"
      });
    }

    const batch = await Batch.findById(targetBatch);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    let targetStudents = batch.students;
    if (targetDivision && targetDivision !== "all") {
      targetStudents = batch.students.filter(s => s.division === targetDivision);
    }

    const promotedIds = new Set(batch.promotedStudentIds || []);
    targetStudents = targetStudents.filter(s => !promotedIds.has(s._id?.toString()));

    if (targetStudents.length === 0) {
      return res.status(400).json({ error: "No active students found in the target batch/division" });
    }

    // ✅ Save session to DB first
    const newSession = new Session({
      title,
      description,
      sessionDate,
      sessionTime,
      venue,
      sessionType,
      duration,
      isImportant,
      targetBatchId: targetBatch,
      targetBatchName: batch.batchName || batch.name,
      targetDivision: targetDivision || "all",
      facultyUid,
      facultyName,
      facultyEmail,
      collegeName,
      sentToCount: targetStudents.length
    });
    await newSession.save();
    console.log("✅ Session saved to DB:", newSession._id);

    // Format date/time for emails
    const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
    const formattedDate = sessionDateTime.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = sessionDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });

    let successCount = 0;
    let failedEmails = [];

    for (const student of targetStudents) {
      if (!student.email) {
        failedEmails.push({ name: student.name, reason: "No email address" });
        continue;
      }
      try {
        const mailOptions = {
          from: '"Mentor Insight Portal" <mentorinsight.portal@gmail.com>',
          to: student.email,
          subject: isImportant
            ? `🔴 IMPORTANT: ${title} - ${formattedDate}`
            : `📢 Session Notification: ${title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: ${isImportant ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; }
                .important-badge { display: inline-block; background: rgba(255,255,255,0.3); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 10px; letter-spacing: 1px; }
                .content { padding: 30px; }
                .session-info { background: #f8f9fa; border-left: 4px solid ${isImportant ? '#dc2626' : '#667eea'}; padding: 20px; margin: 20px 0; border-radius: 4px; }
                .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
                .info-row:last-child { border-bottom: none; }
                .info-icon { width: 30px; font-size: 18px; }
                .info-label { font-weight: 600; color: #666; min-width: 120px; }
                .info-value { color: #333; font-weight: 500; flex: 1; }
                .description-box { background: #fff; border: 1px solid #e0e0e0; padding: 15px; border-radius: 6px; margin: 15px 0; line-height: 1.6; }
                .cta-button { display: block; background: ${isImportant ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; text-align: center; }
                .reminder-box { background: ${isImportant ? '#fef2f2' : '#eff6ff'}; border: 2px solid ${isImportant ? '#fecaca' : '#bfdbfe'}; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${isImportant ? '🔴 ' : ''}${title}</h1>
                  ${isImportant ? '<div class="important-badge">⚠️ IMPORTANT SESSION</div>' : ''}
                </div>
                <div class="content">
                  <p style="font-size: 16px; color: #333;">Hi <strong>${student.name}</strong>! 👋</p>
                  <p>This is to notify you about an upcoming ${sessionType} session.</p>
                  ${description ? `<div class="description-box"><strong>Description:</strong><p style="margin: 10px 0 0 0;">${description}</p></div>` : ''}
                  <div class="session-info">
                    <div class="info-row"><span class="info-icon">📅</span><span class="info-label">Date:</span><span class="info-value">${formattedDate}</span></div>
                    <div class="info-row"><span class="info-icon">⏰</span><span class="info-label">Time:</span><span class="info-value">${formattedTime}</span></div>
                    ${duration ? `<div class="info-row"><span class="info-icon">⏱️</span><span class="info-label">Duration:</span><span class="info-value">${duration} minutes</span></div>` : ''}
                    ${venue ? `<div class="info-row"><span class="info-icon">📍</span><span class="info-label">Venue:</span><span class="info-value">${venue}</span></div>` : ''}
                    <div class="info-row"><span class="info-icon">👨‍🏫</span><span class="info-label">Faculty:</span><span class="info-value">${facultyName}</span></div>
                    <div class="info-row"><span class="info-icon">🎓</span><span class="info-label">Batch:</span><span class="info-value">${batch.batchName || batch.name} - Division ${student.division}</span></div>
                  </div>
                  ${isImportant ? `<div class="reminder-box"><strong>⚠️ Important Notice:</strong><p style="margin: 8px 0 0 0;">This is marked as an important session. Please make sure to attend on time.</p></div>` : ''}
                  <a href="http://localhost:3000/student/dashboard" class="cta-button">📱 View in Student Portal</a>
                  <p style="color: #666; font-size: 14px; margin-top: 25px;">Questions? Contact <a href="mailto:${facultyEmail}">${facultyEmail}</a></p>
                </div>
                <div class="footer">
                  <p style="margin: 5px 0;"><strong>${collegeName}</strong></p>
                  <p style="margin: 5px 0;">Mentor Insight Portal - Academic Management System</p>
                </div>
              </div>
            </body>
            </html>
          `
        };
        await transporter.sendMail(mailOptions);
        successCount++;
        console.log(`✅ Email sent to ${student.name}`);
      } catch (emailError) {
        console.error(`❌ Email failed for ${student.name}:`, emailError);
        failedEmails.push({ name: student.name, email: student.email, reason: emailError.message });
      }
    }

    const response = {
      message: "Session notification sent and saved",
      sessionId: newSession._id,
      recipientCount: successCount,
      totalStudents: targetStudents.length,
      batchName: batch.batchName || batch.name,
      division: targetDivision === "all" ? "All Divisions" : `Division ${targetDivision}`,
      sessionDetails: { title, date: formattedDate, time: formattedTime, type: sessionType, isImportant }
    };

    if (failedEmails.length > 0) {
      response.failedEmails = failedEmails;
      response.warning = `${failedEmails.length} emails failed to send`;
    }

    console.log(`📧 Done: ${successCount}/${targetStudents.length} students notified`);
    res.json(response);

  } catch (err) {
    console.error("❌ Error sending session:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET SESSIONS BY BATCH ID (primary - used by student dashboard)
app.get("/api/student/sessions-by-id/:batchId/:division", async (req, res) => {
  try {
    const { batchId, division } = req.params;
    console.log(`📚 Fetching sessions by batchId: ${batchId}, division: ${division}`);

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, error: "Batch not found" });
    }

    const batchName = batch.batchName || batch.name;

    const sessions = await Session.find({
      $and: [
        {
          $or: [
            { targetBatchId: batchId },
            { targetBatchName: batchName }
          ]
        },
        {
          $or: [
            { targetDivision: "all" },
            { targetDivision: division }
          ]
        }
      ]
    }).sort({ sessionDate: -1 });

    console.log(`✅ Found ${sessions.length} sessions for batchId: ${batchId}`);
    res.json({ success: true, sessions, count: sessions.length });

  } catch (err) {
    console.error("❌ Error fetching sessions by ID:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET SESSIONS BY BATCH NAME (fallback)
app.get("/api/student/sessions/:batchName/:division", async (req, res) => {
  try {
    const { batchName, division } = req.params;
    const decodedBatchName = decodeURIComponent(batchName);
    console.log(`📚 Fetching sessions by batchName: ${decodedBatchName}, division: ${division}`);

    const sessions = await Session.find({
      $and: [
        {
          targetBatchName: { $regex: new RegExp(`^${decodedBatchName}$`, 'i') }
        },
        {
          $or: [
            { targetDivision: "all" },
            { targetDivision: division }
          ]
        }
      ]
    }).sort({ sessionDate: -1 });

    console.log(`✅ Found ${sessions.length} sessions by name`);
    res.json({ success: true, sessions, count: sessions.length });

  } catch (err) {
    console.error("❌ Error fetching sessions by name:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET SESSION BY ID
app.get("/api/student/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    res.json({ success: true, session });
  } catch (err) {
    console.error("❌ Error fetching session:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ DELETE SESSION (faculty only)
app.delete("/api/faculty/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { facultyUid } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.facultyUid !== facultyUid) {
      return res.status(403).json({ error: "Unauthorized to delete this session" });
    }

    await Session.findByIdAndDelete(sessionId);
    console.log(`🗑️ Session deleted: ${session.title}`);

    res.json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting session:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL SESSIONS FOR A FACULTY (for management view)
app.get("/api/faculty/sessions/:facultyUid", async (req, res) => {
  try {
    const { facultyUid } = req.params;
    const sessions = await Session.find({ facultyUid }).sort({ createdAt: -1 });
    res.json({ success: true, sessions, count: sessions.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.post("/api/student/session/:sessionId/apply", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentId, rollNo, name, email, division, enrollmentNo } = req.body;

    if (!studentId || !rollNo || !name) {
      return res.status(400).json({ error: "Missing required fields: studentId, rollNo, name" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    if (!session.acceptingApplications) {
      return res.status(400).json({ success: false, error: "This session is no longer accepting applications" });
    }

    // Check max capacity
    if (session.maxCapacity && session.attendees.length >= session.maxCapacity) {
      return res.status(400).json({ success: false, error: `Session is full (max ${session.maxCapacity} attendees)` });
    }

    // Check if already applied
    const alreadyApplied = session.attendees.find(a => a.studentId === studentId || a.rollNo === rollNo);
    if (alreadyApplied) {
      return res.status(400).json({ success: false, error: "You have already applied for this session" });
    }

    // Add attendee
    session.attendees.push({
      studentId,
      rollNo,
      name,
      email: email || "",
      division: division || "",
      enrollmentNo: enrollmentNo || "",
      appliedAt: new Date()
    });

    await session.save();

    console.log(`✅ Student ${name} applied for session: ${session.title}`);

    // Optional: Send confirmation email
    if (email) {
      try {
        const sessionDate = new Date(session.sessionDate);
        const formattedDate = sessionDate.toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const mailOptions = {
          from: '"Mentor Insight Portal" <mentorinsight.portal@gmail.com>',
          to: email,
          subject: `✅ Application Confirmed: ${session.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 28px; text-align: center; }
                .header h1 { margin: 0; font-size: 22px; }
                .body { padding: 28px; }
                .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 16px 0; }
                .info-row { padding: 8px 0; border-bottom: 1px solid #d1fae5; display: flex; }
                .info-row:last-child { border-bottom: none; }
                .info-label { font-weight: 600; color: #065f46; min-width: 110px; }
                .info-value { color: #1f2937; }
                .check-badge { background: #d1fae5; border: 2px solid #10b981; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px; }
                .footer { background: #f8f9fa; padding: 18px; text-align: center; color: #666; font-size: 13px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Application Confirmed!</h1>
                  <p style="margin:8px 0 0;opacity:0.9;">You're registered for the session</p>
                </div>
                <div class="body">
                  <p>Hi <strong>${name}</strong>, your application has been confirmed!</p>
                  <div class="info-box">
                    <div class="info-row"><span class="info-label">Session:</span><span class="info-value">${session.title}</span></div>
                    <div class="info-row"><span class="info-label">Type:</span><span class="info-value">${session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)}</span></div>
                    <div class="info-row"><span class="info-label">Date:</span><span class="info-value">${formattedDate}</span></div>
                    <div class="info-row"><span class="info-label">Time:</span><span class="info-value">${session.sessionTime || 'TBD'}</span></div>
                    ${session.venue ? `<div class="info-row"><span class="info-label">Venue:</span><span class="info-value">${session.venue}</span></div>` : ''}
                    <div class="info-row"><span class="info-label">Faculty:</span><span class="info-value">${session.facultyName}</span></div>
                  </div>
                  <p style="color:#666;font-size:13px;">Please arrive on time. You can cancel your application from the student portal if needed.</p>
                </div>
                <div class="footer">
                  <p><strong>${session.collegeName || 'Mentor Insight Portal'}</strong></p>
                </div>
              </div>
            </body>
            </html>
          `
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation email sent to ${email}`);
      } catch (emailErr) {
        console.warn("⚠️ Confirmation email failed:", emailErr.message);
      }
    }

    res.json({
      success: true,
      message: "Successfully applied for session",
      attendeeCount: session.attendees.length,
      appliedAt: new Date()
    });

  } catch (err) {
    console.error("❌ Error applying for session:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ✅ CANCEL APPLICATION (student)
app.delete("/api/student/session/:sessionId/apply", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentId, rollNo } = req.body;

    if (!studentId && !rollNo) {
      return res.status(400).json({ error: "studentId or rollNo required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    const initialCount = session.attendees.length;
    session.attendees = session.attendees.filter(
      a => a.studentId !== studentId && a.rollNo !== rollNo
    );

    if (session.attendees.length === initialCount) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    await session.save();

    console.log(`🗑️ Student ${rollNo || studentId} cancelled application for: ${session.title}`);

    res.json({
      success: true,
      message: "Application cancelled successfully",
      attendeeCount: session.attendees.length
    });

  } catch (err) {
    console.error("❌ Error cancelling application:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ✅ GET ATTENDEES FOR A SESSION (faculty)
app.get("/api/faculty/session/:sessionId/attendees", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    res.json({
      success: true,
      sessionTitle: session.title,
      sessionDate: session.sessionDate,
      sessionTime: session.sessionTime,
      attendees: session.attendees,
      attendeeCount: session.attendees.length,
      sentToCount: session.sentToCount,
      acceptingApplications: session.acceptingApplications
    });

  } catch (err) {
    console.error("❌ Error fetching attendees:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ✅ TOGGLE ACCEPTING APPLICATIONS (faculty)
app.put("/api/faculty/session/:sessionId/toggle-applications", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { facultyUid } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.facultyUid !== facultyUid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    session.acceptingApplications = !session.acceptingApplications;
    await session.save();

    res.json({
      success: true,
      acceptingApplications: session.acceptingApplications,
      message: session.acceptingApplications ? "Applications re-opened" : "Applications closed"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ CHECK IF STUDENT HAS APPLIED (used on dashboard load)
app.get("/api/student/session/:sessionId/apply-status/:rollNo", async (req, res) => {
  try {
    const { sessionId, rollNo } = req.params;

    const session = await Session.findById(sessionId).select('attendees acceptingApplications maxCapacity title');
    if (!session) {
      return res.status(404).json({ success: false });
    }

    const hasApplied = session.attendees.some(a => a.rollNo === rollNo);

    res.json({
      success: true,
      hasApplied,
      attendeeCount: session.attendees.length,
      maxCapacity: session.maxCapacity,
      acceptingApplications: session.acceptingApplications,
      isFull: session.maxCapacity ? session.attendees.length >= session.maxCapacity : false
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// POST: Faculty sends broadcast
app.post("/api/faculty/broadcast", async (req, res) => {
  try {
    const {
      subject, body, priority, tag,
      targetBatchId, targetBatchName, targetDivision,
      facultyUid, facultyName,
    } = req.body;

    const broadcast = new Broadcast({
      subject, body, priority, tag,
      targetBatchId, targetBatchName,
      targetDivision: targetDivision || "all",
      facultyUid,
      sentBy: facultyName,
    });
    await broadcast.save();

    // Count recipients (uses your existing Batch model)
    let recipientCount = 0;
    try {
      const batch = await Batch.findById(targetBatchId);
      if (batch && batch.students) {
        const students = targetDivision === "all"
          ? batch.students
          : batch.students.filter(s => s.division === targetDivision);
        recipientCount = students.length;
      }
    } catch (_) { /* batch not found is fine */ }

    res.json({ success: true, broadcastId: broadcast._id, recipientCount });
  } catch (err) {
    console.error("Broadcast send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/faculty/broadcasts/:facultyUid", async (req, res) => {
  try {
    const broadcasts = await Broadcast
      .find({ facultyUid: req.params.facultyUid })
      .sort({ sentAt: -1 })
      .limit(50);
    res.json({ success: true, broadcasts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Student fetches broadcasts for their batch + division
app.get("/api/student/broadcasts/:batchId/:division", async (req, res) => {
  try {
    const { batchId, division } = req.params;
    const messages = await Broadcast.find({
      targetBatchId: batchId,
      $or: [
        { targetDivision: "all" },
        { targetDivision: division },
      ],
    }).sort({ sentAt: -1 }).limit(30);

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// FACULTY: Share a new resource
app.post("/api/faculty/learning/share", async (req, res) => {
  try {
    const { type, title, description, url, thumbnail, tags, isPinned,
            targetBatchId, targetBatchName, targetDivision,
            facultyUid, sharedBy, facultyEmail } = req.body;

    if (!type || !title || !targetBatchId || !facultyUid) {
      return res.status(400).json({ error: "type, title, targetBatchId, facultyUid are required" });
    }

    const resource = new LearningResource({
      type, title, description, url: url || "", thumbnail: thumbnail || "",
      tags: Array.isArray(tags) ? tags : [],
      isPinned: !!isPinned,
      targetBatchId, targetBatchName, targetDivision: targetDivision || "all",
      facultyUid, sharedBy, facultyEmail,
    });

    await resource.save();
    res.json({ success: true, resource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FACULTY: Get all resources shared by a faculty member
app.get("/api/faculty/learning/:facultyUid", async (req, res) => {
  try {
    const resources = await LearningResource
      .find({ facultyUid: req.params.facultyUid })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(100);
    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FACULTY: Delete a shared resource
app.delete("/api/faculty/learning/:id", async (req, res) => {
  try {
    await LearningResource.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FACULTY: Toggle pin status
app.patch("/api/faculty/learning/:id/pin", async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    resource.isPinned = !resource.isPinned;
    await resource.save();
    res.json({ success: true, isPinned: resource.isPinned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STUDENT: Fetch learning resources for their batch/division
app.get("/api/student/learning/:batchId/:division", async (req, res) => {
  try {
    const { batchId, division } = req.params;

    const query = {
      targetBatchId: batchId,
      $or: [
        { targetDivision: "all" },
        { targetDivision: division },
      ],
    };

    const resources = await LearningResource
      .find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50);

    // Increment view count (fire-and-forget, don't await)
    LearningResource.updateMany({ _id: { $in: resources.map(r => r._id) } }, { $inc: { views: 1 } })
      .catch(() => {});

    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  FORGOT ACCESS CODE — 3 routes
// ═══════════════════════════════════════════════════════════

// 1. VERIFY IDENTITY (no secret code needed — uses email + institute code)
app.post("/api/admin/forgot-verify", async (req, res) => {
  try {
    const { collegeName, email, instituteCode } = req.body;
    const college = await College.findOne({
      collegeName: { $regex: new RegExp(`^${collegeName}$`, "i") },
      adminEmail: email.toLowerCase(),
      instituteCode: instituteCode.trim(),
    });
    if (!college) {
      return res.status(404).json({ verified: false, message: "No matching college found. Check college name, email, and institute code." });
    }
    res.json({ verified: true, message: "Identity verified." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// 2. RESET ACCESS CODE
app.post("/api/admin/reset-code", async (req, res) => {
  try {
    const { collegeName, email, instituteCode, newSecretCode } = req.body;
    if (!newSecretCode || newSecretCode.length < 4) {
      return res.status(400).json({ message: "Code must be at least 4 characters." });
    }
    const college = await College.findOneAndUpdate(
      {
        collegeName: { $regex: new RegExp(`^${collegeName}$`, "i") },
        adminEmail: email.toLowerCase(),
        instituteCode: instituteCode.trim(),
      },
      { secretCode: newSecretCode },
      { new: true }
    );
    if (!college) {
      return res.status(404).json({ message: "College not found or identity mismatch." });
    }
    res.json({ success: true, message: "Access code updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ═══════════════════════════════════════════════════════════
// TEACHER ASSIGNMENT — 2 routes
// ═══════════════════════════════════════════════════════════

// 3. ASSIGN TEACHERS TO BATCH
app.post("/api/admin/assign-teachers", async (req, res) => {
  try {
    const { batchId, teacherIds, college } = req.body;
    // Update batch document with assigned teacher IDs
    await Batch.findByIdAndUpdate(
      batchId,
      { $addToSet: { assignedTeachers: { $each: teacherIds } } },
      { new: true }
    );
    res.json({ success: true, message: "Teachers assigned." });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign teachers." });
  }
});

// 4. GET BATCHES WITH TEACHER ASSIGNMENTS
app.get("/api/admin/batches-with-teachers", async (req, res) => {
  try {
    const { college } = req.query;
    const batches = await Batch.find({ collegeName: college })
      .select("batchName year academicYear course assignedTeachers students")
      .lean();
    res.json({ batches });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch batches." });
  }
});

// ═══════════════════════════════════════════════════════════
// REVIEW CAMPAIGNS (Admin) — 4 routes
// ═══════════════════════════════════════════════════════════

// 5. POST NEW REVIEW CAMPAIGN
app.post("/api/admin/review-campaigns", async (req, res) => {
  try {
    const campaign = new ReviewCampaign(req.body);
    await campaign.save();
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ message: "Failed to create campaign." });
  }
});

// 6. GET ALL CAMPAIGNS FOR COLLEGE (Admin view)
app.get("/api/admin/review-campaigns", async (req, res) => {
  try {
    const { college } = req.query;
    const campaigns = await ReviewCampaign.find({ college })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch campaigns." });
  }
});

// 7. CLOSE A CAMPAIGN
app.patch("/api/admin/review-campaigns/:id/close", async (req, res) => {
  try {
    await ReviewCampaign.findByIdAndUpdate(req.params.id, { status: "closed" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to close campaign." });
  }
});

// 8. GET ALL REVIEWS (Admin — for leaderboard & drilldown)
app.get("/api/admin/reviews", async (req, res) => {
  try {
    const { college } = req.query;
    const reviews = await FacultyReview.find({ college })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews." });
  }
});

// ═══════════════════════════════════════════════════════════
// REVIEW CAMPAIGNS (Student) — 2 routes
// ═══════════════════════════════════════════════════════════

// 9. GET ACTIVE CAMPAIGNS FOR STUDENT'S BATCH
app.get("/api/student/review-campaigns/:batchId", async (req, res) => {
  try {
    const campaigns = await ReviewCampaign.find({
      batchId: req.params.batchId,
      status: "active",
    }).sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch campaigns." });
  }
});

// 10. SUBMIT STUDENT REVIEW
app.post("/api/student/submit-review", async (req, res) => {
  try {
    const { campaignId, studentId, rollNo } = req.body;

    // FIX: Check dedup by campaignId + (studentId OR rollNo)
    const existing = await FacultyReview.findOne({
      campaignId,
      $or: [
        { studentId: studentId },
        ...(rollNo ? [{ rollNo: rollNo }] : []),
      ],
    });
    if (existing) {
      return res.status(409).json({ message: "You have already submitted a review for this campaign." });
    }

    const review = new FacultyReview(req.body);
    await review.save();
    await ReviewCampaign.findByIdAndUpdate(campaignId, { $inc: { responses: 1 } });
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit review." });
  }
});

// 11. GET STUDENT'S SUBMITTED REVIEWS (to mark campaigns as done)
app.get("/api/student/my-reviews/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { studentId } = req.query; // ← add this

    const orConditions = [
      { rollNo: rollNo },
      { studentId: rollNo },
    ];

    // ← Also match by MongoDB _id (catches anonymous reviews)
    if (studentId && studentId !== rollNo) {
      orConditions.push({ studentId: studentId });
    }

    const reviews = await FacultyReview.find({
      $or: orConditions,
    }).select("campaignId teacherName overallRating createdAt");

    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews." });
  }
});

app.get("/api/admin/teachers", async (req, res) => {
  try {
    const { college } = req.query;
    if (!college) return res.status(400).json({ message: "college query param required" });
    const teachers = await Teacher.find({ college }).sort({ name: 1 });
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADD a new teacher ────────────────────────────────────────
app.post("/api/admin/teachers", async (req, res) => {
  try {
    const { name, email, dept, subjects, college } = req.body;
    if (!name || !email || !college) {
      return res.status(400).json({ message: "name, email, and college are required" });
    }
    // prevent duplicate email within same college
    const existing = await Teacher.findOne({ email: email.toLowerCase(), college });
    if (existing) {
      return res.status(409).json({ message: "A teacher with this email already exists." });
    }
    const teacher = new Teacher({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      dept:     dept?.trim() || "",
      subjects: Array.isArray(subjects) ? subjects : [],
      college,
    });
    await teacher.save();
    res.status(201).json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── EDIT a teacher ────────────────────────────────────────────
app.put("/api/admin/teachers/:id", async (req, res) => {
  try {
    const { name, email, dept, subjects } = req.body;
    const updated = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name: name?.trim(), email: email?.toLowerCase().trim(), dept: dept?.trim() || "", subjects: subjects || [] },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Teacher not found" });
    res.json({ success: true, teacher: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE a teacher ──────────────────────────────────────────
app.delete("/api/admin/teachers/:id", async (req, res) => {
  try {
    const { college } = req.query;
    const teacher = await Teacher.findOneAndDelete({ _id: req.params.id, college });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Also remove this teacher from any batch assignments
    await Batch.updateMany(
      { collegeName: college },
      { $pull: { assignedTeachers: req.params.id } }
    );

    res.json({ success: true, message: `${teacher.name} removed.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post("/api/parent/login", async (req, res) => {
  const { rollNo, mobile } = req.body;

  if (!rollNo || !mobile) {
    return res.status(400).json({ message: "Roll number and mobile are required." });
  }

  try {
    // 1. Find the batch containing this student
    const batch = await Batch.findOne({
      students: { $elemMatch: { rollNo: rollNo.trim() } },
    });

    if (!batch) {
      return res.status(404).json({
        message: "No student found with this roll number. Please contact the faculty.",
      });
    }

    // 2. Find the specific student subdocument in the batch
    const studentDoc = batch.students.find(
      (s) => s.rollNo === rollNo.trim()
    );

    if (!studentDoc) {
      return res.status(404).json({ message: "Student not found in this batch." });
    }

    // 3. Also fetch the User document to get profileData (where parent contacts live)
    //    Try matching by rollNo first, then by email as fallback
    let userDoc = null;
    try {
      userDoc = await User.findOne({ rollNo: rollNo.trim() });
      if (!userDoc && studentDoc.email) {
        userDoc = await User.findOne({ email: studentDoc.email });
      }
    } catch (_) { /* userDoc stays null — we'll fall back to batch data */ }

    // 4. Build a merged contacts object: User.profileData takes priority,
    //    then fall back to whatever might be on the batch student subdoc
    const profileData = userDoc?.profileData || {};

    const fatherContact =
      profileData.fatherContact ||
      studentDoc.fatherContact ||
      studentDoc.profileData?.fatherContact ||
      "";

    const motherContact =
      profileData.motherContact ||
      studentDoc.motherContact ||
      studentDoc.profileData?.motherContact ||
      "";

    const fatherName =
      profileData.fatherName ||
      studentDoc.fatherName ||
      studentDoc.profileData?.fatherName ||
      "Father";

    const motherName =
      profileData.motherName ||
      studentDoc.motherName ||
      studentDoc.profileData?.motherName ||
      "Mother";

    // 5. Normalize mobile numbers for comparison
    //    Strip spaces, dashes, leading +91 or 91
    const normalize = (num = "") =>
      num.replace(/[\s\-\(\)]/g, "").replace(/^\+?91/, "").trim();

    const normInput   = normalize(mobile);
    const normFather  = normalize(fatherContact);
    const normMother  = normalize(motherContact);

    console.log("🔍 Parent login debug:", {
      rollNo,
      inputMobile: normInput,
      fatherContact: normFather || "(none)",
      motherContact: normMother || "(none)",
      sourceUser: userDoc ? "User collection" : "Batch subdoc",
    });

    const isFather = normFather.length > 0 && normFather === normInput;
    const isMother = normMother.length > 0 && normMother === normInput;

    if (!isFather && !isMother) {
      return res.status(404).json({
        message:
          "Your mobile number is not registered for this student. " +
          "Please contact the faculty mentor to update your contact details.",
      });
    }

    const relation   = isFather ? "father" : "mother";
    const parentName = isFather ? fatherName : motherName;

    // 6. Build and return the student report
    const mergedStudentDoc = {
      ...studentDoc.toObject(),
      // Inject User profileData fields so buildStudentReport can use them
      fatherName,
      fatherContact,
      motherName,
      motherContact,
      profileData: {
        ...(studentDoc.profileData || {}),
        ...profileData,
      },
    };

    const studentData = buildStudentReport(mergedStudentDoc, batch);

    return res.json({
      success: true,
      parentData: {
        relation,
        name: parentName,
        mobile: normInput,
      },
      studentData,
    });

  } catch (err) {
    console.error("Parent login error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});



// ─────────────────────────────────────────────────────────────
// GET /api/parent/student-report
// Query: { rollNo, mobile }
//
// Used by ParentDashboard on mount to refresh data.
// Same logic as login but returns full updated report.
// ─────────────────────────────────────────────────────────────
app.get("/api/parent/student-report", async (req, res) => {
  const { rollNo, mobile } = req.query;

  if (!rollNo || !mobile) {
    return res.status(400).json({ message: "Missing rollNo or mobile." });
  }

  try {
    const batch = await Batch.findOne({
      students: { $elemMatch: { rollNo: rollNo.trim() } },
    });

    if (!batch) {
      return res.status(404).json({ message: "Student not found." });
    }

    const studentDoc = batch.students.find((s) => s.rollNo === rollNo.trim());
    if (!studentDoc) {
      return res.status(404).json({ message: "Student not found in batch." });
    }

    // Fetch User document for profileData
    let userDoc = null;
    try {
      userDoc = await User.findOne({ rollNo: rollNo.trim() });
      if (!userDoc && studentDoc.email) {
        userDoc = await User.findOne({ email: studentDoc.email });
      }
    } catch (_) {}

    const profileData = userDoc?.profileData || {};

    const fatherContact =
      profileData.fatherContact ||
      studentDoc.fatherContact ||
      studentDoc.profileData?.fatherContact ||
      "";

    const motherContact =
      profileData.motherContact ||
      studentDoc.motherContact ||
      studentDoc.profileData?.motherContact ||
      "";

    const fatherName =
      profileData.fatherName ||
      studentDoc.fatherName ||
      studentDoc.profileData?.fatherName ||
      "Father";

    const motherName =
      profileData.motherName ||
      studentDoc.motherName ||
      studentDoc.profileData?.motherName ||
      "Mother";

    const normalize = (num = "") =>
      num.replace(/[\s\-\(\)]/g, "").replace(/^\+?91/, "").trim();

    const normInput  = normalize(mobile);
    const normFather = normalize(fatherContact);
    const normMother = normalize(motherContact);

    const isFather = normFather.length > 0 && normFather === normInput;
    const isMother = normMother.length > 0 && normMother === normInput;

    if (!isFather && !isMother) {
      return res.status(403).json({ message: "Access denied." });
    }

    const relation   = isFather ? "father" : "mother";
    const parentName = isFather ? fatherName : motherName;

    // Fetch broadcasts for this batch
    let broadcasts = [];
    try {
      broadcasts = await Broadcast.find({ targetBatchId: batch._id.toString() })
        .sort({ sentAt: -1 })
        .limit(20)
        .lean();
    } catch { broadcasts = []; }

    const mergedStudentDoc = {
      ...studentDoc.toObject(),
      fatherName,
      fatherContact,
      motherName,
      motherContact,
      profileData: {
        ...(studentDoc.profileData || {}),
        ...profileData,
      },
    };

    const studentData = buildStudentReport(mergedStudentDoc, batch, broadcasts);

    return res.json({
      success: true,
      parentData: { relation, name: parentName, mobile: normInput },
      studentData,
    });

  } catch (err) {
    console.error("Parent report error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});



// ─────────────────────────────────────────────────────────────
// Helper: buildStudentReport
// Assembles a clean studentData object from the batch document
// ─────────────────────────────────────────────────────────────
function buildStudentReport(studentDoc, batch, broadcasts = []) {
  // Attendance: prefer top-level, then profileData, then batchInfo
  const attendance =
    studentDoc.attendance ??
    studentDoc.profileData?.attendance ??
    studentDoc.batchInfo?.attendance ??
    0;

  // CGPA
  const cgpa =
    studentDoc.cgpa ||
    studentDoc.profileData?.cgpa ||
    studentDoc.batchInfo?.cgpa ||
    null;

  // Semesters / marks
  const semesters =
    studentDoc.semesters ||
    studentDoc.profileData?.semesters ||
    studentDoc.batchInfo?.semesters ||
    [];

  // Mentor sessions
  const mentorSessions =
    studentDoc.mentorSessions ||
    studentDoc.batchInfo?.mentorSessions ||
    batch.sessions?.filter(
      (s) => s.studentRollNo === studentDoc.rollNo || !s.studentRollNo
    ) ||
    [];

  // Subject-wise attendance (if available)
  const subjectAttendance =
    studentDoc.subjectAttendance ||
    studentDoc.profileData?.subjectAttendance ||
    [];

  // Certifications
  const certifications =
    studentDoc.certifications ||
    studentDoc.profileData?.certifications ||
    [];

  return {
    name:        studentDoc.name,
    rollNo:      studentDoc.rollNo,
    email:       studentDoc.email || "",
    mobile:      studentDoc.mobile || "",
    division:    studentDoc.division || batch.division || "",
    collegeName: studentDoc.collegeName || batch.collegeName || "",
    mentorName:  batch.mentorName || batch.facultyName || null,

    // Parent-safe: do NOT expose father/mother contact to the parent response
    // (they already authenticated; no need to echo their number back)

    batchInfo: {
      batchName:    batch.batchName || batch.name || "",
      academicYear: batch.academicYear || "",
      division:     batch.division || "",
      mentorName:   batch.mentorName || "",
      cgpa,
    },

    attendance,
    subjectAttendance,
    cgpa,
    semesters,
    mentorSessions,
    certifications,
    broadcasts,
  };
}

// ----------------------------------------------------
// 4. START SERVER
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
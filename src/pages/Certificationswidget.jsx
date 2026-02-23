import React, { useState } from "react";

const CERT_CATEGORIES = [
  { key: "hackathon",  label: "Hackathon",        icon: "fa-laptop-code",   color: "#667eea", emoji: "💻" },
  { key: "workshop",   label: "Workshop",          icon: "fa-chalkboard",    color: "#10b981", emoji: "🛠️" },
  { key: "coursera",   label: "Coursera/Udemy",    icon: "fa-graduation-cap",color: "#f97316", emoji: "🎓" },
  { key: "internship", label: "Internship",        icon: "fa-briefcase",     color: "#8b5cf6", emoji: "💼" },
  { key: "sports",     label: "Sports/Co-Curr",    icon: "fa-trophy",        color: "#eab308", emoji: "🏆" },
  { key: "other",      label: "Other Achievement", icon: "fa-medal",         color: "#06b6d4", emoji: "🏅" },
];

const BADGE_COLORS = [
  { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  { bg: "#f3e8ff", text: "#5b21b6", border: "#ddd6fe" },
  { bg: "#ffe4e6", text: "#9f1239", border: "#fecdd3" },
];

const CertificationsWidget = ({ studentRollNo }) => {
  const storageKey = `certs_${studentRollNo || "student"}`;

  const [certs, setCerts] = useState(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewCert, setPreviewCert] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    issuer: "",
    category: "coursera",
    date: "",
    skills: "",
    file: null,
    fileDataUrl: "",
    fileName: "",
    fileType: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Max file size is 10MB"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, fileDataUrl: reader.result, fileName: file.name, fileType: file.type }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.issuer.trim()) {
      alert("Title and Issuer are required");
      return;
    }
    const newCert = {
      id: Date.now(),
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      category: form.category,
      date: form.date,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      fileDataUrl: form.fileDataUrl,
      fileName: form.fileName,
      fileType: form.fileType,
      addedAt: new Date().toISOString(),
    };
    setCerts(prev => {
      const updated = [newCert, ...prev];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    setForm({ title: "", issuer: "", category: "coursera", date: "", skills: "", file: null, fileDataUrl: "", fileName: "", fileType: "" });
    setShowForm(false);
  };

  const deleteCert = (id) => {
    if (!window.confirm("Remove this certificate?")) return;
    setCerts(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    if (previewCert?.id === id) setPreviewCert(null);
  };

  const filteredCerts = selectedCategory === "all"
    ? certs
    : certs.filter(c => c.category === selectedCategory);

  const getCategoryConfig = (key) => CERT_CATEGORIES.find(c => c.key === key) || CERT_CATEGORIES[5];

  return (
    <div className="certs-section">
      {/* Header */}
      <div className="certs-header">
        <div className="certs-title-row">
          <div className="certs-title">
            <div className="certs-icon-wrap">
              <i className="fa-solid fa-award"></i>
            </div>
            <div>
              <h2>Certifications & Achievements</h2>
              <p>{certs.length} achievement{certs.length !== 1 ? "s" : ""} earned</p>
            </div>
          </div>
          <button className="certs-add-btn" onClick={() => setShowForm(!showForm)}>
            <i className={`fa-solid fa-${showForm ? "xmark" : "plus"}`}></i>
            {showForm ? "Cancel" : "Add Certificate"}
          </button>
        </div>

        {/* Stats Row */}
        {certs.length > 0 && (
          <div className="certs-stats-row">
            {CERT_CATEGORIES.filter(cat => certs.some(c => c.category === cat.key)).map(cat => {
              const count = certs.filter(c => c.category === cat.key).length;
              return (
                <div key={cat.key} className="cert-mini-stat" style={{ "--cat-color": cat.color }}>
                  <span className="cert-mini-emoji">{cat.emoji}</span>
                  <span className="cert-mini-count" style={{ color: cat.color }}>{count}</span>
                  <span className="cert-mini-label">{cat.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="certs-form">
          <h3><i className="fa-solid fa-plus-circle"></i> Add New Certificate</h3>
          <div className="certs-form-grid">
            <div className="certs-form-group">
              <label>Certificate Title *</label>
              <input
                type="text"
                placeholder="e.g., Web Development Bootcamp"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="certs-form-group">
              <label>Issued By *</label>
              <input
                type="text"
                placeholder="e.g., Coursera, Google, IEEE"
                value={form.issuer}
                onChange={e => setForm({ ...form, issuer: e.target.value })}
              />
            </div>
            <div className="certs-form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CERT_CATEGORIES.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.emoji} {cat.label}</option>
                ))}
              </select>
            </div>
            <div className="certs-form-group">
              <label>Date Issued</label>
              <input
                type="month"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="certs-form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Skills (comma separated)</label>
              <input
                type="text"
                placeholder="e.g., React, Node.js, MongoDB"
                value={form.skills}
                onChange={e => setForm({ ...form, skills: e.target.value })}
              />
            </div>
            <div className="certs-form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Certificate File (PDF/Image)</label>
              <label className="certs-file-upload">
                {uploading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Uploading...</>
                ) : form.fileName ? (
                  <><i className="fa-solid fa-file-check"></i> {form.fileName}</>
                ) : (
                  <><i className="fa-solid fa-file-arrow-up"></i> Upload Certificate (Max 10MB)</>
                )}
                <input type="file" accept=".pdf,image/*" hidden onChange={handleFileChange} />
              </label>
            </div>
          </div>
          <div className="certs-form-actions">
            <button className="certs-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="certs-submit-btn" onClick={handleSubmit} disabled={uploading}>
              <i className="fa-solid fa-plus"></i> Add Certificate
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="certs-filters">
        <button
          className={`cert-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All ({certs.length})
        </button>
        {CERT_CATEGORIES.filter(cat => certs.some(c => c.category === cat.key)).map(cat => (
          <button
            key={cat.key}
            className={`cert-filter-btn ${selectedCategory === cat.key ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.key)}
            style={selectedCategory === cat.key ? { background: cat.color, color: "white", borderColor: cat.color } : {}}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Certificates Grid */}
      {certs.length === 0 ? (
        <div className="certs-empty">
          <div className="certs-empty-icon">🏅</div>
          <h3>No Certificates Yet</h3>
          <p>Add your hackathon wins, course completions, and achievements here.</p>
          <button className="certs-add-btn" onClick={() => setShowForm(true)}>
            <i className="fa-solid fa-plus"></i> Add Your First Certificate
          </button>
        </div>
      ) : (
        <div className="certs-grid">
          {filteredCerts.map((cert, idx) => {
            const catConfig = getCategoryConfig(cert.category);
            const badgeStyle = BADGE_COLORS[idx % BADGE_COLORS.length];
            return (
              <div
                key={cert.id}
                className="cert-card"
                style={{ "--cert-color": catConfig.color }}
              >
                <div className="cert-card-ribbon" style={{ background: catConfig.color }}></div>

                <div className="cert-card-header">
                  <div className="cert-category-icon" style={{ background: `${catConfig.color}18`, color: catConfig.color }}>
                    <i className={`fa-solid ${catConfig.icon}`}></i>
                  </div>
                  <div className="cert-card-actions-top">
                    {cert.fileDataUrl && (
                      <button className="cert-view-btn" onClick={() => setPreviewCert(cert)} title="View Certificate">
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    )}
                    <button className="cert-del-btn" onClick={() => deleteCert(cert.id)} title="Delete">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="cert-card-body">
                  <h3 className="cert-title">{cert.title}</h3>
                  <p className="cert-issuer">
                    <i className="fa-solid fa-building"></i>
                    {cert.issuer}
                  </p>
                  {cert.date && (
                    <p className="cert-date">
                      <i className="fa-solid fa-calendar"></i>
                      {new Date(cert.date + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>

                {cert.skills.length > 0 && (
                  <div className="cert-skills">
                    {cert.skills.slice(0, 4).map((skill, i) => {
                      const bs = BADGE_COLORS[i % BADGE_COLORS.length];
                      return (
                        <span
                          key={i}
                          className="cert-skill-tag"
                          style={{ background: bs.bg, color: bs.text, border: `1px solid ${bs.border}` }}
                        >
                          {skill}
                        </span>
                      );
                    })}
                    {cert.skills.length > 4 && (
                      <span className="cert-skill-tag" style={{ background: "#f1f5f9", color: "#64748b" }}>
                        +{cert.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="cert-card-footer">
                  <span className="cert-category-badge" style={{ background: `${catConfig.color}18`, color: catConfig.color }}>
                    {catConfig.emoji} {catConfig.label}
                  </span>
                  {cert.fileDataUrl ? (
                    <span className="cert-has-file">
                      <i className="fa-solid fa-file-check"></i> Certificate
                    </span>
                  ) : (
                    <span className="cert-no-file">No file</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <div className="cert-preview-overlay" onClick={() => setPreviewCert(null)}>
          <div className="cert-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="cert-preview-header">
              <div>
                <strong>{previewCert.title}</strong>
                <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "10px" }}>
                  — {previewCert.issuer}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <a href={previewCert.fileDataUrl} download={previewCert.fileName} className="cert-dl-btn">
                  <i className="fa-solid fa-download"></i>
                </a>
                <button className="cert-close-btn" onClick={() => setPreviewCert(null)}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
            <div className="cert-preview-body">
              {previewCert.fileType?.startsWith("image/") ? (
                <img src={previewCert.fileDataUrl} alt={previewCert.title} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />
              ) : (
                <iframe src={previewCert.fileDataUrl} title={previewCert.title} style={{ width: "100%", height: "70vh", border: "none" }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationsWidget;
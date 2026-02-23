import React, { useState, useRef } from "react";

const VAULT_CATEGORIES = [
  { key: "id_card",     label: "ID Card",       icon: "fa-id-card",          color: "#667eea", accept: "image/*,.pdf" },
  { key: "fee_receipt", label: "Fee Receipt",    icon: "fa-receipt",          color: "#10b981", accept: ".pdf,image/*" },
  { key: "abc_id",      label: "ABC ID",         icon: "fa-address-card",     color: "#f97316", accept: "image/*,.pdf" },
  { key: "marksheet",   label: "Marksheet",      icon: "fa-file-certificate", color: "#8b5cf6", accept: ".pdf,image/*" },
  { key: "leaving_cert",label: "Leaving Cert",   icon: "fa-file-signature",   color: "#06b6d4", accept: ".pdf,image/*" },
  { key: "other",       label: "Other Docs",     icon: "fa-folder-open",      color: "#f59e0b", accept: "*" },
];

const DocumentVault = ({ studentRollNo }) => {
  const storageKey = `doc_vault_${studentRollNo || "student"}`;
  const fileInputRefs = useRef({});

  const [docs, setDocs] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const handleFileUpload = (categoryKey, file) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be under 10MB");
      return;
    }

    setUploading(categoryKey);
    const reader = new FileReader();
    reader.onloadend = () => {
      const docData = {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString(),
      };
      setDocs(prev => {
        const updated = {
          ...prev,
          [categoryKey]: [...(prev[categoryKey] || []), docData],
        };
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
      setUploading(null);
    };
    reader.onerror = () => {
      alert("Failed to read file");
      setUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const deleteDoc = (categoryKey, index) => {
    if (!window.confirm("Remove this document?")) return;
    setDocs(prev => {
      const updated = { ...prev };
      updated[categoryKey] = [...(prev[categoryKey] || [])];
      updated[categoryKey].splice(index, 1);
      if (updated[categoryKey].length === 0) delete updated[categoryKey];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const totalDocs = Object.values(docs).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="vault-section">
      {/* Header */}
      <div className="vault-header">
        <div className="vault-title-row">
          <div className="vault-title">
            <div className="vault-icon-wrap">
              <i className="fa-solid fa-vault"></i>
            </div>
            <div>
              <h2>Document Vault</h2>
              <p>{totalDocs} document{totalDocs !== 1 ? "s" : ""} stored securely</p>
            </div>
          </div>
          <div className="vault-security-badge">
            <i className="fa-solid fa-shield-check"></i>
            Stored Locally
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="vault-grid">
        {VAULT_CATEGORIES.map(cat => {
          const catDocs = docs[cat.key] || [];
          const hasDoc = catDocs.length > 0;
          const isExpanded = activeCategory === cat.key;

          return (
            <div
              key={cat.key}
              className={`vault-card ${hasDoc ? "has-doc" : ""} ${isExpanded ? "expanded" : ""}`}
              style={{ "--cat-color": cat.color }}
            >
              <div
                className="vault-card-header"
                onClick={() => setActiveCategory(isExpanded ? null : cat.key)}
              >
                <div className="vault-card-icon" style={{ background: `${cat.color}18`, color: cat.color }}>
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <div className="vault-card-info">
                  <span className="vault-card-label">{cat.label}</span>
                  <span className="vault-card-count">
                    {catDocs.length > 0 ? `${catDocs.length} file${catDocs.length > 1 ? "s" : ""}` : "No files"}
                  </span>
                </div>
                <div className="vault-card-actions">
                  {hasDoc && (
                    <div
                      className="vault-status-dot"
                      style={{ background: cat.color }}
                      title="Documents uploaded"
                    ></div>
                  )}
                  <label
                    className="vault-upload-mini"
                    style={{ background: cat.color }}
                    title="Upload file"
                    onClick={e => e.stopPropagation()}
                  >
                    {uploading === cat.key ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-plus"></i>
                    )}
                    <input
                      type="file"
                      accept={cat.accept}
                      hidden
                      ref={el => fileInputRefs.current[cat.key] = el}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(cat.key, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"} vault-chevron`}></i>
                </div>
              </div>

              {/* Expanded doc list */}
              {isExpanded && (
                <div className="vault-doc-list">
                  {catDocs.length === 0 ? (
                    <div className="vault-empty-state">
                      <label className="vault-upload-zone">
                        <i className="fa-solid fa-file-arrow-up"></i>
                        <span>Click to upload {cat.label}</span>
                        <small>Max 10MB per file</small>
                        <input
                          type="file"
                          accept={cat.accept}
                          hidden
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) handleFileUpload(cat.key, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    catDocs.map((doc, idx) => (
                      <div key={idx} className="vault-doc-item">
                        <div className="vault-doc-icon">
                          {doc.type?.startsWith("image/") ? (
                            <img src={doc.dataUrl} alt={doc.name} className="vault-doc-thumb" />
                          ) : (
                            <i className="fa-solid fa-file-pdf" style={{ color: "#ef4444" }}></i>
                          )}
                        </div>
                        <div className="vault-doc-meta">
                          <span className="vault-doc-name" title={doc.name}>
                            {doc.name.length > 25 ? doc.name.substring(0, 22) + "..." : doc.name}
                          </span>
                          <span className="vault-doc-info">
                            {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                          </span>
                        </div>
                        <div className="vault-doc-btns">
                          <button
                            className="vault-preview-btn"
                            onClick={() => setPreviewDoc(doc)}
                            title="Preview"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <a
                            href={doc.dataUrl}
                            download={doc.name}
                            className="vault-download-btn"
                            title="Download"
                          >
                            <i className="fa-solid fa-download"></i>
                          </a>
                          <button
                            className="vault-delete-btn"
                            onClick={() => deleteDoc(cat.key, idx)}
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="vault-preview-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="vault-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="vault-preview-header">
              <span>{previewDoc.name}</span>
              <div style={{ display: "flex", gap: "10px" }}>
                <a href={previewDoc.dataUrl} download={previewDoc.name} className="vault-dl-btn">
                  <i className="fa-solid fa-download"></i> Download
                </a>
                <button className="vault-close-btn" onClick={() => setPreviewDoc(null)}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
            <div className="vault-preview-body">
              {previewDoc.type?.startsWith("image/") ? (
                <img src={previewDoc.dataUrl} alt={previewDoc.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />
              ) : previewDoc.type === "application/pdf" ? (
                <iframe src={previewDoc.dataUrl} title={previewDoc.name} style={{ width: "100%", height: "70vh", border: "none" }} />
              ) : (
                <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
                  <i className="fa-solid fa-file" style={{ fontSize: "64px", marginBottom: "16px", display: "block" }}></i>
                  <p>Preview not available for this file type</p>
                  <a href={previewDoc.dataUrl} download={previewDoc.name} style={{ color: "#667eea", fontWeight: "600" }}>
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
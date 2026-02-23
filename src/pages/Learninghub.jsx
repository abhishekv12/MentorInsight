import React, { useState, useEffect } from "react";
import axios from "axios";

// ============================================================
// LearningHub.jsx
// Student-side Learning Resources tab
// Faculty share images, videos, links, notes → students see them here
// Usage: <LearningHub student={student} />
// Add "learning" tab to StudentDashboard sidebar
// ============================================================

const MEDIA_COLORS = {
  image:   { bg: "#eff6ff", color: "#3b82f6", icon: "fa-image"       },
  video:   { bg: "#fef3c7", color: "#f59e0b", icon: "fa-circle-play"  },
  link:    { bg: "#f0fdf4", color: "#10b981", icon: "fa-link"          },
  note:    { bg: "#faf5ff", color: "#8b5cf6", icon: "fa-note-sticky"   },
  file:    { bg: "#fff7ed", color: "#f97316", icon: "fa-file-arrow-down"},
};

const TAG_COLORS = [
  "#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6",
  "#06b6d4","#f97316","#ec4899","#14b8a6","#84cc16",
];

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  return d === 1 ? "Yesterday" : `${d}d ago`;
};

// ─── Mock data (used when API is unavailable) ─────────────────
const MOCK_RESOURCES = [
  {
    _id: "m1",
    type: "video",
    title: "Data Structures — Linked List Deep Dive",
    description: "A comprehensive walkthrough of singly and doubly linked lists with visual animations. Must watch before next session.",
    url: "https://www.youtube.com/watch?v=WwfhLC16bis",
    thumbnail: "",
    tags: ["Data Structures", "Lecture", "Important"],
    sharedBy: "Prof. Sharma",
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    views: 34,
    isPinned: true,
  },
  {
    _id: "m2",
    type: "image",
    title: "Algorithm Complexity Cheat Sheet",
    description: "Quick reference card for Big-O notation. Print and keep it at your desk.",
    url: "https://placehold.co/800x500/6366f1/ffffff?text=Big-O+Cheat+Sheet",
    thumbnail: "https://placehold.co/800x500/6366f1/ffffff?text=Big-O+Cheat+Sheet",
    tags: ["Algorithms", "Reference"],
    sharedBy: "Prof. Sharma",
    createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
    views: 58,
    isPinned: false,
  },
  {
    _id: "m3",
    type: "link",
    title: "Operating System Concepts — GeeksForGeeks",
    description: "Complete OS notes covering scheduling, memory management and deadlocks.",
    url: "https://www.geeksforgeeks.org/operating-systems/",
    thumbnail: "",
    tags: ["OS", "Study Material"],
    sharedBy: "Prof. Desai",
    createdAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    views: 22,
    isPinned: false,
  },
  {
    _id: "m4",
    type: "note",
    title: "Exam Pattern — Semester VI (Important)",
    description: "Question distribution: Unit I (20%), Unit II (30%), Unit III (25%), Unit IV (25%). Long answer questions will be from Unit II and III. Practice previous papers.",
    url: "",
    thumbnail: "",
    tags: ["Exam", "Important", "Semester VI"],
    sharedBy: "Prof. Sharma",
    createdAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
    views: 91,
    isPinned: true,
  },
  {
    _id: "m5",
    type: "file",
    title: "Assignment 3 — Database Normalization",
    description: "Submit by end of next week. Must include ER diagram, 1NF through 3NF forms with proper explanation.",
    url: "#",
    thumbnail: "",
    tags: ["Assignment", "DBMS"],
    sharedBy: "Prof. Patil",
    createdAt: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
    views: 45,
    isPinned: false,
  },
  {
    _id: "m6",
    type: "video",
    title: "React Hooks — useState and useEffect Explained",
    description: "Practical tutorial for modern React development. Relevant for your final year project.",
    url: "https://www.youtube.com/watch?v=O6P86uwfdR0",
    thumbnail: "",
    tags: ["React", "Web Dev", "Project"],
    sharedBy: "Prof. Sharma",
    createdAt: new Date(Date.now() - 86400 * 1000 * 6).toISOString(),
    views: 29,
    isPinned: false,
  },
];

// ─── Resource Card ─────────────────────────────────────────
const ResourceCard = ({ resource, onExpand }) => {
  const meta = MEDIA_COLORS[resource.type] || MEDIA_COLORS.link;

  const handleAction = (e) => {
    e.stopPropagation();
    if (resource.url && resource.url !== "#") {
      window.open(resource.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={`lh-card ${resource.isPinned ? "lh-card-pinned" : ""}`} onClick={() => onExpand(resource)}>
      {resource.isPinned && (
        <div className="lh-pin-ribbon">
          <i className="fa-solid fa-thumbtack"></i> Pinned
        </div>
      )}

      {/* Thumbnail for images */}
      {resource.type === "image" && resource.thumbnail && (
        <div className="lh-card-thumb">
          <img src={resource.thumbnail} alt={resource.title} onError={e => { e.target.style.display = "none"; }} />
          <div className="lh-card-thumb-overlay">
            <i className="fa-solid fa-magnifying-glass-plus"></i>
          </div>
        </div>
      )}

      {/* Icon placeholder for non-image */}
      {(resource.type !== "image" || !resource.thumbnail) && (
        <div className="lh-card-icon-band" style={{ background: meta.bg }}>
          <div className="lh-card-icon-circle" style={{ background: meta.color + "18", color: meta.color }}>
            <i className={`fa-solid ${meta.icon}`}></i>
          </div>
          <span className="lh-type-label" style={{ color: meta.color }}>
            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
          </span>
        </div>
      )}

      <div className="lh-card-body">
        <h3 className="lh-card-title">{resource.title}</h3>
        <p className="lh-card-desc">{resource.description?.substring(0, 110)}{resource.description?.length > 110 ? "…" : ""}</p>

        {resource.tags?.length > 0 && (
          <div className="lh-card-tags">
            {resource.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="lh-tag" style={{ background: TAG_COLORS[i % TAG_COLORS.length] + "1a", color: TAG_COLORS[i % TAG_COLORS.length] }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="lh-card-footer">
          <div className="lh-card-meta">
            <span className="lh-card-author">
              <i className="fa-solid fa-user-tie"></i> {resource.sharedBy || "Faculty"}
            </span>
            <span className="lh-card-time">
              <i className="fa-regular fa-clock"></i> {timeAgo(resource.createdAt)}
            </span>
          </div>
          <div className="lh-card-actions">
            <span className="lh-views">
              <i className="fa-solid fa-eye"></i> {resource.views || 0}
            </span>
            {resource.url && resource.url !== "#" && (
              <button className="lh-open-btn" style={{ background: meta.color }} onClick={handleAction}>
                {resource.type === "video" && <><i className="fa-solid fa-play"></i> Watch</>}
                {resource.type === "image" && <><i className="fa-solid fa-eye"></i> View</>}
                {resource.type === "link"  && <><i className="fa-solid fa-arrow-up-right-from-square"></i> Open</>}
                {resource.type === "file"  && <><i className="fa-solid fa-download"></i> Download</>}
                {resource.type === "note"  && <><i className="fa-solid fa-eye"></i> Read</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Expand Modal ─────────────────────────────────────────────
const ResourceModal = ({ resource, onClose }) => {
  if (!resource) return null;
  const meta = MEDIA_COLORS[resource.type] || MEDIA_COLORS.link;

  const isYouTube = resource.url && (resource.url.includes("youtube.com") || resource.url.includes("youtu.be"));
  const getYTEmbed = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="lh-modal-overlay" onClick={onClose}>
      <div className="lh-modal-box" onClick={e => e.stopPropagation()}>
        <div className="lh-modal-header" style={{ borderBottom: `3px solid ${meta.color}` }}>
          <div className="lh-modal-title-row">
            <div className="lh-modal-type-icon" style={{ background: meta.bg, color: meta.color }}>
              <i className={`fa-solid ${meta.icon}`}></i>
            </div>
            <div>
              <h2 className="lh-modal-title">{resource.title}</h2>
              <span className="lh-modal-meta">
                Shared by <strong>{resource.sharedBy}</strong> · {timeAgo(resource.createdAt)}
              </span>
            </div>
          </div>
          <button className="lh-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="lh-modal-body">
          {/* YouTube embed */}
          {resource.type === "video" && isYouTube && (
            <div className="lh-embed-wrap">
              <iframe
                src={getYTEmbed(resource.url)}
                title={resource.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Direct video */}
          {resource.type === "video" && !isYouTube && resource.url && (
            <video className="lh-video-player" controls>
              <source src={resource.url} />
              Your browser does not support video playback.
            </video>
          )}

          {/* Image */}
          {resource.type === "image" && resource.url && (
            <div className="lh-image-view">
              <img src={resource.url} alt={resource.title} />
            </div>
          )}

          {/* Description */}
          {resource.description && (
            <p className="lh-modal-desc">{resource.description}</p>
          )}

          {/* Tags */}
          {resource.tags?.length > 0 && (
            <div className="lh-modal-tags">
              {resource.tags.map((tag, i) => (
                <span key={i} className="lh-tag lh-tag-lg" style={{ background: TAG_COLORS[i % TAG_COLORS.length] + "18", color: TAG_COLORS[i % TAG_COLORS.length] }}>
                  <i className="fa-solid fa-tag"></i> {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA for link/file */}
          {(resource.type === "link" || resource.type === "file") && resource.url && resource.url !== "#" && (
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="lh-modal-cta" style={{ background: meta.color }}>
              {resource.type === "link" && <><i className="fa-solid fa-arrow-up-right-from-square"></i> Open Link</>}
              {resource.type === "file" && <><i className="fa-solid fa-download"></i> Download File</>}
            </a>
          )}

          {/* Note full text */}
          {resource.type === "note" && (
            <div className="lh-note-full" style={{ borderLeft: `4px solid ${meta.color}` }}>
              <i className="fa-solid fa-note-sticky" style={{ color: meta.color }}></i>
              <p>{resource.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────
const LearningHub = ({ student }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [searchQ, setSearchQ]     = useState("");
  const [expanded, setExpanded]   = useState(null);

  const batchId  = student?.batchInfo?._id || student?.batchInfo?.batchId || "";
  const division = student?.division || "";

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line
  }, [batchId]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      if (!batchId) throw new Error("no batchId");
      const res = await axios.get(
        `http://localhost:5000/api/student/learning/${batchId}/${encodeURIComponent(division)}`,
      );
      if (res.data.success) {
        setResources(res.data.resources || []);
      } else {
        setResources(MOCK_RESOURCES);
      }
    } catch {
      // Fallback to mock data if API not yet set up
      setResources(MOCK_RESOURCES);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(r => {
    const matchType = filter === "all" || r.type === filter;
    const matchSearch = !searchQ ||
      r.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      r.tags?.some(t => t.toLowerCase().includes(searchQ.toLowerCase())) ||
      r.sharedBy?.toLowerCase().includes(searchQ.toLowerCase());
    return matchType && matchSearch;
  });

  const pinned    = filtered.filter(r => r.isPinned);
  const unpinned  = filtered.filter(r => !r.isPinned);
  const counts    = { all: resources.length, image: 0, video: 0, link: 0, note: 0, file: 0 };
  resources.forEach(r => { if (counts[r.type] !== undefined) counts[r.type]++; });

  const FILTERS = [
    { key: "all",   label: "All",    icon: "fa-layer-group"    },
    { key: "video", label: "Videos", icon: "fa-circle-play"    },
    { key: "image", label: "Images", icon: "fa-image"          },
    { key: "link",  label: "Links",  icon: "fa-link"           },
    { key: "note",  label: "Notes",  icon: "fa-note-sticky"    },
    { key: "file",  label: "Files",  icon: "fa-file-arrow-down"},
  ];

  return (
    <div className="lh-root">
      {/* ── Header ── */}
      <div className="lh-header">
        <div>
          <h2 className="lh-title">
            <i className="fa-solid fa-book-open-reader"></i> Learning Hub
          </h2>
          <p className="lh-subtitle">Resources, materials and media shared by your faculty</p>
        </div>
        <div className="lh-header-stats">
          <div className="lh-hstat">
            <span className="lh-hstat-val">{counts.all}</span>
            <span className="lh-hstat-label">Total</span>
          </div>
          <div className="lh-hstat">
            <span className="lh-hstat-val">{counts.video}</span>
            <span className="lh-hstat-label">Videos</span>
          </div>
          <div className="lh-hstat">
            <span className="lh-hstat-val">{pinned.length}</span>
            <span className="lh-hstat-label">Pinned</span>
          </div>
        </div>
      </div>

      {/* ── Filters + Search ── */}
      <div className="lh-toolbar">
        <div className="lh-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`lh-filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              <i className={`fa-solid ${f.icon}`}></i>
              {f.label}
              {counts[f.key] > 0 && <span className="lh-filter-count">{counts[f.key]}</span>}
            </button>
          ))}
        </div>
        <div className="lh-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            placeholder="Search resources, tags, faculty..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searchQ && (
            <button onClick={() => setSearchQ("")}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="lh-loading">
          <div className="lh-spinner"></div>
          <p>Loading learning resources…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lh-empty">
          <div className="lh-empty-icon">
            <i className="fa-solid fa-book-open"></i>
          </div>
          <h3>No Resources Yet</h3>
          <p>Your faculty hasn't shared any learning materials yet. Check back later!</p>
        </div>
      ) : (
        <>
          {/* Pinned */}
          {pinned.length > 0 && (
            <div className="lh-section">
              <div className="lh-section-header">
                <i className="fa-solid fa-thumbtack"></i> Pinned Resources
                <span>{pinned.length}</span>
              </div>
              <div className="lh-grid">
                {pinned.map(r => <ResourceCard key={r._id} resource={r} onExpand={setExpanded} />)}
              </div>
            </div>
          )}

          {/* All others */}
          {unpinned.length > 0 && (
            <div className="lh-section">
              {pinned.length > 0 && (
                <div className="lh-section-header">
                  <i className="fa-solid fa-layer-group"></i> All Resources
                  <span>{unpinned.length}</span>
                </div>
              )}
              <div className="lh-grid">
                {unpinned.map(r => <ResourceCard key={r._id} resource={r} onExpand={setExpanded} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Expand Modal ── */}
      {expanded && <ResourceModal resource={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
};

export default LearningHub;
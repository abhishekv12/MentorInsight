import React, { useState, useEffect } from "react";

const DEFAULT_TASKS = [
  { id: 1, text: "Submit Assignment", icon: "fa-file-check", category: "academic", priority: "high", dueDate: "", completed: false, isDefault: true },
  { id: 2, text: "Pay Exam Fees", icon: "fa-credit-card", category: "fees", priority: "urgent", dueDate: "", completed: false, isDefault: true },
  { id: 3, text: "Upload Documents", icon: "fa-file-arrow-up", category: "docs", priority: "medium", dueDate: "", completed: false, isDefault: true },
  { id: 4, text: "Project Submission", icon: "fa-diagram-project", category: "project", priority: "high", dueDate: "", completed: false, isDefault: true },
];

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", color: "#ef4444", bg: "#fef2f2", border: "#fca5a5" },
  high:   { label: "High",   color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  medium: { label: "Medium", color: "#eab308", bg: "#fefce8", border: "#fde68a" },
  low:    { label: "Low",    color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
};

const TodoWidget = ({ studentRollNo }) => {
  const storageKey = `todo_tasks_${studentRollNo || "student"}`;

  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_TASKS;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState({ text: "", priority: "medium", dueDate: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (!newTask.text.trim()) return;
    const task = {
      id: Date.now(),
      text: newTask.text.trim(),
      icon: "fa-circle-check",
      category: "custom",
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      completed: false,
      isDefault: false,
    };
    setTasks(prev => [task, ...prev]);
    setNewTask({ text: "", priority: "medium", dueDate: "" });
    setShowAddForm(false);
  };

  const resetDefaults = () => {
    setTasks(DEFAULT_TASKS.map(t => ({ ...t, completed: false })));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="todo-widget">
      {/* Header */}
      <div className="todo-header">
        <div className="todo-title-row">
          <div className="todo-title">
            <div className="todo-icon-wrap">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div>
              <h2>Academic Tasks</h2>
              <p>{completedCount}/{totalCount} completed</p>
            </div>
          </div>
          <div className="todo-header-actions">
            <button className="todo-reset-btn" onClick={resetDefaults} title="Reset to defaults">
              <i className="fa-solid fa-rotate-left"></i>
            </button>
            <button className="todo-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
              <i className={`fa-solid fa-${showAddForm ? "xmark" : "plus"}`}></i>
              {showAddForm ? "Cancel" : "Add Task"}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="todo-progress-wrap">
          <div className="todo-progress-bar">
            <div
              className="todo-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="todo-progress-label">{progress}%</span>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="todo-add-form">
          <input
            type="text"
            placeholder="Task description..."
            value={newTask.text}
            onChange={e => setNewTask({ ...newTask, text: e.target.value })}
            onKeyDown={e => e.key === "Enter" && addTask()}
            autoFocus
          />
          <div className="todo-form-row">
            <select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <button className="todo-save-btn" onClick={addTask}>
              <i className="fa-solid fa-check"></i> Add
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="todo-filters">
        {["all", "active", "done"].map(f => (
          <button
            key={f}
            className={`todo-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? `All (${totalCount})` : f === "active" ? `Pending (${tasks.filter(t => !t.completed).length})` : `Done (${completedCount})`}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="todo-list">
        {filteredTasks.length === 0 ? (
          <div className="todo-empty">
            <i className="fa-solid fa-party-horn"></i>
            <p>{filter === "done" ? "No completed tasks yet" : "All tasks completed! 🎉"}</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const pConfig = PRIORITY_CONFIG[task.priority];
            const overdue = isOverdue(task.dueDate);
            return (
              <div
                key={task.id}
                className={`todo-item ${task.completed ? "todo-done" : ""} ${overdue && !task.completed ? "todo-overdue" : ""}`}
                style={{ borderLeft: `3px solid ${pConfig.color}` }}
              >
                <button
                  className={`todo-checkbox ${task.completed ? "checked" : ""}`}
                  onClick={() => toggleTask(task.id)}
                  style={task.completed ? { background: pConfig.color, borderColor: pConfig.color } : { borderColor: pConfig.color }}
                >
                  {task.completed && <i className="fa-solid fa-check"></i>}
                </button>

                <div className="todo-item-content">
                  <div className="todo-item-main">
                    <i className={`fa-solid ${task.icon} todo-item-icon`} style={{ color: pConfig.color }}></i>
                    <span className="todo-item-text">{task.text}</span>
                  </div>
                  <div className="todo-item-meta">
                    <span className="todo-priority-tag" style={{ background: pConfig.bg, color: pConfig.color, border: `1px solid ${pConfig.border}` }}>
                      {pConfig.label}
                    </span>
                    {task.dueDate && (
                      <span className={`todo-due-date ${overdue && !task.completed ? "overdue" : ""}`}>
                        <i className="fa-solid fa-calendar-xmark"></i>
                        {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {overdue && !task.completed && " (Overdue)"}
                      </span>
                    )}
                  </div>
                </div>

                <button className="todo-delete-btn" onClick={() => deleteTask(task.id)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      {tasks.length > 0 && (
        <div className="todo-footer">
          <button
            className="todo-clear-done"
            onClick={() => setTasks(prev => prev.filter(t => !t.completed))}
          >
            <i className="fa-solid fa-broom"></i> Clear completed
          </button>
          <span className="todo-streak">
            <i className="fa-solid fa-fire"></i>
            {completedCount > 0 ? `${completedCount} done today` : "Start completing tasks!"}
          </span>
        </div>
      )}
    </div>
  );
};

export default TodoWidget;

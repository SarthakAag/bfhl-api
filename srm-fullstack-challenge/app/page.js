"use client";
import { useState } from "react";

export default function Home() {

// state stuff — might refactor later if it grows
const [textInput, setTextInput] = useState(""); // renamed slightly
const [apiResult, setApiResult] = useState(null);
const [errMsg, setErrMsg] = useState(""); // shorter name, feels more natural
const [isLoading, setIsLoading] = useState(false);

// handles submit click
const handleSubmitClick = async () => {

// reset everything before calling API
setErrMsg("");
setApiResult(null);
setIsLoading(true);

// splitting input manually (could've used regex but meh, this is clearer for now)
let rawList = textInput.split(",");
let cleanedList = [];

for (let i = 0; i < rawList.length; i++) {
  let val = rawList[i].trim();
  if (val) {
    cleanedList.push(val);
  }
}

// console.log("Sending data:", cleanedList); // debug — might need later

try {
  const response = await fetch("/api/bfhl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data: cleanedList })
  });

  // honestly not sure if backend always sends proper status, so keeping this
  if (!response.ok) {
    throw new Error("Something off with API");
  }

  const json = await response.json();

  // storing result
  setApiResult(json);

} catch (e) {
  // generic error — could improve later with better messages
  setErrMsg("Something went wrong. Please try again.");
  // console.error(e); // keeping this commented for now
} finally {
  setIsLoading(false);
}

};

// recursive tree renderer (works fine but might get messy for deep trees)
const renderTreeView = (treeObj, level = 0) => {

const entries = Object.entries(treeObj);

return entries.map(([key, value]) => {

  // slight inline styling (yeah... not ideal but quick)
  const margin = level * 20;

  return (
    <div key={key} style={{ marginLeft: margin }}>
      <span className="node">{key}</span>

      {/* only render children if present */}
      {Object.keys(value).length > 0
        ? renderTreeView(value, level + 1)
        : null
      }
    </div>
  );
});

};

return (
<main className="container">

  {/* header section */}
  <div className="header">
    <h1>🌳 BFHL Tree Visualizer</h1>
    <p>Enter node edges to build and visualize hierarchical trees</p>
  </div>

  {/* input card */}
  <div className="card">
    <label className="label">Enter Node Edges (comma separated)</label>

    <textarea
      className="textarea"
      rows={4}
      placeholder="e.g. A->B, A->C, B->D, C->E"
      value={textInput}
      onChange={(e) => {
        setTextInput(e.target.value);
      }}
    />

    <button
      className="btn"
      onClick={handleSubmitClick}
      disabled={isLoading || !textInput.trim()}
    >
      {isLoading ? "Processing..." : "Submit"}
    </button>
  </div>

  {/* error block */}
  {errMsg && <div className="error">{errMsg}</div>}

  {/* results section */}
  {apiResult && (
    <div className="results">

      {/* identity */}
      <div className="card info-card">
        <h2>👤 Identity</h2>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">User ID</span>
            <span className="info-value">{apiResult.user_id}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{apiResult.email_id}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Roll Number</span>
            <span className="info-value">{apiResult.college_roll_number}</span>
          </div>
        </div>
      </div>

      {/* summary section */}
      <div className="card">
        <h2>📊 Summary</h2>

        <div className="summary-grid">
          <div className="summary-box green">
            <div className="summary-num">{apiResult.summary.total_trees}</div>
            <div className="summary-label">Total Trees</div>
          </div>

          <div className="summary-box red">
            <div className="summary-num">{apiResult.summary.total_cycles}</div>
            <div className="summary-label">Total Cycles</div>
          </div>

          <div className="summary-box blue">
            <div className="summary-num">{apiResult.summary.largest_tree_root}</div>
            <div className="summary-label">Largest Tree Root</div>
          </div>
        </div>
      </div>

      {/* hierarchy */}
      <div className="card">
        <h2>🌲 Hierarchies</h2>

        <div className="hierarchy-grid">
          {apiResult.hierarchies.map((item, idx) => {

            const hasCycle = item.has_cycle;

            return (
              <div
                key={idx}
                className={`hierarchy-card ${hasCycle ? "cycle" : ""}`}
              >
                <div className="hierarchy-header">
                  <span className="root-badge">Root: {item.root}</span>

                  {hasCycle && <span className="cycle-badge">⚠ Cycle</span>}

                  {/* depth might be undefined sometimes */}
                  {item.depth && (
                    <span className="depth-badge">Depth: {item.depth}</span>
                  )}
                </div>

                <div className="tree-view">
                  {hasCycle ? (
                    <span className="cycle-msg">
                      Cyclic group — no tree structure
                    </span>
                  ) : (
                    renderTreeView(item.tree)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* invalid + duplicates */}
      <div className="two-col">

        <div className="card">
          <h2>❌ Invalid Entries</h2>

          {apiResult.invalid_entries.length === 0 ? (
            <p className="empty">None</p>
          ) : (
            <div className="tag-list">
              {apiResult.invalid_entries.map((val, i) => (
                <span key={i} className="tag invalid">{val}</span>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>🔁 Duplicate Edges</h2>

          {apiResult.duplicate_edges.length === 0 ? (
            <p className="empty">None</p>
          ) : (
            <div className="tag-list">
              {apiResult.duplicate_edges.map((val, i) => (
                <span key={i} className="tag duplicate">{val}</span>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )}
</main>

);
}
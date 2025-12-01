import React, { useEffect, useState } from "react";
import styles from "./SystemContext.module.css";
import { API_BASE, ENDPOINTS } from "../apiConfig";

export default function SystemContext({ chatHash }) {
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  // Load system context on mount
  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch(API_BASE + ENDPOINTS.getSystemContext, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hash_plain_text: chatHash }),
        });

        const data = await res.json();

        if (data.status && data.system_context) {
          setContext(data.system_context);
        }
      } catch (error) {
        console.error("Error loading system context", error);
      } finally {
        setLoading(false);
      }
    }

    if (chatHash) fetchContext();
  }, [chatHash]);

  // Save updated context
  async function saveContext() {
    setSaveStatus("");

    try {
      const res = await fetch(API_BASE + ENDPOINTS.setSystemContext, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hash_plain_text: chatHash,
          system_context: context,
        }),
      });

      const data = await res.json();

      if (data.status) {
        setSaveStatus("System Context Saved");
        setTimeout(() => setSaveStatus(""), 2000);
      }
    } catch (error) {
      console.error("Error saving system context", error);
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>SLR Context</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <textarea
            className={styles.textarea}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Enter here the context of your research, so I can refine my answers based on it!"
          />

          <button className={styles.saveButton} onClick={saveContext}>
            Save
          </button>

          {saveStatus && (
            <div className={styles.successMessage}>{saveStatus}</div>
          )}
        </>
      )}
    </div>
  );
}

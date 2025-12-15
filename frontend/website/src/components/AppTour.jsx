import Joyride, { STATUS, ACTIONS } from "react-joyride";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const TOUR_STORAGE_KEY = "slrmentor_tour_stepIndex_v1";

function Example({ title, text }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #444",
          borderRadius: 10,
          padding: "10px 12px",
          whiteSpace: "pre-wrap",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default function AppTour({ run, setRun }) {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

  // ✅ Controlled step index so we can resume exactly where the user left off
  const [stepIndex, setStepIndex] = useState(0);

  // When the tour starts, load the saved step index (resume)
  useEffect(() => {
    if (!run) return;

    const raw = localStorage.getItem(TOUR_STORAGE_KEY);
    const saved = raw != null ? Number(raw) : 0;
    setStepIndex(Number.isFinite(saved) && saved >= 0 ? saved : 0);
  }, [run]);

  const steps = useMemo(() => {
    const common = [
      {
        target: "#nav-home",
        content: "This is the SLRmentor logo/home link.",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: "#nav-about-slrs",
        content: "Open the About SLRs reference panel.",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: "#nav-how-to",
        content: "This button starts the guided tour.",
        placement: "bottom",
        disableBeacon: true,
      },
    ];

    if (!isChatPage) return common;

    const chat = [
      {
        target: "#chat-id-display",
        content:
          "This is your current Chat ID (session hash). Save it if you want to return to this session again.",
        placement: "bottom",
        disableBeacon: true,
      },

      {
        target: "#tabs-container",
        content: "These are the three specialized chat tabs.",
        placement: "bottom",
        disableBeacon: true,
      },

      {
        target: "#system-context",
        placement: "top",
        disableBeacon: true,
        content: (
          <div>
            <div>
              This is <b>SLR Context</b>. Add key background (goals, constraints, definitions) so SLRmentor can tailor
              responses.
            </div>
            <Example
              title="Example SLR Context"
              text="The goal of my study is to examine the effects of phone usage on young children and how it affects their social skills."
            />
            <Example
              title="Another example"
              text="My research question is: What is the most power-efficient software architecture for building web applications?"
            />
          </div>
        ),
      },
      {
        target: "#system-context-save",
        placement: "top",
        disableBeacon: true,
        content: "Click Save to store your SLR Context for this chat session.",
      },

      // Mentor tab
      {
        target: "#tab-mentor",
        content: "Mentor Chat is for general SLR questions.",
        placement: "bottom",
        meta: { tab: "mentor" },
        disableBeacon: true,
      },
      {
        target: "#mentor-chat-history",
        content: "Mentor chat history.",
        placement: "top",
        meta: { tab: "mentor" },
        disableBeacon: true,
      },
      {
        target: "#mentor-chat-input",
        placement: "top",
        meta: { tab: "mentor" },
        disableBeacon: true,
        content: (
          <div>
            Type your question here using natural language (like ChatGPT).
            <Example
              title="Example questions"
              text={"What is a systematic literature review?\nHow do I begin my systematic literature review?"}
            />
          </div>
        ),
      },
      {
        target: "#mentor-send-button",
        content: "Click Send to submit your message.",
        placement: "left",
        meta: { tab: "mentor" },
        disableBeacon: true,
      },

      // Search String tab
      {
        target: "#tab-search-string",
        content: "Generate and refine search strings here.",
        placement: "bottom",
        meta: { tab: "searchString" },
        disableBeacon: true,
      },
      {
        target: "#search-chat-history",
        content: "Search String chat history.",
        placement: "top",
        meta: { tab: "searchString" },
        disableBeacon: true,
      },
      {
        target: "#search-chat-input",
        placement: "top",
        meta: { tab: "searchString" },
        disableBeacon: true,
        content: (
          <div>
            Provide your research question/topic description, then ask the bot to generate a search string.
            <Example
              title="Example prompt"
              text={
                "My research question is: What is the most power-efficient software architecture for building web applications?\nPlease generate a search string for academic databases."
              }
            />
            <Example
              title="Example refinement prompt"
              text={"Can you add synonyms and improve the Boolean logic?\nAlso make it slightly more restrictive."}
            />
          </div>
        ),
      },
      {
        target: "#search-send-button",
        content: "Click Send to generate/refine the search string.",
        placement: "left",
        meta: { tab: "searchString" },
        disableBeacon: true,
      },
      {
        target: "#search-string-panel",
        content: "Generated search string appears here.",
        placement: "top",
        meta: { tab: "searchString" },
        disableBeacon: true,
      },
      {
        target: "#search-string-different-formats",
        content: "Convert your search string to other formats.",
        placement: "top",
        meta: { tab: "searchString" },
        disableBeacon: true,
      },
      {
        target: "#search-string-copy",
        content: "Copy your search string.",
        placement: "top",
        meta: { tab: "searchString" },
        disableBeacon: true,
      },

      // Criteria tab
      {
        target: "#tab-criteria",
        content: "Generate inclusion/exclusion criteria here.",
        placement: "bottom",
        meta: { tab: "criteria" },
        disableBeacon: true,
      },
      {
        target: "#criteria-chat-history",
        content: "Criteria chat history.",
        placement: "top",
        meta: { tab: "criteria" },
        disableBeacon: true,
      },
      {
        target: "#criteria-chat-input",
        placement: "top",
        meta: { tab: "criteria" },
        disableBeacon: true,
        content: (
          <div>
            Describe your study goal/research question to generate inclusion/exclusion criteria, and refine iteratively.
            <Example
              title="Example prompt"
              text={
                "My study is about the effects of phone usage on young children and how it affects their social skills.\nPlease generate inclusion and exclusion criteria for this review."
              }
            />
            <Example
              title="Example refinement prompt"
              text={
                "Can you explain why each exclusion criterion is necessary?\nAlso add criteria about publication years and language."
              }
            />
          </div>
        ),
      },
      {
        target: "#criteria-send-button",
        content: "Click Send to generate/refine criteria.",
        placement: "left",
        meta: { tab: "criteria" },
        disableBeacon: true,
      },
      {
        target: "#criteria-output",
        content: "Generated criteria appear here below the chat.",
        placement: "top",
        meta: { tab: "criteria" },
        disableBeacon: true,
      },
      {
        target: "#criteria-copy",
        content: "Copy your criteria.",
        placement: "top",
        meta: { tab: "criteria" },
        disableBeacon: true,
      },
    ];

    return [...common, ...chat];
  }, [isChatPage]);

  const handleCallback = (data) => {
    const { status, type, step, action, index } = data;

    // ✅ Save the step you are ABOUT to show (so resume returns to the same step)
    if (type === "step:before" && typeof index === "number") {
      localStorage.setItem(TOUR_STORAGE_KEY, String(index));
    }

    // Switch tabs BEFORE a step renders (so targets exist)
    if (type === "step:before" && step?.meta?.tab) {
      window.__setActiveChatTab?.(step.meta.tab);
    }

    // ✅ If user clicks X, stop tour but keep saved stepIndex (resume later)
    if (action === ACTIONS.CLOSE) {
      setRun(false);
      return;
    }

    // ✅ Handle next/prev ourselves (controlled mode)
    if (type === "step:after") {
      if (action === ACTIONS.NEXT) setStepIndex((prev) => prev + 1);
      if (action === ACTIONS.PREV) setStepIndex((prev) => Math.max(0, prev - 1));
    }

    // ✅ If a target is missing, advance to the next step instead of breaking
    if (type === "target:notFound") {
      setStepIndex((prev) => prev + 1);
    }

    // ✅ If tour ends normally, clear saved progress
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.removeItem(TOUR_STORAGE_KEY);
      setStepIndex(0);
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleCallback}
      continuous
      showSkipButton
      showProgress
      showCloseButton
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      disableBeacon
      styles={{
        options: {
          zIndex: 10000,
          backgroundColor: "#2c2c2c",
          textColor: "#ffffff",
          width: 360,
          primaryColor: "#ff0000ff",
          overlayColor: "rgba(0, 0, 0, 0.65)",
          arrowColor: "#2c2c2c",
        },
        buttonNext: {
          backgroundColor: "#b10000ff",
          border: "1px solid #444",
          color: "#fff",
          borderRadius: "10px",
          padding: "0.6rem 1rem",
          fontWeight: 600,
        },
        buttonBack: { color: "#aaa", marginRight: 8 },
        buttonSkip: { color: "#aaa" },
        tooltip: {
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        },
        tooltipContent: { fontSize: "0.95rem", lineHeight: 1.5 },
        tooltipFooter: { marginTop: "0.75rem" },
        spotlight: { borderRadius: "12px" },
      }}
    />
  );
}

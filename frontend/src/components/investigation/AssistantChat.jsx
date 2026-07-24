/**
 * AssistantChat - chat UI bound to a case (Section 11.4/12/31). MVP is
 * backed by the rule-based responder in the backend `assistant` app -
 * always cites evidence IDs (Section 31's "explainable" requirement).
 * Empty state shows suggested starter questions as clickable chips
 * (Section 34).
 */
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { queryAssistant } from "../../api/assistant.js";
import { extractErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import Button from "../common/Button.jsx";

const STARTER_QUESTIONS = ["What changed before this?", "What's the current confidence?", "What's the strongest signal?"];

export default function AssistantChat({ caseId, onSelectEvidence }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const { showToast } = useToast();

  const ask = async (text) => {
    if (!text.trim()) return;
    setAsking(true);
    setMessages((prev) => [...prev, { role: "user", text }]);
    try {
      const result = await queryAssistant(caseId, text);
      setMessages((prev) => [...prev, { role: "assistant", text: result.answer, citedIds: result.cited_evidence_ids }]);
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setAsking(false);
      setQuestion("");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Sparkles size={13} aria-hidden="true" /> Ask a question about this case
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_QUESTIONS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => ask(starter)}
                  className="rounded-full border border-border-subtle px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {messages.map((message, index) => (
            <li key={index} className={message.role === "user" ? "self-end text-right" : ""}>
              <div
                className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user" ? "bg-accent-primary text-white" : "border border-border-subtle bg-surface text-text-primary"
                }`}
              >
                {message.text}
              </div>
              {message.citedIds?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {message.citedIds.map((evidenceId) => (
                    <button
                      key={evidenceId}
                      onClick={() => onSelectEvidence(evidenceId)}
                      className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-accent-primary hover:bg-accent-primary/10"
                    >
                      #{evidenceId}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
        className="mt-3 flex gap-2"
      >
        <label className="sr-only" htmlFor="assistant-question">
          Ask the assistant
        </label>
        <input
          id="assistant-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about this case…"
          className="flex-1 rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />
        <Button type="submit" loading={asking}>
          Ask
        </Button>
      </form>
    </div>
  );
}

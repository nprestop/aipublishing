import React from "react";

function ConversationHistory({ history }) {
  return (
    <div className="conversation-history">
      <h3 className="history-title">Conversation History</h3>
      <div className="history-box">
        {history.length === 0 ? (
          <p className="muted small">No questions yet.</p>
        ) : (
          [...history].reverse().map((entry, i) => (
            <div key={i} className="history-entry">
              <p className="history-question"><strong>Q:</strong> {entry.prompt}</p>
              <p className="history-answer"><strong>A:</strong> {entry.response}</p>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ConversationHistory;

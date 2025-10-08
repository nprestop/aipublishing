import React, { useState } from "react";

function Response({ loading, error, out }) {
    if (loading) return <div className="response">⏳ Thinking…</div>;
    if (error) return <div className="response error"> {error}</div>;
    if (!out)
        return (
            <div className="response">
                <span className="muted">Results show here…</span>
            </div>
        );

    return (
        <div className="response">
            <div className="response-title">Response</div>
            <div className="response-body">
                {out.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>
        </div>
    );
}

export default Response;
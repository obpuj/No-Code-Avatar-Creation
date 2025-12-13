// src/app/persona-builder/page.js
"use client";
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateAPI } from '../../lib/api';

export default function PersonaBuilder() {
  const searchParams = useSearchParams();
  const avatarUrl = searchParams.get('avatar');

  const [prompt, setPrompt] = useState('');
  const [personaPrompt, setPersonaPrompt] = useState('');
  const [knowledgeContext, setKnowledgeContext] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Build persona object - use custom prompt if provided, otherwise use persona_key
      const persona = {
        id: personaPrompt ? undefined : 'professional', // Only use id if no custom prompt
        voice: 'en-US-GuyNeural',
        ...(personaPrompt && { prompt: personaPrompt }), // Add custom prompt if provided
        ...(personaPrompt && { persona_prompt: personaPrompt }) // Also add persona_prompt for compatibility
      };
      
      // Pass knowledge context as nodeGraph
      const nodeGraph = knowledgeContext.trim() || null;
      
      const result = await generateAPI.generate(prompt, persona, nodeGraph);
      setResponse(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ color: "white", padding: 50, minHeight: '100vh', background: '#0b0c0f' }}>
      <h1>Persona Builder</h1>

      {avatarUrl ? (
        <div style={{ marginBottom: 30 }}>
          <p>Avatar URL: <span style={{ color: "#0f0" }}>{avatarUrl}</span></p>
        </div>
      ) : (
        <p style={{ color: "red" }}>No avatar URL found.</p>
      )}

      <div style={{ marginTop: 50 }}>
        <h2>Test AI Generation</h2>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
            Persona Prompt (optional)
          </label>
          <textarea
            value={personaPrompt}
            onChange={(e) => setPersonaPrompt(e.target.value)}
            placeholder="e.g., You are a friendly customer service agent... (Leave empty for default 'professional' persona)"
            style={{
              width: '100%',
              minHeight: 60,
              padding: 10,
              marginBottom: 20,
              background: '#1a1a1a',
              color: 'white',
              border: '1px solid #333',
              borderRadius: 5
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
            Knowledge Context (optional)
          </label>
          <textarea
            value={knowledgeContext}
            onChange={(e) => setKnowledgeContext(e.target.value)}
            placeholder="e.g., Company policies, product information, FAQ content... (This will be used as the knowledge base)"
            style={{
              width: '100%',
              minHeight: 100,
              padding: 10,
              marginBottom: 20,
              background: '#1a1a1a',
              color: 'white',
              border: '1px solid #333',
              borderRadius: 5
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
            User Prompt (required)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to generate AI response..."
            style={{
              width: '100%',
              minHeight: 100,
              padding: 10,
              marginBottom: 20,
              background: '#1a1a1a',
              color: 'white',
              border: '1px solid #333',
              borderRadius: 5
            }}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          style={{
            padding: '10px 20px',
            background: loading ? '#666' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Generate Response'}
        </button>

        {error && (
          <div style={{ color: 'red', marginTop: 20 }}>
            Error: {error}
          </div>
        )}

        {response && (
          <div style={{ marginTop: 30, padding: 20, background: '#1a1a1a', borderRadius: 5 }}>
            <h3>AI Response:</h3>
            <p>{response.text}</p>
            {response.audio && (
              <div style={{ marginTop: 20 }}>
                <audio controls>
                  <source src={`data:audio/mpeg;base64,${response.audio}`} type="audio/mpeg" />
                </audio>
              </div>
            )}
            {response.signals && (
              <div style={{ marginTop: 20 }}>
                <h4>Behavior Signals:</h4>
                <pre style={{ background: '#333', padding: 10, borderRadius: 3 }}>
                  {JSON.stringify(response.signals, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
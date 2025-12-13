"use client";

import React, { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AvatarStage } from "../AvatarStage";
import { AvatarHardcoded } from "../AvatarHardcoded";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { generateAPI } from "../../lib/api";

// Error Boundary for 3D components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AvatarStage error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      );
    }

    return this.props.children;
  }
}

function AvatarViewer() {
  const searchParams = useSearchParams();
  const avatarUrlParam = searchParams.get('avatar') || searchParams.get('test');
  
  // Default test avatar URL if none provided
  const defaultAvatarUrl = "https://models.readyplayer.me/64e4a4b0e7c0a8a1c8b4b5c5.glb";
  const avatarUrl = avatarUrlParam || defaultAvatarUrl;
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBehavior, setCurrentBehavior] = useState('idle');
  const [currentAudio, setCurrentAudio] = useState(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null); // Track current audio to prevent overlapping
  const playedAudioSet = useRef(new Set()); // Track which audio has been played
  
  // Persona and Knowledge Context state - specific fields
  const [personaTraits, setPersonaTraits] = useState('');
  const [speakingStyle, setSpeakingStyle] = useState('');
  const [expertise, setExpertise] = useState('');
  const [tone, setTone] = useState('');
  
  const [companyInfo, setCompanyInfo] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [faqs, setFaqs] = useState('');
  const [policies, setPolicies] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  
  // Build persona prompt from specific fields
  const personaPrompt = useMemo(() => {
    const parts = [];
    if (personaTraits.trim()) parts.push(`Personality: ${personaTraits.trim()}`);
    if (speakingStyle.trim()) parts.push(`Speaking style: ${speakingStyle.trim()}`);
    if (expertise.trim()) parts.push(`Expertise/Role: ${expertise.trim()}`);
    if (tone.trim()) parts.push(`Tone: ${tone.trim()}`);
    return parts.join('. ');
  }, [personaTraits, speakingStyle, expertise, tone]);
  
  // Build knowledge context from specific fields
  const knowledgeContext = useMemo(() => {
    const parts = [];
    if (companyInfo.trim()) parts.push(`Company Information:\n${companyInfo.trim()}`);
    if (productDetails.trim()) parts.push(`Product/Service Details:\n${productDetails.trim()}`);
    if (faqs.trim()) parts.push(`Frequently Asked Questions:\n${faqs.trim()}`);
    if (policies.trim()) parts.push(`Policies and Procedures:\n${policies.trim()}`);
    return parts.join('\n\n');
  }, [companyInfo, productDetails, faqs, policies]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    
    // Add user message only once - prevent duplicates
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      // Don't add if this exact message was just added
      if (lastMessage && lastMessage.role === 'user' && lastMessage.text === userMessage) {
        return prev;
      }
      return [...prev, { role: 'user', text: userMessage }];
    });
    
    setCurrentBehavior('talking');

    let result = null; // Declare outside try block so it's accessible in finally
    
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
      
      result = await generateAPI.generate(userMessage, persona, nodeGraph);

      // Update behavior based on signals
      // Map backend gesture signals to AvatarStage behaviors
      if (result.signals) {
        const gesture = result.signals.gesture || 'idle';
        // AvatarStage supports: 'idle', 'talking', 'wave'
        if (gesture === 'wave') {
          setCurrentBehavior('wave');
        } else if (gesture === 'talk_excited' || gesture === 'talk_casual' || gesture === 'talk') {
          setCurrentBehavior('talk');
        } else {
          setCurrentBehavior('idle');
        }
      } else {
        // Default to talking when audio is playing
        setCurrentBehavior('talk');
      }

      // Set audio for lip sync - ONLY play after response is generated, and ONLY ONCE
      if (result.audio) {
        const audioSrc = `data:audio/mpeg;base64,${result.audio}`;
        
        // Stop any currently playing audio to prevent overlap
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
        
        // Check if this audio has already been played - DO NOT REPLAY
        if (!playedAudioSet.current.has(audioSrc)) {
          // Mark as played
          playedAudioSet.current.add(audioSrc);
          
          // Create new audio instance
          const audio = new Audio(audioSrc);
          audioRef.current = audio;
          
          // Set audio for lip sync
          setCurrentAudio(audioSrc);
          
          // Play audio only once
          audio.play().catch(err => {
            console.log("Audio play failed (user interaction may be needed):", err);
          });
          
          // Reset to idle when audio finishes
          audio.addEventListener('ended', () => {
            setCurrentBehavior('idle');
            audioRef.current = null;
          });
          
          audio.addEventListener('error', () => {
            setCurrentBehavior('idle');
            audioRef.current = null;
          });
        } else {
          // Audio already played, just set it for lip sync but don't play
          setCurrentAudio(audioSrc);
        }
      }

      // Add assistant message only once, check for duplicates
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        // Don't add if the last message is the same assistant response
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.text === (result.text || 'No response')) {
          return prev;
        }
        return [...prev, { 
          role: 'assistant', 
          text: result.text || 'No response',
          audio: result.audio 
        }];
      });
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Error: ${error.message}` 
      }]);
      setCurrentBehavior('idle');
    } finally {
      setLoading(false);
      // If no audio was provided, reset to idle after a short delay
      if (!result?.audio) {
        setTimeout(() => {
          setCurrentBehavior('idle');
        }, 2000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Note: We always have a default avatar now, so this check is mostly for edge cases
  if (!avatarUrl) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh",
        flexDirection: "column",
        gap: 20
      }}>
        <h2 style={{ color: "#fff", fontSize: 24 }}>No Avatar URL Provided</h2>
        <p style={{ color: "rgba(255,255,255,0.7)" }}>Please export an avatar from Ready Player Me first.</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
          Or visit: <a href="/avatar_page?test=1" style={{ color: "#0070f3" }}>/avatar_page?test=1</a> to use a test avatar
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0b0c0f", display: "flex" }}>
      {/* 3D Avatar Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas
          camera={{ position: [0, 1.5, 3], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Suspense fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="orange" />
            </mesh>
          }>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, -5]} intensity={0.5} />
            <ErrorBoundary>
              {currentBehavior === 'wave' || currentBehavior === 'nod' ? (
                <AvatarHardcoded 
                  avatarUrl={avatarUrl} 
                  behavior={currentBehavior}
                />
              ) : (
                <AvatarStage 
                  avatarUrl={avatarUrl} 
                  behavior={currentBehavior}
                  audioSrc={currentAudio}
                />
              )}
            </ErrorBoundary>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>

      {/* Chat Panel */}
      <div style={{
        width: 400,
        background: "rgba(20, 20, 20, 0.95)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        color: "#fff"
      }}>
        {/* Chat Header */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          fontWeight: 700,
          fontSize: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>Chat with Avatar</span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500
            }}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.3)",
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto"
          }}>
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#fff" }}>
                👤 Avatar Personality
              </h3>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                Answer these questions to customize how your avatar behaves and speaks
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  1. What personality traits should the avatar have?
                </label>
                <input
                  type="text"
                  value={personaTraits}
                  onChange={(e) => setPersonaTraits(e.target.value)}
                  placeholder="e.g., Friendly, professional, empathetic, enthusiastic"
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  Describe the avatar's character (e.g., "warm and approachable" or "confident and knowledgeable")
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  2. How should the avatar speak?
                </label>
                <input
                  type="text"
                  value={speakingStyle}
                  onChange={(e) => setSpeakingStyle(e.target.value)}
                  placeholder="e.g., Conversational, formal, casual, technical"
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  Describe the speaking style (e.g., "uses simple language" or "explains technical concepts clearly")
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  3. What is the avatar's role or expertise?
                </label>
                <input
                  type="text"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="e.g., Customer service agent, product expert, sales representative"
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  What is their job title or area of expertise?
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  4. What tone should the avatar use?
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g., Helpful, supportive, enthusiastic, calm"
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  How should the avatar sound? (e.g., "always positive and encouraging")
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#fff" }}>
                📚 Knowledge Base
              </h3>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                Provide information the avatar should know to answer questions accurately
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  1. Company Information
                </label>
                <textarea
                  value={companyInfo}
                  onChange={(e) => setCompanyInfo(e.target.value)}
                  placeholder="e.g., Company name, mission, values, history, location..."
                  style={{
                    width: "100%",
                    minHeight: 50,
                    padding: "6px 8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  Basic information about your company
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  2. Product/Service Details
                </label>
                <textarea
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                  placeholder="e.g., Product names, features, pricing, specifications, benefits..."
                  style={{
                    width: "100%",
                    minHeight: 50,
                    padding: "6px 8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  What products or services do you offer? Include key details
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  3. Frequently Asked Questions
                </label>
                <textarea
                  value={faqs}
                  onChange={(e) => setFaqs(e.target.value)}
                  placeholder="e.g., Q: What is your return policy? A: We offer 30-day returns..."
                  style={{
                    width: "100%",
                    minHeight: 50,
                    padding: "6px 8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  Common questions and their answers
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  4. Policies and Procedures
                </label>
                <textarea
                  value={policies}
                  onChange={(e) => setPolicies(e.target.value)}
                  placeholder="e.g., Shipping policy, refund policy, terms of service, privacy policy..."
                  style={{
                    width: "100%",
                    minHeight: 50,
                    padding: "6px 8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  Important policies, procedures, or guidelines the avatar should know
                </div>
              </div>
              
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 12, padding: 8, background: "rgba(0,0,0,0.2)", borderRadius: 4 }}>
                💡 Tip: The more specific information you provide, the better the avatar can answer questions accurately!
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          {messages.length === 0 && (
            <div style={{
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              marginTop: 40,
              fontSize: 14
            }}>
              Start a conversation with your avatar...
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: 12,
                background: msg.role === 'user' 
                  ? "rgba(226, 59, 59, 0.2)" 
                  : "rgba(255,255,255,0.1)",
                border: msg.role === 'user'
                  ? "1px solid rgba(226, 59, 59, 0.3)"
                  : "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{
              alignSelf: 'flex-start',
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <div style={{ fontSize: 14 }}>Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: "20px",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{ display: "flex", gap: 10 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
                resize: "none",
                minHeight: 50,
                maxHeight: 120,
                fontFamily: "inherit"
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: "12px 24px",
                background: loading || !input.trim() 
                  ? "rgba(226, 59, 59, 0.3)" 
                  : "#e23b3b",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14,
                alignSelf: "flex-end"
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh",
        background: "#0b0c0f",
        color: "#fff"
      }}>
        Loading Avatar...
      </div>
    }>
      <AvatarViewer />
    </Suspense>
  );
}
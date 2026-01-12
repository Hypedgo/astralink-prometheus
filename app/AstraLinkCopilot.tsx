'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    source?: 'voice' | 'text';
}

interface CopilotProps {
    latitude: number;
    longitude: number;
    locationName: string;
}

export default function AstraLinkCopilot({ latitude, longitude, locationName }: CopilotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '🛰️ AstraLink Copilot online. How can I assist with your mission today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load voices on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    setIsListening(false);
                    setTimeout(() => sendMessage(transcript, 'voice'), 100);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, []);

    // Update greeting when location changes
    useEffect(() => {
        setMessages([
            {
                role: 'assistant',
                content: `🛰️ AstraLink Copilot online for ${locationName}. How can I assist with your mission today?`,
                timestamp: new Date()
            }
        ]);
    }, [locationName]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true);
            setInput('');
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const speak = (text: string) => {
        if (!voiceEnabled) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();

        const britishVoice = voices.find(voice =>
            (voice.lang.includes('en-GB') || voice.lang.includes('en-UK')) &&
            (voice.name.includes('Female') || voice.name.includes('female') || voice.name.includes('Samantha') || voice.name.includes('Kate') || voice.name.includes('Serena'))
        );

        const anyBritishVoice = voices.find(voice =>
            voice.lang.includes('en-GB') || voice.lang.includes('en-UK')
        );

        if (britishVoice) {
            utterance.voice = britishVoice;
        } else if (anyBritishVoice) {
            utterance.voice = anyBritishVoice;
        }

        utterance.rate = 1.15;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const toggleVoice = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setVoiceEnabled(!voiceEnabled);
    };

    const sendMessage = async (messageText?: string, source: 'voice' | 'text' = 'text') => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || isProcessing) return;

        const userMessage: Message = {
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
            source
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsProcessing(true);

        try {
            const response = await fetch('http://localhost:8000/api/copilot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: textToSend,
                    latitude: latitude,
                    longitude: longitude,
                    location_name: locationName
                })
            });

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                source: 'text'
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (source === 'voice' && voiceEnabled) {
                speak(data.response);
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsProcessing(false);
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        zIndex: 1000,
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.9) 0%, rgba(0, 150, 255, 0.9) 100%)',
                        border: '3px solid rgba(0, 217, 255, 0.5)',
                        boxShadow: '0 8px 32px rgba(0, 217, 255, 0.4), 0 0 20px rgba(0, 217, 255, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '35px',
                        transition: 'all 0.3s ease',
                        animation: 'float 3s ease-in-out infinite'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 217, 255, 0.6), 0 0 30px rgba(0, 217, 255, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.4), 0 0 20px rgba(0, 217, 255, 0.3)';
                    }}
                >
                    🦒
                </button>
            )}

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    zIndex: 1000,
                    width: '400px',
                    maxHeight: '300px',
                    background: 'rgba(0, 20, 40, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 200, 255, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid rgba(0, 200, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '24px', marginRight: '10px' }}>🦒</span>
                            <div>
                                <div style={{
                                    color: '#00d9ff',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>
                                    ASTRALINK COPILOT
                                </div>
                                <div style={{
                                    color: '#64748b',
                                    fontSize: '10px',
                                    marginTop: '2px'
                                }}>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        background: isSpeaking ? '#eab308' : isListening ? '#ef4444' : '#22c55e',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        marginRight: '6px',
                                        boxShadow: `0 0 8px ${isSpeaking ? '#eab308' : isListening ? '#ef4444' : '#22c55e'}`,
                                        animation: (isSpeaking || isListening) ? 'pulse 1s infinite' : 'none'
                                    }}></span>
                                    {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : locationName}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                                onClick={toggleVoice}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: voiceEnabled ? '#00d9ff' : '#64748b',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    transition: 'color 0.2s'
                                }}
                                title={voiceEnabled ? 'Voice ON (click to stop)' : 'Voice OFF'}
                            >
                                {voiceEnabled ? '🔊' : '🔇'}
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#64748b',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    lineHeight: '1',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#00d9ff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%'
                                }}
                            >
                                <div style={{
                                    background: msg.role === 'user'
                                        ? 'rgba(0, 217, 255, 0.2)'
                                        : 'rgba(100, 116, 139, 0.2)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(0, 217, 255, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    color: 'white',
                                    fontSize: '13px',
                                    lineHeight: 1.5,
                                    whiteSpace: 'pre-line'
                                }}>
                                    {msg.source === 'voice' && msg.role === 'user' && (
                                        <span style={{ fontSize: '10px', opacity: 0.7, marginRight: '6px' }}>🎤</span>
                                    )}
                                    {msg.content}
                                </div>
                                <div style={{
                                    fontSize: '10px',
                                    color: '#64748b',
                                    marginTop: '4px',
                                    textAlign: msg.role === 'user' ? 'right' : 'left'
                                }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {isProcessing && (
                            <div style={{
                                alignSelf: 'flex-start',
                                color: '#64748b',
                                fontSize: '13px',
                                fontStyle: 'italic'
                            }}>
                                🦒 AstraLink is thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{
                        padding: '16px',
                        borderTop: '1px solid rgba(0, 200, 255, 0.2)',
                        display: 'flex',
                        gap: '10px'
                    }}>
                        <button
                            onClick={isListening ? stopListening : startListening}
                            disabled={isProcessing}
                            style={{
                                background: isListening
                                    ? 'rgba(239, 68, 68, 0.3)'
                                    : 'rgba(0, 217, 255, 0.2)',
                                border: `1px solid ${isListening ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0, 217, 255, 0.3)'}`,
                                borderRadius: '6px',
                                padding: '10px',
                                color: 'white',
                                fontSize: '18px',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
                                animation: isListening ? 'pulse 1s infinite' : 'none'
                            }}
                            title="Voice input"
                        >
                            🎤
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage(undefined, 'text')}
                            placeholder={isListening ? 'Listening...' : 'Type or speak...'}
                            disabled={isProcessing || isListening}
                            style={{
                                flex: 1,
                                background: 'rgba(0, 20, 40, 0.6)',
                                border: '1px solid rgba(0, 200, 255, 0.3)',
                                borderRadius: '6px',
                                padding: '10px',
                                color: 'white',
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={() => sendMessage(undefined, 'text')}
                            disabled={isProcessing || !input.trim() || isListening}
                            style={{
                                background: isProcessing ? 'rgba(100, 116, 139, 0.3)' : 'rgba(0, 217, 255, 0.3)',
                                border: '1px solid rgba(0, 217, 255, 0.5)',
                                borderRadius: '6px',
                                padding: '10px 20px',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </>
    );
}
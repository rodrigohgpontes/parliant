"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_RECORDING_DURATION = 60; // 1 minute in seconds

interface AudioRecorderProps {
    onTranscriptionComplete: (text: string) => void;
    onCancel: () => void;
}

export function AudioRecorder({ onTranscriptionComplete, onCancel }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number>();
    const streamRef = useRef<MediaStream | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Detect if we're on a mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            console.log('Device type:', isMobile ? 'mobile' : 'desktop');

            // List supported MIME types
            const supportedTypes = [
                'audio/webm',
                'audio/webm;codecs=opus',
                'audio/mp4',
                'audio/mpeg',
                'audio/ogg;codecs=opus'
            ];

            console.log('Supported MIME types:', supportedTypes.filter(type => MediaRecorder.isTypeSupported(type)));

            // Choose the best supported MIME type
            let mimeType = undefined;
            if (isMobile) {
                // Try mobile-friendly formats first
                if (MediaRecorder.isTypeSupported('audio/mp4')) {
                    mimeType = 'audio/mp4';
                } else if (MediaRecorder.isTypeSupported('audio/mpeg')) {
                    mimeType = 'audio/mpeg';
                } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                    mimeType = 'audio/ogg;codecs=opus';
                }
            }

            // Fallback to webm if no mobile format is supported
            if (!mimeType && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (!mimeType && MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            }

            console.log('Selected MIME type:', mimeType);

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                audioBitsPerSecond: 128000 // Set a consistent bitrate
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    console.log('Received audio chunk:', {
                        size: event.data.size,
                        type: event.data.type
                    });
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: mimeType || 'audio/webm'
                });

                console.log('Final audio blob:', {
                    size: audioBlob.size,
                    type: audioBlob.type,
                    chunks: audioChunksRef.current.length
                });

                await transcribeAudio(audioBlob);
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            };

            // Request data every second to ensure we get chunks
            mediaRecorder.start(1000);
            setIsRecording(true);
            setRecordingDuration(0);
            startTimeRef.current = Date.now();

            // Start timer with requestAnimationFrame for more precise timing
            const updateTimer = () => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                if (elapsed >= MAX_RECORDING_DURATION) {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                        mediaRecorderRef.current.stop();
                    }
                    setIsRecording(false);
                    return;
                }
                setRecordingDuration(elapsed);
                timerRef.current = requestAnimationFrame(updateTimer);
            };

            timerRef.current = requestAnimationFrame(updateTimer);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            // Show a more user-friendly error message
            alert('Unable to access microphone. Please make sure you have granted microphone permissions and try again.');
            onCancel();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
            }
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);

            console.log('Sending audio for transcription:', {
                size: audioBlob.size,
                type: audioBlob.type
            });

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 400 && data.error?.includes('too large')) {
                    alert('Recording is too long. Please keep it under 1 minute.');
                } else {
                    console.error('Transcription failed:', data);
                    throw new Error('Transcription failed');
                }
                onCancel();
                return;
            }

            const data = await response.json();
            console.log('Transcription received:', data);
            onTranscriptionComplete(data.text);
        } catch (error) {
            console.error('Error transcribing audio:', error);
            alert('Failed to transcribe audio. Please try again.');
            onCancel();
        } finally {
            setIsTranscribing(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatRemainingTime = (seconds: number) => {
        const remaining = MAX_RECORDING_DURATION - seconds;
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Start recording immediately when component mounts
    useEffect(() => {
        startRecording();
    }, []);

    if (isTranscribing) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Transcribing...</span>
                </div>
                <Button
                    onClick={onCancel}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {isRecording ? (
                <>
                    <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm">
                            {formatDuration(recordingDuration)} / 1:00
                        </span>
                    </div>
                    <Button
                        onClick={stopRecording}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                    >
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording
                    </Button>
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                </>
            ) : (
                <Button
                    onClick={startRecording}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={isTranscribing}
                >
                    <Mic className="h-4 w-4 mr-2" />
                    Answer with Audio
                </Button>
            )}
        </div>
    );
} 
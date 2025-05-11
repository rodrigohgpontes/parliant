import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

// Maximum file size for 1 minute of audio (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as Blob;

        if (!audioFile) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        // Check file size
        if (audioFile.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "Audio file is too large. Maximum recording time is 1 minute." },
                { status: 400 }
            );
        }

        // Log audio file details for debugging
        console.log('Received audio file:', {
            size: audioFile.size,
            type: audioFile.type
        });

        // Convert blob to buffer
        const buffer = Buffer.from(await audioFile.arrayBuffer());

        // Create a temporary file with the appropriate extension based on the MIME type
        const extension = audioFile.type === 'audio/mp4' ? 'mp4' : 'webm';
        const tempFile = new File([buffer], `audio.${extension}`, { type: audioFile.type });

        // Transcribe using OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: tempFile,
            model: "whisper-1",
        });

        // Log successful transcription
        console.log('Transcription successful:', {
            text: transcription.text
        });

        return NextResponse.json({ text: transcription.text });
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return NextResponse.json(
            { error: "Failed to transcribe audio. Please try again." },
            { status: 500 }
        );
    }
} 
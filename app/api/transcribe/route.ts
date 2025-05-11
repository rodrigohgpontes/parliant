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
        console.log('Converted to buffer:', {
            bufferSize: buffer.length,
            bufferType: typeof buffer
        });

        // Determine the correct file extension and MIME type
        let extension = 'webm';
        let mimeType = 'audio/webm';

        if (audioFile.type.includes('mp4')) {
            extension = 'mp4';
            mimeType = 'audio/mp4';
        } else if (audioFile.type.includes('mpeg')) {
            extension = 'mp3';
            mimeType = 'audio/mpeg';
        } else if (audioFile.type.includes('ogg')) {
            extension = 'ogg';
            mimeType = 'audio/ogg';
        }

        console.log('Using file format:', { extension, mimeType });

        // Create a temporary file
        const tempFile = new File([buffer], `audio.${extension}`, { type: mimeType });
        console.log('Created temporary file:', {
            name: tempFile.name,
            type: tempFile.type,
            size: tempFile.size
        });

        // Transcribe using OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: tempFile,
            model: "whisper-1",
            language: "en", // Specify English language
            response_format: "text" // Request plain text response
        });

        // Log successful transcription
        console.log('Transcription successful:', {
            text: transcription,
            textLength: transcription.length
        });

        if (!transcription || transcription.trim().length === 0) {
            console.warn('Received empty transcription');
            return NextResponse.json(
                { error: "Received empty transcription. Please try again." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text: transcription });
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return NextResponse.json(
            { error: "Failed to transcribe audio. Please try again." },
            { status: 500 }
        );
    }
} 
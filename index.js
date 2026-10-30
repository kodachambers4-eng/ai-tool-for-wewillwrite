#!/usr/bin/env node

import WebSocket from 'ws';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure required environment variables are set
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY is missing in your environment.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Capture Duck.ai Room ID from terminal arguments
const roomId = process.argv[2];
if (!roomId) {
  console.log("Usage: npx duckai-agent <duckai-room-id-or-url>");
  process.exit(1);
}

// Clean the room ID if a full URL was provided
const cleanRoomId = roomId.split('/').pop();
const DUCKAI_WS_URL = `wss://backend.duck.ai/room/${cleanRoomId}/ws`; 

console.log(`🦆 Connecting AI Agent to Duck.ai room: ${cleanRoomId}...`);

const ws = new WebSocket(DUCKAI_WS_URL);

ws.on('open', () => {
  console.log("✅ Successfully joined the Duck.ai room as an AI collaborator!");
  
  // Send an initial greeting broadcast to the room
  const joinMessage = {
    type: "presence",
    user: "AI-Collaborator-Bot",
    text: "Hello! I am your AI assistant. Type code or ask questions, and I will help live."
  };
  ws.send(JSON.stringify(joinMessage));
});

ws.on('message', async (data) => {
  try {
    const event = JSON.parse(data);
    
    // Listen for code edits or direct chat messages in the room
    if (event.type === 'code_change' && event.userId !== 'AI-Collaborator-Bot') {
      console.log(`🤖 Analyzing incoming code change from user...`);
      
      const aiResponse = await generateAICodeCompletion(event.currentCode);
      
      if (aiResponse) {
        // Broadcast the AI's real-time code update back to the Duck.ai room
        const updateMessage = {
          type: 'code_change',
          userId: 'AI-Collaborator-Bot',
          currentCode: aiResponse
        };
        ws.send(JSON.stringify(updateMessage));
        console.log("⚡ Sent AI updates back to the Duck.ai room.");
      }
    }
  } catch (err) {
    console.error("Error processing room event:", err);
  }
});

ws.on('close', () => {
  console.log("🔌 Disconnected from Duck.ai room.");
});

ws.on('error', (error) => {
  console.error("WebSocket Error:", error);
});

// Helper function to process the room's code canvas
async function generateAICodeCompletion(userCode) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert AI pair programmer inside a Duck.ai live session. Review the user's code, fix any bugs, optimize it, or complete unfinished snippets. Return ONLY the updated code block without markdown wrappers." },
        { role: "user", content: userCode }
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return null;
  }
}

# Duck.ai AI Agent Collaborator 🦆

A lightweight GitHub tool to hook up an OpenAI-powered AI agent directly into your live, multi-user Duck.ai coding workspace.

## Setup Instructions

1. Clone this repository to your local machine.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## How to Run

Pass your live Duck.ai room ID (or the full room share URL) directly to the script:

```bash
node index.js <your-duck-room-id>
```

The script will launch, establish a persistent WebSocket connection to Duck.ai, and actively listen for live text mutations. As you type, the AI will continuously evaluate the canvas state and automatically push live code enhancements back into your session.

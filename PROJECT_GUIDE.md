# PdfWizard - Complete Project Guide (Interview Ready)

> Everything you need to know about this project, explained simply.

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [The Big Picture - How It Works](#2-the-big-picture---how-it-works)
3. [Tech Stack - What Tools We Used](#3-tech-stack---what-tools-we-used)
4. [Project Structure - Where Everything Lives](#4-project-structure---where-everything-lives)
5. [The RAG Pipeline - The Brain of the App](#5-the-rag-pipeline---the-brain-of-the-app)
6. [Database - How We Store Data](#6-database---how-we-store-data)
7. [API Routes - The Server Endpoints](#7-api-routes---the-server-endpoints)
8. [Frontend Components - The UI Pieces](#8-frontend-components---the-ui-pieces)
9. [State Management - How We Track Things](#9-state-management---how-we-track-things)
10. [Multi-Model Support - Choosing an AI Brain](#10-multi-model-support---choosing-an-ai-brain)
11. [Security - Keeping Secrets Safe](#11-security---keeping-secrets-safe)
12. [Streaming - Real-Time Responses](#12-streaming---real-time-responses)
13. [File Handling - How PDFs Are Managed](#13-file-handling---how-pdfs-are-managed)
14. [Styling - How It Looks](#14-styling---how-it-looks)
15. [Key Design Decisions](#15-key-design-decisions)
16. [Common Interview Questions & Answers](#16-common-interview-questions--answers)

---

## 1. What Is This Project?

**PdfWizard** is a web app that lets you **upload PDF files and have a conversation with them using AI**.

Think of it like this: Imagine you have a 200-page textbook. Instead of reading all 200 pages to find one answer, you just ask the app a question and it finds the exact part of the book that has your answer, then explains it to you.

**Key features:**
- Upload one or many PDF files
- Ask questions about the content in natural language
- Get AI-powered answers with page number citations
- Choose from 20+ AI models (OpenAI, Anthropic, Google, DeepSeek)
- Dark/light mode
- Multiple chat sessions with different PDFs
- Add more PDFs to an existing conversation

---

## 2. The Big Picture - How It Works

The entire app can be understood in **3 phases**:

### Phase 1: Upload & Index (Happens Once Per PDF)
```
User uploads PDF
       |
       v
Server saves the file locally (uploads/ folder)
       |
       v
PDF text is extracted page by page
       |
       v
Text is split into small chunks (like paragraphs)
       |
       v
Each chunk is converted into numbers (embeddings) using OpenAI
       |
       v
Numbers are stored in Pinecone (a vector database)
```

**Analogy:** Imagine cutting a book into small flashcards, writing a summary number on each card, and organizing them in a filing cabinet where similar cards are near each other.

### Phase 2: Ask a Question (Happens Every Time You Chat)
```
User types a question
       |
       v
AI reformulates the question (resolves "it", "that", etc.)
       |
       v
Question is converted to numbers (embedding)
       |
       v
Pinecone finds the most similar chunks from Phase 1
       |
       v
Top 8 matching chunks become "context"
       |
       v
Context + question + chat history are sent to the AI model
       |
       v
AI generates an answer using ONLY the provided context
       |
       v
Answer streams back to the user in real-time
```

**Analogy:** You ask a librarian a question. The librarian doesn't guess - they look through the filing cabinet, pull out the most relevant flashcards, read them, and then give you an answer based only on what those cards say.

### Phase 3: Storage (Happens After Each Response)
```
User message saved to SQLite database
AI response saved to SQLite database
Source citations (which pages were used) saved to SQLite database
Message count incremented
```

---

## 3. Tech Stack - What Tools We Used

### The Framework: Next.js 14 (App Router)
- **What it is:** A React framework that handles both the frontend (what you see) and backend (the server logic) in one project.
- **Why we use it:** It gives us server-side rendering, API routes, file-based routing, and server components all in one package. No need for a separate backend server.
- **App Router:** The newer way Next.js handles pages. Each folder inside `app/` becomes a URL route.

### The Language: TypeScript
- **What it is:** JavaScript but with types - you define what shape your data should be.
- **Why we use it:** Catches bugs before they happen. If a function expects a number and you pass a string, TypeScript yells at you before your code even runs.

### The AI Framework: LangChain
- **What it is:** A framework that makes it easy to build AI applications. It provides building blocks (chains, retrievers, prompts) that you can connect like LEGO.
- **Why we use it:** It handles the complex pipeline of converting questions to embeddings, searching vector databases, and generating responses. Without it, we'd write hundreds of lines of boilerplate.

### The Vector Database: Pinecone
- **What it is:** A database that stores "vectors" (arrays of numbers) and finds similar ones really fast.
- **Why we use it:** Normal databases search by exact matches ("find me John"). Pinecone searches by meaning ("find me stuff about people"). When you ask "What causes climate change?", it finds chunks about global warming, CO2 emissions, etc. - even if those exact words aren't in your question.

### The Database: SQLite + Drizzle ORM
- **SQLite:** A tiny database that lives in a single file (`sqlite.db`). No separate database server needed.
- **Drizzle ORM:** A tool that lets you write database queries using TypeScript instead of raw SQL. Instead of `SELECT * FROM users WHERE id = 'x'`, you write `db.select().from(users).where(eq(users.id, 'x'))`.
- **Why we use it:** Perfect for a local-first app. Zero configuration, just a file on disk.

### The AI Models
- **OpenAI** (GPT-5.2, GPT-5, GPT-4.1, etc.)
- **Anthropic** (Claude Opus 4.6, Sonnet 4.6, Haiku 4.5)
- **Google** (Gemini 3.1 Pro, 3 Flash, 2.5 Pro, 2.5 Flash)
- **DeepSeek** (R1 Reasoner, V3 Chat)

### The UI
- **Tailwind CSS:** Utility-first CSS framework ("add `text-red-500` instead of writing CSS").
- **shadcn/ui:** Pre-built, customizable UI components built on Radix (accessible, keyboard-friendly).
- **Radix UI:** Low-level accessible UI primitives (dialogs, selects, tooltips that work with screen readers and keyboards).

### State Management
- **Zustand:** A tiny global state manager. Think of it as a shared whiteboard that any component can read from or write to.
- **TanStack React Query:** Manages server state - handles fetching data, caching, and keeping the UI in sync with the server.

---

## 4. Project Structure - Where Everything Lives

```
chat-with-pdf/
├── app/                        # PAGES & API ROUTES (Next.js App Router)
│   ├── layout.tsx              # The "wrapper" around every page (fonts, themes, providers)
│   ├── page.tsx                # Landing page (the first page you see)
│   ├── globals.css             # Global styles & CSS variables for theming
│   │
│   ├── chat/[[...chatId]]/     # The chat page (the main feature)
│   │   ├── page.tsx            # Fetches data, renders PDF viewer + chat
│   │   ├── layout.tsx          # Adds sidebar and header around chat
│   │   └── _actions/chat.ts   # Server-side helper functions for the chat page
│   │
│   └── api/                    # BACKEND API ROUTES
│       ├── chat/               # Send a message, get AI response
│       ├── create-chat/        # Upload PDFs, create a new chat
│       ├── upload-file/        # Upload a single PDF file
│       ├── add-file-to-chat/   # Add a PDF to existing chat
│       ├── get-messages/       # Fetch message history
│       ├── remove-messages/    # Delete a chat and all its data
│       ├── serve-pdf/          # Serve PDF files to the browser
│       ├── user/initialize/    # Create default user, load chats
│       ├── db-events/          # Real-time event stream (SSE)
│       └── send-email/         # Send contact form emails
│
├── components/                 # REUSABLE UI PIECES
│   ├── chat-interface.tsx      # The chat box (messages + input)
│   ├── chat-sidebar.tsx        # Left sidebar with chat list
│   ├── pdf-viewer.tsx          # PDF display with tabs for multi-file
│   ├── file-upload.tsx         # Drag-and-drop upload area
│   ├── model-selector.tsx      # AI model dropdown
│   ├── header.tsx              # Top navigation bar
│   ├── messages/               # Message display components
│   ├── dialogs/                # Settings & sources popups
│   ├── icons/                  # Custom SVG icons for each AI provider
│   └── ui/                     # Base UI components (buttons, inputs, etc.)
│
├── lib/                        # BACKEND LOGIC (the "brain")
│   ├── langchain.ts            # The RAG pipeline (retrieval + generation)
│   ├── context.ts              # Vector search + context building
│   ├── embeddings.ts           # Converts text to number arrays
│   ├── prompts.ts              # Instructions for the AI model
│   ├── crypto.ts               # Encrypts/decrypts API keys
│   ├── local-storage.ts        # Saves/loads files from disk
│   ├── db/schema.ts            # Database table definitions
│   ├── db/index.ts             # Database connection
│   └── account.ts              # User management
│
├── store/                      # GLOBAL STATE
│   └── app-store.ts            # Zustand store (chats, settings, API keys)
│
├── providers/                  # REACT CONTEXT PROVIDERS
│   ├── query-provider.tsx      # React Query setup
│   ├── user-provider.tsx       # User initialization on app load
│   └── db-events-provider.tsx  # Server-Sent Events connection
│
├── constants/
│   └── models.ts               # All AI model definitions
│
├── types/
│   └── index.ts                # Shared TypeScript types
│
├── drizzle/                    # Database migration files
├── uploads/                    # Where uploaded PDFs are saved
└── sqlite.db                   # The SQLite database file
```

### Understanding the `[[...chatId]]` Route

This is a **catch-all optional route**:
- `/chat` → Shows the upload screen (no chatId)
- `/chat/abc123` → Shows chat with ID "abc123"
- The double brackets `[[` make it optional, single brackets `[` would make it required.

---

## 5. The RAG Pipeline - The Brain of the App

**RAG = Retrieval-Augmented Generation**

This is the most important concept in the project. Let's break it down piece by piece.

### What is RAG?

Normal AI (like ChatGPT) answers from what it learned during training. It doesn't know about YOUR documents. RAG fixes this by:
1. **Retrieving** relevant information from your documents
2. **Augmenting** the AI's prompt with that information
3. **Generating** an answer based on your actual documents

### Step 1: Document Ingestion (Indexing)

**File:** `app/api/create-chat/route.ts` → calls functions in `lib/`

When you upload a PDF:

1. **Text Extraction** (`pdf-parse` library)
   - The PDF is parsed page by page
   - Each page's text is extracted
   - Page numbers are tracked

2. **Text Splitting** (`RecursiveCharacterTextSplitter`)
   - Why? AI models have token limits. A 200-page PDF is too big to send all at once.
   - Text is split into **chunks of ~1000 characters** with **200 characters of overlap**.
   - Overlap means the end of chunk 1 and the start of chunk 2 share some text. This prevents cutting a sentence in half and losing meaning.
   - Separators used (in order): `\n\n` (paragraph), `\n` (line), `.` (sentence), `!`, `?`, `;`
   - Chunks shorter than 50 characters are discarded (they're too small to be useful).

   ```
   Example: A 5000-character document gets split into ~5 chunks:
   Chunk 1: characters 0-1000
   Chunk 2: characters 800-1800    ← overlaps with chunk 1!
   Chunk 3: characters 1600-2600   ← overlaps with chunk 2!
   ...and so on
   ```

3. **Embedding** (`text-embedding-3-small` model from OpenAI)
   - Each chunk of text is sent to OpenAI's embedding API
   - It returns an array of **1536 numbers** (a "vector") that represents the *meaning* of that text
   - Similar meanings → similar numbers
   - "The cat sat on the mat" and "A feline rested on a rug" would have very similar vectors

4. **Storage in Pinecone**
   - Each vector is stored with an ID: `fileKey#md5hash`
   - Metadata includes: original text, page number, file key, chunk length, preview
   - Stored in a **namespace** matching the chat ID (so each chat's documents are separate)

### Step 2: The Two-Chain Retrieval (Querying)

**File:** `lib/langchain.ts`

When you ask a question, **two AI calls happen in sequence**:

#### Chain 1: Standalone Question Chain (Non-Streaming)

**Problem it solves:** If your chat history is:
- You: "What is photosynthesis?"
- AI: "Photosynthesis is the process by which plants..."
- You: "How efficient is it?"

The question "How efficient is it?" is meaningless without context. What is "it"?

**Solution:** Chain 1 reformulates "How efficient is it?" into "How efficient is photosynthesis as described in the document?"

**The prompt template** (`QUESTION_TEMPLATE`):
```
Given the conversation and a follow-up question, rephrase it to be standalone.
- Replace pronouns (it, this, that) with actual nouns
- Keep all specific terms and names
- Make it self-contained for document search
```

#### Chain 2: Answer Chain (Streaming)

1. The reformulated question is embedded (turned into numbers)
2. Pinecone finds the **top 8 most similar chunks** from the PDF
3. These chunks become the "context"
4. Everything is sent to the AI model with `ANSWER_TEMPLATE`:

```
You are an AI assistant for analyzing PDFs.
Here is the context from the document: [retrieved chunks]
Here is the chat history: [previous messages]
Answer using ONLY the context. If you don't have enough info, say so.
Don't make anything up!
```

5. The AI generates an answer, which **streams** back to the user token by token

### Vector Similarity Search Details

**File:** `lib/context.ts`

The search uses **cosine similarity** (built into Pinecone):
- Scores range from 0 (completely different) to 1 (identical meaning)
- **Adaptive threshold**: If there are >5 matches, minimum score is 0.65; otherwise 0.60
- **Fallback**: If no matches pass the threshold, return top 2 anyway
- **Deduplication**: Chunks with identical first 50 characters are deduplicated
- **Context limit**: Final context is capped at 5000 characters
- Chunks shorter than 50 characters are filtered out

---

## 6. Database - How We Store Data

### Engine: SQLite with WAL Mode

**Why SQLite?**
- No separate database server to run. It's just a file (`sqlite.db`).
- Perfect for local-first, single-user apps.
- **WAL mode** (Write-Ahead Logging): Allows reading and writing at the same time without blocking. Without WAL, a write operation would lock the entire database.

### ORM: Drizzle

Instead of writing raw SQL:
```sql
SELECT * FROM messages WHERE chat_id = 'abc' ORDER BY created_at ASC;
```

We write TypeScript:
```typescript
db.select().from(messages).where(eq(messages.chatId, 'abc')).orderBy(asc(messages.created_at));
```

**Benefits:** Type safety, autocomplete, catches errors at compile time.

### Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Always "default-user" (no auth) |
| name | text | User's name |
| email | text | User's email |
| created_at | timestamp | When the user was created |

#### `user_settings`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique ID |
| userId | FK → users | Which user this belongs to |
| messageCount | integer | Total messages sent (starts at 0) |
| created_at | timestamp | When settings were created |

#### `chats`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique chat ID |
| pdfName | text (nullable) | Display name of the first PDF (legacy) |
| pdfUrl | text (nullable) | URL to serve the first PDF (legacy) |
| fileKey | text (nullable) | Filesystem path of first PDF (legacy) |
| userId | text | Which user owns this chat |
| created_at | timestamp | When the chat was created |

#### `chat_files` (for multi-file support)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique file entry ID |
| chatId | FK → chats | Which chat this file belongs to |
| fileKey | text | Filesystem path key |
| fileName | text | Original filename |
| fileUrl | text | URL to serve this file |
| fileSize | integer (nullable) | File size in bytes |
| created_at | timestamp | When the file was added |

#### `messages`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique message ID |
| chatId | FK → chats | Which chat this message is in |
| content | text | The actual message text |
| role | "system" or "user" | Who sent it (system = AI) |
| model | text (nullable) | Which AI model generated this |
| created_at | timestamp | When the message was sent |

#### `sources`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique source ID |
| messageId | FK → messages | Which AI message these sources are for |
| chatId | FK → chats | Which chat |
| data | text (JSON) | Array of `{content, pageNumber}` |
| created_at | timestamp | When sources were saved |

### Backward Compatibility

The `chats` table has `pdfName`, `pdfUrl`, and `fileKey` columns from the original single-file design. When multi-file support was added, the `chat_files` table was introduced. The code handles both:
- New chats → use `chat_files` table, namespace = chatId
- Old chats → use `chats.fileKey`, namespace = fileKey

---

## 7. API Routes - The Server Endpoints

### `POST /api/upload-file`
**What it does:** Saves a PDF file to the server.
- Receives: FormData with a PDF file
- Validates: File exists and is under 50MB
- Saves to: `uploads/` directory with a timestamp prefix
- Returns: `{ file_key, file_name }`

### `POST /api/create-chat`
**What it does:** Creates a new chat session with one or more PDFs.
- Receives: Array of `{ file_key, file_name }` objects
- Creates a database row in `chats` and rows in `chat_files`
- **Indexes each PDF into Pinecone** (the expensive part - extraction, splitting, embedding)
- Returns: The new chat object

### `POST /api/chat`
**What it does:** Sends a user message and streams back an AI response.
- Receives: `{ messages, chatId, messageCount, selectedModel, apiKeys }`
- Determines the Pinecone namespace (chatId for multi-file, fileKey for legacy)
- Runs the two-chain RAG pipeline
- Streams the response back
- On completion: saves user message, AI response, and sources to the database
- Custom headers in response: `x-sources`, `x-message-index`, `x-model`

### `POST /api/add-file-to-chat`
**What it does:** Adds a new PDF to an existing chat.
- Receives: `{ chatId, file_key, file_name }`
- Creates a `chat_files` row
- Indexes the new PDF into the same Pinecone namespace
- Returns: Updated file list

### `POST /api/get-messages`
**What it does:** Fetches all messages for a chat.
- Receives: `{ chatId }`
- Returns: Messages + sources, ordered by creation date

### `POST /api/remove-messages`
**What it does:** Completely deletes a chat.
- Deletes: Local PDF files, Pinecone vectors, chat_files rows, sources, messages, chat row
- This is a destructive operation that cleans up everything

### `GET /api/serve-pdf/[...fileKey]`
**What it does:** Serves uploaded PDF files to the browser.
- The `[...fileKey]` is a catch-all route: `/api/serve-pdf/uploads/1234-file.pdf`
- Returns the PDF with `Content-Type: application/pdf`
- Has **path traversal protection** (prevents requests like `/api/serve-pdf/../../etc/passwd`)
- Caching headers for performance

### `GET /api/db-events`
**What it does:** Server-Sent Events (SSE) endpoint.
- Keeps an open connection to the client
- Sends a heartbeat every 30 seconds to prevent timeout
- Foundation for real-time updates

### `POST /api/user/initialize`
**What it does:** Ensures the default user exists and loads their data.
- Creates the "default-user" if they don't exist
- Returns all chats for the user, sorted by newest first

### `POST /api/send-email`
**What it does:** Sends a contact form email.
- Uses the **Resend** email API
- Validates email format
- Sends using a React email template

---

## 8. Frontend Components - The UI Pieces

### The Page Flow

```
Landing Page (app/page.tsx)
    |
    | "Go to chat" button
    v
Chat Page (app/chat/[[...chatId]]/page.tsx)
    |
    |-- No chatId → Show FileUpload component (drag and drop PDFs)
    |
    |-- Has chatId → Show:
         |-- PdfViewer (left side, resizable)
         |-- ChatInterface (right side)
```

### Key Components Explained

#### `ChatInterface` (components/chat-interface.tsx)
The main chat component. Uses Vercel AI SDK's `useChat` hook.

**What `useChat` does:**
- Manages the list of messages
- Handles sending messages to `/api/chat`
- Processes the streaming response
- Updates the UI in real-time as tokens arrive

**Extra features built on top:**
- Extracts source citations from the `x-sources` response header
- Tracks which AI model generated each response
- "Add file" button to add more PDFs mid-conversation
- Enter key sends message, Shift+Enter adds a new line

#### `PdfViewer` (components/pdf-viewer.tsx)
Shows the actual PDF document.

- Uses `re-resizable` to let users drag the divider to make the PDF bigger/smaller
- For multi-file chats: shows **tabs** at the top (one tab per PDF)
- Renders PDFs in an `<iframe>` pointing to `/api/serve-pdf/...`

#### `ChatSideBar` (components/chat-sidebar.tsx)
Left sidebar showing all your chats.

- "New chat" button at the top
- Each chat shows the PDF name and date (formatted with `dayjs`)
- Click to switch chats
- Delete button with a confirmation dialog
- Currently selected chat is highlighted in emerald green
- User settings at the bottom

#### `FileUpload` (components/file-upload.tsx)
The drag-and-drop upload area.

- Uses `react-dropzone` library
- Accepts `.pdf` files only, max 50MB
- Shows upload progress with a loading animation
- Supports **multiple files** at once
- After upload completes: creates the chat and navigates to it

#### `ModelSelector` (components/model-selector.tsx)
Dropdown to choose which AI model to use.

- Groups models by provider (OpenAI, Anthropic, Google, DeepSeek)
- Shows provider-specific icons
- Models tagged as "Pro" require the user to provide their own API key
- "Basic" models work with the server's API keys
- Disabled state for Pro models without API keys

#### `MessageList` (components/messages/message-list.tsx)
Scrollable container for all messages.

- Shows a welcome message when the chat is empty
- Auto-scrolls to the bottom when new messages arrive
- Shows animated "thinking" dots while the AI is generating

#### `AssistantMessage` (components/messages/assistant-message.tsx)
Renders AI responses with rich formatting.

- **ReactMarkdown** renders bold, italic, links, lists, etc.
- **remark-math + rehype-katex** handles math equations (LaTeX)
- **CodeComponent** handles code blocks with syntax highlighting
- Shows provider icon + model name above the message
- Copy button and sources button

#### `SettingsDialog` (components/dialogs/settings-dialog.tsx)
Settings popup for managing API keys.

- Input fields for OpenAI, Anthropic, Google, and DeepSeek API keys
- Keys are saved encrypted to localStorage (not sent to the server unless needed for a request)
- Allows users to use "Pro" models with their own keys

#### `SourcesDialog` (components/dialogs/sources-dialog.tsx)
Shows which parts of the PDF the AI used to answer.

- Lists page numbers and text snippets
- Helps verify that the AI's answer is grounded in the actual document

---

## 9. State Management - How We Track Things

### Zustand Store (store/app-store.ts)

Think of Zustand as a **shared whiteboard** that all components can see and update.

**What's on the whiteboard:**
```
chats: [...]           → List of all chat sessions
currentChatId: "abc"   → Which chat is currently open
messageCount: 42       → Total messages sent
selectedModel: "gpt-5" → Currently selected AI model
apiKeys: {...}         → User's API keys (encrypted)
```

**Actions (ways to update the whiteboard):**
- `addChat(chat)` → Put a new chat on the list
- `removeChat(chatId)` → Remove a chat from the list
- `setCurrentChatId(id)` → Change which chat is selected
- `setSelectedModel(model)` → Change the AI model
- `setApiKeys(keys)` → Save API keys (encrypts + stores in localStorage)
- `initializeApiKeys()` → Load API keys from localStorage on app start
- `initialize(data)` → Load everything from the server on first load

### React Query (providers/query-provider.tsx)

While Zustand handles **client state** (things the client decides), React Query handles **server state** (data that comes from the server).

**What it manages:**
- Fetching user data on app load
- Fetching messages for a chat
- Mutations (creating/deleting chats)
- **Caching**: Once we fetch messages for a chat, we don't re-fetch unless needed
- **Automatic refetching**: If the user comes back to the tab after a while

### Providers (providers/)

**QueryProvider:** Wraps the app with React Query's context so all components can use `useQuery` and `useMutation`.

**UserProvider:** Runs once when the app loads. Calls `/api/user/initialize`, gets the user's chats, and hydrates the Zustand store with `initialize()`. Also calls `initializeApiKeys()` to load encrypted API keys from localStorage.

**DbEventsProvider:** Establishes a Server-Sent Events (SSE) connection to `/api/db-events`. Currently sends heartbeats to keep the connection alive. This is the foundation for real-time features.

---

## 10. Multi-Model Support - Choosing an AI Brain

**File:** `constants/models.ts` and `lib/langchain.ts`

### How Model Selection Works

1. User picks a model from the `ModelSelector` dropdown
2. The model ID is stored in Zustand's `selectedModel`
3. When a message is sent, the model ID goes to `/api/chat`
4. `langchain.ts` uses a **factory pattern** to create the right model instance:

```
Model ID → getModelProvider() → "openai" | "anthropic" | "google" | "deepseek"
                                         |
                                         v
                               createChatModel() → ChatOpenAI / ChatAnthropic / ChatGoogleGenerativeAI / ChatDeepSeek
```

### API Key Resolution

For each model, the app checks for an API key in this order:
1. **User's key** (from the encrypted localStorage, sent in the request body)
2. **Server's key** (from `.env.local` environment variables)

This means:
- "Basic" models work out of the box using server keys
- "Pro" models need the user to provide their own key via Settings

### Temperature Handling

Most models use `temperature: 0` (deterministic, consistent answers). But certain OpenAI reasoning models (GPT-5, GPT-5.2, GPT-5 Mini, o3, o4-mini) set temperature to `undefined` because they don't support explicit temperature settings.

---

## 11. Security - Keeping Secrets Safe

### API Key Encryption (lib/crypto.ts)

When a user saves their API keys in Settings:

1. **Key Derivation**: The user ID ("default-user") + a salt ("ask-pdf-app-salt") is run through **PBKDF2** with **100,000 iterations** using **SHA-256**. This creates an encryption key.

   *Why PBKDF2?* It's intentionally slow, making brute-force attacks impractical.

2. **Encryption**: The API keys (as a JSON string) are encrypted using **AES-256-CBC** with the derived key.

3. **Storage**: The encrypted string is stored in the browser's `localStorage` under the key `"ask-pdf-api-keys"`.

4. **Decryption**: On app load, the encrypted data is retrieved from localStorage, decrypted with the same derived key, and loaded into the Zustand store.

5. **Backward Compatibility**: If decryption fails (old unencrypted data), it tries parsing as plain JSON.

### Path Traversal Protection

The `serve-pdf` route uses `getLocalFilePath()` which ensures the requested file path stays within the `uploads/` directory. A malicious request like `/api/serve-pdf/../../../etc/passwd` would be rejected.

### No Authentication

The app is designed for local/personal use. There's no login system - a hardcoded "default-user" is used for everything. The middleware is a pass-through that simply calls `NextResponse.next()`.

---

## 12. Streaming - Real-Time Responses

### How Streaming Works

Instead of waiting for the entire AI response to be generated (which could take 10+ seconds), the app streams tokens as they're generated:

```
[Server generates tokens one by one]
"The"  → sent to client → UI shows: "The"
" cat" → sent to client → UI shows: "The cat"
" sat" → sent to client → UI shows: "The cat sat"
...
```

### The Technical Flow

1. **LangChain** creates a `RunnableSequence` with a `BytesOutputParser` that converts tokens to bytes
2. The chain's `.stream()` method returns an async iterable of byte chunks
3. **Vercel AI SDK's** `StreamingTextResponse` wraps this into a proper HTTP streaming response
4. On the client, `useChat` from the AI SDK handles the stream, updating the messages array as chunks arrive

### Custom Headers for Metadata

Since the response is a stream, we can't include metadata in the response body. Instead, we use **custom HTTP headers**:
- `x-sources`: Base64-encoded JSON of source documents and page numbers
- `x-message-index`: Which message number this is (for source attribution)
- `x-model`: Which model generated this response

The client reads these headers in the `onResponse` callback of `useChat`.

---

## 13. File Handling - How PDFs Are Managed

### Upload Flow

1. Client sends the file as `FormData` to `/api/upload-file`
2. Server reads the file bytes and saves to `uploads/` directory
3. Filename: `<timestamp><sanitized-original-name>.pdf`
4. Server returns `{ file_key: "uploads/1234-file.pdf", file_name: "file.pdf" }`

### Serving Flow

1. Client requests `/api/serve-pdf/uploads/1234-file.pdf`
2. Server resolves the path using `getLocalFilePath()`
3. Path traversal check ensures we stay in `uploads/`
4. File is read from disk and returned with `Content-Type: application/pdf`
5. Caching headers: `Cache-Control: public, max-age=86400` (24 hours)

### Deletion Flow

When a chat is deleted:
1. All files in `chat_files` for that chatId are identified
2. Each physical file is deleted from the `uploads/` directory
3. The Pinecone namespace for the chatId is deleted (removes all vectors)
4. Database rows for chat_files, sources, messages, and the chat itself are deleted

### Multi-File Support

- Multiple PDFs can be uploaded at once when creating a chat
- Additional PDFs can be added to existing chats via the "Add file" button
- All PDFs in a chat share the same Pinecone namespace (chatId)
- This means when you ask a question, the AI searches across ALL PDFs in that chat
- The PDF viewer shows tabs to switch between different PDFs

---

## 14. Styling - How It Looks

### Tailwind CSS

Instead of writing separate CSS files:
```css
/* Traditional CSS */
.button { background-color: blue; padding: 8px 16px; border-radius: 4px; }
```

We write utility classes directly in JSX:
```jsx
<button className="bg-blue-500 px-4 py-2 rounded">Click me</button>
```

### Theme System

The app supports **dark mode** and **light mode** using:
- `next-themes`: Manages which theme is active (persists to localStorage)
- **CSS Variables**: Colors are defined as CSS variables in `globals.css`
- `class` strategy: A `.dark` class on `<html>` switches the theme

```css
:root {           /* Light mode */  }
.dark {           /* Dark mode */   }
```

### shadcn/ui Components

Pre-built, customizable components:
- Not a dependency you install - the code lives in your project (`components/ui/`)
- Built on **Radix UI** primitives (accessible, keyboard-navigable)
- Styled with **Tailwind CSS**
- Uses **CVA (Class Variance Authority)** for variant management:
  ```tsx
  <Button variant="destructive" size="lg">Delete</Button>
  // vs
  <Button variant="outline" size="sm">Cancel</Button>
  ```

### Accent Color

The app uses **emerald green** (`#10b981`) as its accent color throughout - selected chat highlights, user message bubbles, buttons, links, etc.

### Custom Font

Uses **Geist Sans** from Vercel, applied globally in the root layout.

---

## 15. Key Design Decisions

### 1. Local-First Architecture
**Decision:** Store everything locally (SQLite file, PDF files on disk) instead of cloud storage.
**Why:** Simplicity, privacy, no cloud costs, works offline for data. Only Pinecone and the AI APIs require internet.

### 2. No Authentication
**Decision:** Use a hardcoded "default-user" instead of implementing login.
**Why:** It's a personal tool / demo project. Adding auth would complicate deployment without adding value for a single-user app.

### 3. Two-Chain RAG
**Decision:** Use two separate AI calls (reformulate question, then answer) instead of one.
**Why:** The reformulated question produces much better vector search results. "How efficient is it?" vs "How efficient is photosynthesis in converting sunlight to energy?" - the second query finds much better matching chunks.

### 4. Pinecone for Vectors (Not Local)
**Decision:** Use Pinecone (cloud vector DB) instead of a local vector store like FAISS.
**Why:** Pinecone handles similarity search efficiently at scale, provides namespace isolation per chat, and persists across server restarts without manual management.

### 5. Client-Side API Key Encryption
**Decision:** Encrypt API keys in the browser before storing in localStorage.
**Why:** localStorage is accessible to any JavaScript on the page. Encryption adds a layer of protection. While not perfect security (the encryption key is derived from a known user ID), it prevents casual reading of keys.

### 6. Multi-File Support with Shared Namespace
**Decision:** All PDFs in a chat share one Pinecone namespace.
**Why:** This allows cross-document queries. If you upload both a textbook and its study guide, you can ask questions that reference information from both documents.

### 7. Streaming Responses
**Decision:** Stream AI responses token-by-token instead of waiting for the full response.
**Why:** Much better user experience. Users see text appearing immediately instead of staring at a loading spinner for 10+ seconds.

### 8. Zustand Over Redux
**Decision:** Use Zustand instead of Redux or React Context for global state.
**Why:** Zustand is ~1KB (vs Redux's ~50KB+), has zero boilerplate (no reducers, action types, dispatchers), and works outside React components.

---

## 16. Common Interview Questions & Answers

### Q: What is RAG and why did you use it?
**A:** RAG stands for Retrieval-Augmented Generation. Normal AI models like GPT can only answer from their training data - they don't know about your specific documents. RAG solves this by first *retrieving* relevant chunks from your document (using vector similarity search), then *augmenting* the AI's prompt with those chunks, so the AI can *generate* an answer grounded in your actual document. I used it because without RAG, the AI would either hallucinate answers or say "I don't know" about document-specific questions.

### Q: What are embeddings and how do they work?
**A:** Embeddings are arrays of numbers (vectors) that represent the *meaning* of text. We use OpenAI's `text-embedding-3-small` model which converts text into a 1536-dimensional vector. The key property is that text with similar meaning gets similar numbers. So "climate change causes warming" and "global temperatures are rising" would have vectors that are close together in 1536-dimensional space, even though they use different words. Pinecone then uses cosine similarity to find the closest vectors to a query.

### Q: Why did you split documents into chunks?
**A:** Three reasons: (1) AI models have token limits - you can't send a 200-page document all at once. (2) You get better search results with smaller, focused chunks - a 1000-character chunk about photosynthesis will match better than a whole chapter. (3) It's more cost-efficient - you only send the relevant chunks to the AI, not the entire document. We use 1000-character chunks with 200-character overlap so no sentence is cut in half.

### Q: How does the streaming work?
**A:** The LangChain pipeline generates tokens one at a time. These are piped through a `BytesOutputParser` into a `StreamingTextResponse` from the Vercel AI SDK. The client uses the `useChat` hook which reads the stream using the Fetch API's `ReadableStream`. As each chunk arrives, React re-renders the message with the new text, creating the "typing" effect.

### Q: How do you handle multiple AI providers?
**A:** I use a factory pattern. When a user selects a model, the model ID is sent to the server. A `getModelProvider()` function determines which provider (OpenAI, Anthropic, Google, DeepSeek) the model belongs to. Then `createChatModel()` instantiates the correct LangChain chat model class with the right API key. All LangChain chat models implement the same interface, so the rest of the pipeline doesn't care which provider is used.

### Q: How is the database structured?
**A:** I use SQLite with Drizzle ORM. There are 6 main tables: `users` (single default user), `user_settings` (message count), `chats` (chat sessions), `chat_files` (PDFs attached to chats), `messages` (chat messages with role and model info), and `sources` (which PDF pages were used for each AI response). SQLite runs in WAL mode for concurrent read/write access.

### Q: How are API keys secured?
**A:** User API keys never leave the browser except when needed for an AI request. They're encrypted using AES-256-CBC before being stored in localStorage. The encryption key is derived using PBKDF2 with 100,000 iterations of SHA-256, making brute-force attacks impractical. On each request, keys are decrypted and sent in the request body, used only for that specific API call.

### Q: What's the difference between `useChat` and `useQuery`?
**A:** `useChat` (from Vercel AI SDK) is specifically designed for AI chat interfaces - it manages the message list, handles streaming responses, provides an input handler, and manages the loading state. `useQuery` (from TanStack React Query) is a general-purpose server state manager - it handles fetching, caching, refetching, and synchronization. I use `useChat` for the real-time chat experience and `useQuery` for fetching existing messages and initializing user data.

### Q: Why Next.js App Router instead of Pages Router?
**A:** The App Router provides Server Components (render on the server, send HTML to client - reduces JavaScript bundle), nested layouts (share UI between pages without re-rendering), built-in loading and error states, Server Actions, and better streaming support. The chat page uses a server component to fetch data, then passes it to client components for interactivity.

### Q: How does multi-file support work?
**A:** All PDFs in a chat are indexed into the same Pinecone namespace (the chatId). This means when you ask a question, the vector search runs across all PDFs simultaneously. The `chat_files` table tracks which files belong to which chat. The PDF viewer shows tabs for switching between documents. When a chat is deleted, all files, their vectors, and database rows are cleaned up.

### Q: What happens if the vector search doesn't find good matches?
**A:** I implemented an adaptive fallback strategy. First, it uses a dynamic score threshold: 0.65 if there are many matches (>5), 0.60 if fewer. If no matches pass the threshold, it falls back to returning the top 2 matches regardless of score. Additionally, results are deduplicated (removing chunks with identical first 50 characters) and limited to 6 results to keep context focused.

### Q: How do you handle the "count == 2" logic in the chat API?
**A:** The two-chain RAG pipeline triggers the `handleLLMEnd` callback twice - once when Chain 1 (question reformulation) finishes, and once when Chain 2 (answer generation) finishes. I only want to save to the database after the final answer is generated, so I use a counter. When `count == 2`, I know the answer chain completed, and I save the user message, AI response, and sources to the database.

### Q: What's Server-Sent Events (SSE) and why is it used?
**A:** SSE is a one-way communication channel from server to client over HTTP. Unlike WebSockets (which are bidirectional), SSE is simpler and works with standard HTTP. The `db-events` endpoint keeps an open connection and sends heartbeats every 30 seconds. It's the foundation for real-time features like updating the chat list when a new chat is created or messages when they're saved.

### Q: What's the `[[...chatId]]` route syntax?
**A:** It's a Next.js **optional catch-all route**. The `[...chatId]` part means it catches any number of URL segments as an array (`/chat/a/b/c` → `chatId = ['a', 'b', 'c']`). The double brackets `[[...]]` make it **optional**, so `/chat` (no chatId) also matches. I use this so the same page component handles both the "no chat selected" state and the "viewing a specific chat" state.

### Q: Why Zustand over Redux or Context API?
**A:** Redux requires a lot of boilerplate (actions, reducers, types, store setup, middleware) for what is a fairly simple state. React Context causes re-renders for all consuming components when any value changes. Zustand is ~1KB, requires zero boilerplate, gives fine-grained subscriptions (a component re-renders only when the specific value it uses changes), and works outside of React components (useful for utility functions).

---

*This document covers the complete PdfWizard project. Every file, every concept, every decision. You're ready for that interview.*

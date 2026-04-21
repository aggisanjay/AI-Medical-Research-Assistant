# Curalink AI Medical Research Assistant

Curalink is a sophisticated, AI-driven medical research assistant designed to empower researchers and healthcare professionals by aggregating, ranking, and summarizing clinical and academic data from multiple trusted sources.

![Curalink Preview](https://ai-medical-research-assistant.vercel.app/) *Note: Replace with actual screenshot path if available.*

## 🌟 Key Features

- **Multi-Source Aggregation**: Real-time searching across:
  - **ClinicalTrials.gov**: For ongoing and completed clinical studies.
  - **PubMed**: Peer-reviewed biomedical literature.
  - **OpenAlex**: Global catalog of scholarly papers, authors, and institutions.
- **Intelligent Query Expansion**: Uses AI to broaden search terms and capture relevant medical synonyms and context.
- **AI-Powered Summarization**: Generates professional research reports and clinical trial eligibility summaries using advanced LLMs (Mistral/HuggingFace).
- **Interactive UI**: A modern, premium interface using Framer Motion for smooth transitions and Lucide icons for intuitive navigation.
- **Research Persistence**: Full conversation history management with MongoDB, allowing users to save and revisit complex research threads.
- **Flexible AI Providers**: Support for HuggingFace Inference API and local Ollama deployments.

## 🛠️ Technology Stack

### Frontend
- **React**: Modern component-based architecture.
- **Framer Motion**: Premium micro-animations and transitions.
- **React Markdown**: Clean rendering of AI-generated research reports.
- **Lucide React**: High-quality SVG iconography.
- **Vanilla CSS**: Custom, high-performance styling.

### Backend
- **Node.js & Express**: Scalable API architecture.
- **MongoDB**: Robust data persistence for conversations.
- **Hugging Face Inference**: Integration with state-of-the-art open-source LLMs.
- **Fast XML Parser**: Integration with legacy medical API formats.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or local instance)
- Hugging Face API Token (optional, for cloud-based LLM)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/cura-link.git
   cd cura-link
   ```

2. **Server Setup:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   LLM_PROVIDER=huggingface # or ollama
   HF_API_TOKEN=your_huggingface_token
   HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
   ```

3. **Client Setup:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the Backend:**
   ```bash
   cd server
   npm run dev # uses nodemon
   ```

2. **Start the Frontend:**
   ```bash
   cd client
   npm start
   ```
   The application will be available at `http://localhost:3000`.

## 📂 Project Structure

```text
├── client/              # React frontend
│   ├── public/         # Static assets
│   └── src/            # Components, services, and styling
└── server/              # Node.js backend
    ├── config/         # Database and app config
    ├── controllers/    # API request handlers
    ├── models/         # Mongoose schemas
    ├── routes/         # Express API routes
    └── services/       # Core logic (Orchestrator, LLM, APIs)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

---
*Built with ❤️ for the medical research community.*

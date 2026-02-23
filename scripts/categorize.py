"""
Keyword-based categorizer for AI tools and repos.
The first matching category wins (order matters).
"""

CATEGORIES = [
    {
        "slug": "llm-models",
        "label": "LLM Models",
        "keywords": [
            "llm", "large language model", "gpt", "claude", "gemini", "llama",
            "mistral", "qwen", "phi", "falcon", "bloom", "palm", "bert",
            "transformer", "language model", "foundation model", "chat model",
            "instruction tuning", "fine-tun", "quantiz", "gguf", "ggml",
            "ollama", "lmstudio", "huggingface", "weights", "checkpoint",
            "pretraining", "pre-training",
        ],
    },
    {
        "slug": "ai-agents",
        "label": "AI Agents",
        "keywords": [
            "agent", "agentic", "autonomous", "multi-agent", "crewai", "autogen",
            "langchain", "langgraph", "tool use", "tool-use", "function calling",
            "orchestrat", "workflow automation", "ai assistant", "copilot",
            "devin", "swe-agent", "opendevin", "browser agent", "computer use",
            "swarm", "react agent", "task planning",
        ],
    },
    {
        "slug": "code-generation",
        "label": "Code Generation",
        "keywords": [
            "code generation", "code gen", "code completion", "coding assistant",
            "cursor", "codeium", "tabnine", "codex", "code review",
            "code analysis", "refactor", "autocomplete", "ide plugin",
            "vscode extension", "programming assistant", "code2", "codegen",
        ],
    },
    {
        "slug": "image-video",
        "label": "Image & Video",
        "keywords": [
            "image generation", "text-to-image", "text to image", "stable diffusion",
            "diffusion model", "midjourney", "dall-e", "dalle", "flux",
            "image synthesis", "inpainting", "upscaling", "super resolution",
            "video generation", "text-to-video", "sora", "runway", "pika",
            "image editing", "style transfer", "gan", "vae", "comfyui",
            "controlnet", "lora", "dreambooth",
        ],
    },
    {
        "slug": "voice-audio",
        "label": "Voice & Audio",
        "keywords": [
            "speech", "text-to-speech", "tts", "speech-to-text", "stt",
            "whisper", "voice", "audio generation", "music generation",
            "voice clone", "voice synthesis", "asr", "transcription",
            "elevenlabs", "suno", "udio", "audiocraft", "bark",
            "text to speech", "speech recognition",
        ],
    },
    {
        "slug": "rag-search",
        "label": "RAG & Search",
        "keywords": [
            "rag", "retrieval augmented", "vector database", "vector db",
            "embedding", "semantic search", "knowledge base", "knowledge graph",
            "pinecone", "weaviate", "qdrant", "chroma", "faiss", "milvus",
            "document qa", "pdf chat", "document chat", "search engine",
            "retrieval", "reranking", "hybrid search",
        ],
    },
    {
        "slug": "local-ai",
        "label": "Local AI",
        "keywords": [
            "local llm", "local ai", "offline ai", "on-device", "edge ai",
            "raspberry pi", "apple silicon", "metal backend", "cpu inference",
            "private ai", "self-hosted", "run locally", "no cloud",
            "on-premise", "air-gapped",
        ],
    },
    {
        "slug": "ai-infrastructure",
        "label": "AI Infrastructure",
        "keywords": [
            "inference", "serving", "deployment", "mlops", "model serving",
            "triton", "vllm", "tensorrt", "onnx", "ray serve",
            "kubernetes", "gpu cluster", "distributed training", "accelerat",
            "prompt engineering", "prompt management", "observability",
            "monitoring", "eval", "benchmark", "ai platform", "ai api",
            "model registry", "experiment tracking", "mlflow",
        ],
    },
    {
        "slug": "data-analytics",
        "label": "Data & Analytics",
        "keywords": [
            "data analysis", "data analytics", "data science", "pandas ai",
            "nl2sql", "text-to-sql", "natural language sql", "bi tool",
            "chart generation", "visualization", "notebook", "jupyter",
            "data pipeline", "etl", "synthetic data", "data labeling",
            "data annotation",
        ],
    },
    {
        "slug": "ai-writing",
        "label": "AI Writing",
        "keywords": [
            "writing assistant", "content generation", "copywriting",
            "essay", "blog post", "summarization", "summarize",
            "paraphrase", "grammar", "grammarly", "jasper", "notion ai",
            "document generation", "report generation", "email assistant",
            "proofreading", "spell check",
        ],
    },
    {
        "slug": "robotics-embodied",
        "label": "Robotics & Embodied AI",
        "keywords": [
            "robot", "robotics", "embodied ai", "embodied agent",
            "manipulation", "sim2real", "reinforcement learning",
            "rl", "gym", "simulation", "autonomous vehicle", "drone",
            "physical ai", "humanoid", "dexterous", "locomotion",
        ],
    },
]

FALLBACK_CATEGORY = "ai-infrastructure"

# ---------------------------------------------------------------------------
# Tool type classification
# ---------------------------------------------------------------------------

_APP_SIGNALS = [
    "app", "application", "tool", "platform", "service", "product",
    "interface", "dashboard", "ui", "gui", "desktop", "mobile",
    "web app", "web application", "chat", "assistant", "copilot",
    "no-code", "low-code", "saas", "startup",
    "helps you", "allows you to", "lets you",
    "for teams", "for businesses", "for everyone",
    "sign up", "free trial", "pricing",
]

_LIBRARY_SIGNALS = [
    "library", "framework", "sdk", "package", "module", "toolkit",
    "wrapper", "bindings", "extension", "plugin", "middleware",
    "pip install", "npm install", "cargo add", "go get",
    "python library", "javascript library", "typescript library",
    "open source library", "open-source library", "rust crate",
    "import ", "from  import", "require(", "pypi",
]

_MODEL_SIGNALS = [
    "model weights", "pretrained", "fine-tuned", "fine tuned",
    "hugging face model", "gguf", "ggml", "safetensors",
    "checkpoint", "lora weights", "base model", "chat model",
    "instruct model", "quantized model", "model card",
]


def classify_tool_type(item: dict) -> str:
    """
    Classifies an item as 'app', 'library', or 'model'.
    - 'app': consumer-facing tools, products, SaaS, dashboards
    - 'library': developer frameworks, SDKs, packages, APIs
    - 'model': model weights, checkpoints, fine-tunes
    """
    # Source is a strong signal: PH and YC almost always ship consumer apps
    if item.get("source") in ("producthunt", "ycombinator"):
        return "app"

    text = " ".join(
        [
            item.get("title", "") or "",
            item.get("description", "") or "",
            " ".join(item.get("tags", [])),
        ]
    ).lower()

    model_score = sum(1 for kw in _MODEL_SIGNALS if kw in text)
    lib_score = sum(1 for kw in _LIBRARY_SIGNALS if kw in text)
    app_score = sum(1 for kw in _APP_SIGNALS if kw in text)

    if model_score >= 2:
        return "model"
    if lib_score > app_score:
        return "library"
    if app_score >= 1:
        return "app"

    # Default: most highly-starred GitHub AI repos are developer libraries/frameworks
    if item.get("source") == "github":
        return "library"

    return "app"


def categorize(item: dict) -> str:
    """
    Returns the slug of the best-matching category for the given item.
    Matches against title + description + tags.
    """
    text = " ".join(
        [
            item.get("title", "") or "",
            item.get("description", "") or "",
            " ".join(item.get("tags", [])),
        ]
    ).lower()

    for category in CATEGORIES:
        for keyword in category["keywords"]:
            if keyword.lower() in text:
                return category["slug"]

    return FALLBACK_CATEGORY

from fastapi import FastAPI

app = FastAPI(
    title="AI Coach Service",
    description="Orchestrates fitness plan generation using Gemini AI.",
    version="1.0.0",
)

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "works"}

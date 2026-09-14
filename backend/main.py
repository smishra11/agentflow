from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user

app = FastAPI(title="AgentFlow Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online"}

# NEW: A protected route that requires a valid Supabase token
@app.get("/api/protected")
async def protected_route(user = Depends(get_current_user)):
    # If the code reaches here, the user is 100% verified.
    return {
        "message": "Handshake successful!",
        "user_id": user.id,
        "email": user.email
    }
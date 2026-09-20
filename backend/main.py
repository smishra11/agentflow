from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user, supabase
from contextlib import asynccontextmanager

import os
import httpx
from pydantic import BaseModel
from crypto import encrypt_token
from engine import scheduler, sync_agent_schedules, execute_agent_task

# Define the startup and shutdown logic
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background scheduler and sync agents
    scheduler.start()
    sync_agent_schedules()
    yield
    # Shutdown: Stop the scheduler
    scheduler.shutdown()

# Pass the lifespan function into FastAPI
app = FastAPI(title="AgentFlow Core API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OAuthExchangeRequest(BaseModel):
    code: str
    redirect_uri: str

# 1. Health Check Route (Keep this for deployments)
@app.get("/")
async def root():
    return {"status": "online", "message": "AgentFlow FastAPI Core is running."}

# 2. Production Dashboard Data Route
@app.get("/api/dashboard")
async def get_dashboard_data(user = Depends(get_current_user)):
    try:
        runs_response = supabase.table("agent_runs").select("status").eq("user_id", user.id).execute()
        runs = runs_response.data
        
        metrics = {
            "pending": 0,
            "running": 0,
            "completed": 0,
            "failed": 0
        }
        
        for run in runs:
            if run["status"] in metrics:
                metrics[run["status"]] += 1
                
        activity_response = supabase.table("agent_runs") \
            .select("id, status, created_at, agents(name, system_prompt)") \
            .eq("user_id", user.id) \
            .order("created_at", desc=True) \
            .limit(5) \
            .execute()

        return {
            "metrics": metrics,
            "recent_activity": activity_response.data
        }
        
    except Exception as e:
        print("Database error:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard data")

# 3. Google OAuth Route
@app.post("/api/connectors/google/exchange")
async def google_token_exchange(req: OAuthExchangeRequest, user = Depends(get_current_user)):
    try:
        # 1. Exchange the authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "code": req.code,
            "grant_type": "authorization_code",
            "redirect_uri": req.redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(token_url, data=data)
            token_data = resp.json()

        if "error" in token_data:
            raise HTTPException(status_code=400, detail=token_data.get("error_description", "Token exchange failed"))

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token") # Only provided on first auth or if prompt=consent
        
        # 2. Fetch the user's Google email so we know which account they connected
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async with httpx.AsyncClient() as client:
            user_info_resp = await client.get(user_info_url, headers=headers)
            user_info = user_info_resp.json()

        email = user_info.get("email")

        # 3. Encrypt the tokens
        enc_access = encrypt_token(access_token)
        enc_refresh = encrypt_token(refresh_token) if refresh_token else None

        # 4. Upsert into Supabase Vault
        connector_data = {
            "user_id": user.id,
            "provider": "google",
            "provider_account_id": email,
            "access_token": enc_access,
            "status": "connected"
        }
        
        # We only update the refresh token if Google gave us a new one
        if enc_refresh:
            connector_data["refresh_token"] = enc_refresh

        # Upsert matches on the UNIQUE(user_id, provider, provider_account_id) constraint
        supabase.table("user_connectors").upsert(connector_data).execute()

        return {"success": True, "email": email}

    except Exception as e:
        print("OAuth Error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to connect Google account")

# 4. Deployment Webhook Route
class AgentDeployWebhook(BaseModel):
    agent_id: str
    user_id: str
    name: str
    cron_schedule: str

@app.post("/api/engine/deploy")
async def handle_new_deployment(payload: AgentDeployWebhook, background_tasks: BackgroundTasks):
    print(f"📥 Received deployment webhook for: {payload.name}")
    
    if payload.cron_schedule == "once":
        print("⚡ 'Only Once' schedule detected. Triggering immediate execution.")
        background_tasks.add_task(
            execute_agent_task, 
            payload.agent_id, 
            payload.user_id, 
            payload.name
        )
        return {"status": "executing", "message": "Agent triggered immediately."}
    else:
        print("📅 Recurring schedule detected. Syncing APScheduler.")
        sync_agent_schedules()
        return {"status": "scheduled", "message": "Scheduler synced."}
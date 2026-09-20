# engine.py
import os
import asyncio
from groq import AsyncGroq
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from auth import supabase 
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the Groq async client
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# Initialize the background scheduler
scheduler = AsyncIOScheduler()

async def execute_agent_task(agent_id: str, user_id: str, agent_name: str):
    """The brain of the agent. Wakes up, reads its instructions, and executes using Groq."""
    print(f"\n🚀 Waking up agent: {agent_name} ({agent_id})")
    
    try:
        # 1. Log the run as 'running' in the agent_runs table
        run_response = supabase.table("agent_runs").insert({
            "agent_id": agent_id,
            "user_id": user_id,
            "status": "running"
        }).execute()
        
        run_id = run_response.data[0]["id"]

        # 2. Fetch the agent's instructions (system prompt) from Supabase
        agent_data = supabase.table("agents").select("system_prompt").eq("id", agent_id).single().execute()
        system_prompt = agent_data.data.get("system_prompt", "You are a helpful AI assistant.")

        # 3. Call Groq Cloud AI (The Brain)
        print(f"🧠 Agent {agent_name} is thinking (using Groq Llama 3.3 70B)...")
        
        completion = await groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Execute your scheduled task. Summarize what you did in a short sentence."}
            ]
        )
        
        ai_response = completion.choices[0].message.content
        print(f"🤖 AI Output: {ai_response}")
        
        # 4. Mark as 'completed'
        supabase.table("agent_runs").update({
            "status": "completed",
            # If you add an 'output' column to your database later, you can save ai_response here!
        }).eq("id", run_id).execute()
        
        print(f"✅ Agent {agent_name} completed successfully.\n")

    except Exception as e:
        print(f"❌ Error executing agent {agent_name}: {str(e)}")
        # If something fails (like an invalid API key), log it as failed
        if 'run_id' in locals():
            supabase.table("agent_runs").update({"status": "failed"}).eq("id", run_id).execute()

def sync_agent_schedules():
    """Fetches all active agents from the database and schedules them."""
    print("🔄 Syncing agent schedules from Supabase...")
    
    scheduler.remove_all_jobs()
    
    # We now also select the status to ensure we only schedule "active" ones
    response = supabase.table("agents").select("id, name, user_id, cron_schedule").eq("status", "active").execute()
    agents = response.data
    
    if not agents:
        print("No active agents found.")
        return

    for agent in agents:
        cron_expr = agent.get("cron_schedule")
        
        if not cron_expr or cron_expr == "once":
            continue 
            
        try:
            minute, hour, day, month, day_of_week = cron_expr.split()
            
            scheduler.add_job(
                execute_agent_task,
                trigger=CronTrigger(
                    minute=minute, 
                    hour=hour, 
                    day=day, 
                    month=month, 
                    day_of_week=day_of_week
                ),
                args=[agent["id"], agent["user_id"], agent["name"]],
                id=agent["id"],
                replace_existing=True,
                misfire_grace_time=None # Runs immediately if your PC slept through a scheduled time
            )
            print(f"📅 Scheduled '{agent['name']}' with CRON: {cron_expr}")
        except Exception as e:
            print(f"⚠️ Failed to schedule agent {agent['name']} - Invalid CRON: {cron_expr}")
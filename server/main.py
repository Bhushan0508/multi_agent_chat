import json
import asyncio
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core.database import get_db, engine, settings
from core.websocket import manager
from models.models import Base, User, Message
from services.auth import otp_service, create_access_token, verify_token
from services.orchestrator import orchestrator
from schemas import schemas

import redis.asyncio as redis
from typing import Optional

app = FastAPI(title="WhatsApp Multi-Agent API")

# In-memory storage for memory/search endpoints
agent_memory: dict = {}

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client: Optional[redis.Redis] = None

try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    pass

# --- API Endpoints (for client compatibility) ---

@app.get("/api/search")
async def search(q: str):
    return {"result": f"Search results for: {q} (Configure API keys for real search)"}

@app.get("/api/memory/{agent_name}")
async def get_memory(agent_name: str):
    memory = agent_memory.get(agent_name, {"history": []})
    return memory

@app.post("/api/memory/{agent_name}")
async def save_memory(agent_name: str, request: dict):
    if agent_name not in agent_memory:
        agent_memory[agent_name] = {"history": []}
    role = request.get("role", "user")
    content = request.get("content", "")
    agent_memory[agent_name]["history"].append({"role": role, "content": content})
    return {"success": True}

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# --- Auth Routes ---

@app.post("/auth/otp", status_code=status.HTTP_200_OK)
async def send_otp(request: schemas.OTPRequest):
    otp = otp_service.generate_otp(request.phone)
    # In production, send SMS here
    return {"message": "OTP sent successfully (Check console for mock OTP)"}

@app.post("/auth/verify", response_model=schemas.Token)
async def verify_otp(request: schemas.OTPVerify, db: AsyncSession = Depends(get_db)):
    if not otp_service.verify_otp(request.phone, request.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Check if user exists, else create
    result = await db.execute(select(User).where(User.phone == request.phone))
    user = result.scalars().first()
    
    if not user:
        user = User(phone=request.phone, name=f"User {request.phone[-4:]}")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    access_token = create_access_token(data={"sub": str(user.id), "phone": user.phone})
    return {"access_token": access_token, "token_type": "bearer"}

# --- WebSocket ---

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: AsyncSession = Depends(get_db)):
    await manager.connect(websocket, user_id)
    if redis_client:
        await redis_client.set(f"user:{user_id}:status", "online")
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            content = message_data.get("content")
            receiver_id = message_data.get("receiver_id")
            is_group = message_data.get("is_group", False)
            
            # 1. Save message to DB
            new_msg = Message(
                sender_id=user_id,
                receiver_id=receiver_id,
                content=content,
                is_group=is_group
            )
            db.add(new_msg)
            await db.commit()
            
            # 2. Real-time delivery
            if not is_group:
                await manager.send_personal_message(message_data, receiver_id)
                
                # 3. AI Orchestration
                # Check for agents relevant to this query
                relevant_agents = await orchestrator.get_relevant_agents(db, content)
                
                if relevant_agents:
                    # Show typing indicator for agents
                    await manager.send_personal_message({"type": "typing", "status": True}, user_id)
                    
                    # Simulation: Each agent responds after a small delay
                    for agent in relevant_agents:
                        await asyncio.sleep(1.5) # Simulate thinking
                        agent_res = await orchestrator.generate_agent_response(agent, content)
                        
                        agent_msg = {
                            "sender_name": agent.name,
                            "content": agent_res,
                            "timestamp": str(datetime.now()),
                            "isOwn": False
                        }
                        await manager.send_personal_message(agent_msg, user_id)
                    
                    await manager.send_personal_message({"type": "typing", "status": False}, user_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        if redis_client:
            await redis_client.set(f"user:{user_id}:status", "offline")
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(user_id)

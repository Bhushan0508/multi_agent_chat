from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    profile_pic = Column(String) # URL
    about = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    agents = relationship("Agent", back_populates="creator")
    groups_admin = relationship("Group", back_populates="admin")
    memberships = relationship("GroupMember", back_populates="user")

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    expertise = Column(Text) # JSON list
    avoid_topics = Column(Text) # JSON list
    system_prompt = Column(Text)
    creator_id = Column(Integer, ForeignKey("users.id"))

    creator = relationship("User", back_populates="agents")
    group = relationship("Group", back_populates="agents")

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"))
    profile_pic = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    admin = relationship("User", back_populates="groups_admin")
    members = relationship("GroupMember", back_populates="group")
    agents = relationship("Agent", back_populates="group")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer) # Can be user_id or group_id
    content = Column(Text)
    type = Column(String, default="text") # text, image, document, voice
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    is_group = Column(Boolean, default=False)

class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="memberships")
    group = relationship("Group", back_populates="members")

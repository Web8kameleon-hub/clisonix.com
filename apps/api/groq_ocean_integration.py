"""
Groq Ocean Integration - LLM Chat for Curiosity Ocean
Integrates Groq's fast LLM API for conversational AI
Author: Ledjan Ahmati
License: Closed Source
"""

import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import httpx

logger = logging.getLogger("groq_ocean_integration")


class GroqOceanClient:
    """Client për integrimin e Groq me Curiosity Ocean"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        self.model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")
        self.timeout = float(os.getenv("GROQ_TIMEOUT", "30"))
        self.max_tokens = int(os.getenv("GROQ_MAX_TOKENS", "2000"))
        
        # Validation
        if not self.api_key:
            logger.warning("⚠️ GROQ_API_KEY not set - Groq integration will fail")
    
    async def chat(
        self,
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        top_p: float = 0.9
    ) -> Dict[str, Any]:
        """
        Send question to Groq and get response for Ocean chat
        
        Args:
            question: User's question
            conversation_history: Previous messages for context
            temperature: Creativity level (0-2)
            top_p: Diversity sampling (0-1)
        
        Returns:
            Response with answer, model info, and metadata
        """
        try:
            if not self.api_key:
                return {
                    "error": "Groq API key not configured",
                    "fallback": True,
                    "answer": f"I would love to help with '{question}', but Groq is not configured. Please set GROQ_API_KEY."
                }
            
            # Build messages
            messages = []
            
            # Add conversation history
            if conversation_history:
                messages.extend(conversation_history)
            
            # Add current question
            messages.append({
                "role": "user",
                "content": question
            })
            
            # Call Groq API
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature,
                        "top_p": top_p,
                        "max_tokens": self.max_tokens,
                        "stream": False
                    }
                )
            
            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"Groq API error: {response.status_code} - {error_detail}")
                return {
                    "error": f"Groq API returned {response.status_code}",
                    "fallback": True,
                    "answer": "I encountered an issue contacting the LLM service. Please try again."
                }
            
            data = response.json()
            
            # Extract response
            answer = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            
            return {
                "success": True,
                "answer": answer,
                "model": self.model,
                "usage": {
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0)
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        
        except httpx.TimeoutException:
            logger.error("Groq API timeout")
            return {
                "error": "Groq API timeout",
                "fallback": True,
                "answer": "The service is taking too long to respond. Please try again."
            }
        except Exception as e:
            logger.error(f"Groq integration error: {str(e)}")
            return {
                "error": str(e),
                "fallback": True,
                "answer": f"An error occurred: {str(e)}"
            }
    
    async def stream_chat(
        self,
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ):
        """Stream responses from Groq for real-time chat"""
        try:
            if not self.api_key:
                yield "data: " + json.dumps({
                    "error": "Groq not configured",
                    "answer": "Groq API key not set"
                }) + "\n\n"
                return
            
            messages = conversation_history or []
            messages.append({"role": "user", "content": question})
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "stream": True
                    }
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            yield line + "\n"
        
        except Exception as e:
            logger.error(f"Groq streaming error: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    def get_status(self) -> Dict[str, Any]:
        """Get Groq integration status"""
        return {
            "service": "Groq",
            "configured": bool(self.api_key),
            "model": self.model,
            "base_url": self.base_url,
            "status": "ready" if self.api_key else "not_configured"
        }


# Global client instance
_groq_client: Optional[GroqOceanClient] = None


def get_groq_client() -> GroqOceanClient:
    """Get or create Groq client"""
    global _groq_client
    if _groq_client is None:
        _groq_client = GroqOceanClient()
    return _groq_client


# Export
__all__ = ["GroqOceanClient", "get_groq_client"]

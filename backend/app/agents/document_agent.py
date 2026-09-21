"""
CareBridge AI 2.0 — Document Explanation Agent
Provides plain-language medical interpretations of lab tests and conducts policy RAG with citations.
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..agent_tools.document_tools import search_policies_rag

class DocumentAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Document Explanation Agent"

    def retrieve_policy_answer(self, query: str) -> Dict[str, Any]:
        """
        Retrieves grounded policy answers with source document and last updated date.
        """
        return search_policies_rag(self.db, query)

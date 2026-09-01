"""
LangGraph StateGraph definition and node wiring.
Defines the workflow graph for the resume agent.
"""

from langgraph.graph import StateGraph
from state import ResumeAgentState

# Build and wire the graph
graph = StateGraph(ResumeAgentState)

# Node definitions and edges will be added here

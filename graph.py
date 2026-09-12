"""
LangGraph StateGraph definition and node wiring.
Defines the workflow graph for the resume agent.
"""

from langgraph.graph import StateGraph,START,END
from nodes.load_profile import load_profile
from state import ResumeAgentState

# Build and wire the graph
workflow  = StateGraph(ResumeAgentState)

# Node definitions and edges will be added here

workflow.add_node("load_profile",load_profile)

workflow.add_edge(START,"load_profile")
workflow.add_edge("load_profile",END)

graph=workflow.compile()
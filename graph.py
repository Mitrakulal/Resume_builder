"""
LangGraph StateGraph definition and node wiring.
Defines the workflow graph for the resume agent.
"""

from langgraph.graph import StateGraph, START, END

from nodes.load_profile import load_profile
from nodes.match import match
from nodes.read_jd import read_jd
from state import ResumeAgentState

# Build and wire the graph
workflow = StateGraph(ResumeAgentState)

workflow.add_node("load_profile", load_profile)
workflow.add_node("read_jd", read_jd)
workflow.add_node("match", match)

workflow.add_edge(START, "read_jd")
workflow.add_edge("read_jd", "load_profile")
workflow.add_edge("load_profile", "match")
workflow.add_edge("match", END)

graph = workflow.compile()
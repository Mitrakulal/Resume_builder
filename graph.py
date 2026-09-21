"""
LangGraph StateGraph definition and node wiring.
Defines the workflow graph for the resume agent.
"""

from langgraph.graph import StateGraph, START, END

from nodes.load_profile import load_profile
from nodes.match import match
from nodes.read_jd import read_jd
from nodes.generate_content import generate_content
from nodes.render import render
from nodes.compile import compile
from state import ResumeAgentState

# Build and wire the graph
workflow = StateGraph(ResumeAgentState)

workflow.add_node("load_profile", load_profile)
workflow.add_node("read_jd", read_jd)
workflow.add_node("match", match)
workflow.add_node("generate_content", generate_content)
workflow.add_node("render", render)
workflow.add_node("compile", compile)

workflow.add_edge(START, "read_jd")
workflow.add_edge("read_jd", "load_profile")
workflow.add_edge("load_profile", "match")
workflow.add_edge("match", "generate_content")
workflow.add_edge("generate_content", "render")
workflow.add_edge("render", "compile")
workflow.add_edge("compile", END)

graph = workflow.compile()
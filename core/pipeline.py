from langgraph.graph import StateGraph, END
from core.state import SymptomJournalState
from agent1_intake.agent   import run_agent1
from agent2_patterns.agent import run_agent2
from agent3_risks.agent    import run_agent3
from agent4_reporter.agent import run_agent4


def build_pipeline():
    """Build and compile the LangGraph agent pipeline."""
    graph = StateGraph(SymptomJournalState)

    graph.add_node("agent1", run_agent1)   # Kavinda  — llama3.2:3b
    graph.add_node("agent2", run_agent2)   # Rachith  — deepseek-r1:7b
    graph.add_node("agent3", run_agent3)   # Tharindu — deepseek-r1:7b
    graph.add_node("agent4", run_agent4)   # Githadi  — llama3.2:3b

    graph.set_entry_point("agent1")
    graph.add_edge("agent1", "agent2")
    graph.add_edge("agent2", "agent3")
    graph.add_edge("agent3", "agent4")
    graph.add_edge("agent4", END)

    return graph.compile()

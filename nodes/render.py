"""
Node for rendering resume from template.
Applies content to LaTeX template.
"""

from pathlib import Path

from jinja2 import Environment, FileSystemLoader


def _escape_latex(value):
    """Escape plain text before inserting it into a LaTeX document."""
    text = str(value)

    # Normalize special Unicode characters frequently produced by LLMs
    unicode_replacements = {
        "\u202f": " ",   # narrow no-break space
        "\u00a0": " ",   # no-break space
        "\u200b": "",    # zero-width space
        "\u200e": "",    # LTR mark
        "\u200f": "",    # RTL mark
        "\u2010": "-",   # hyphen
        "\u2011": "-",   # non-breaking hyphen
        "\u2012": "-",   # figure dash
        "\u2013": "--",  # en dash
        "\u2014": "---", # em dash
        "\u2018": "'",   # left single quotation mark
        "\u2019": "'",   # right single quotation mark
        "\u201c": '"',   # left double quotation mark
        "\u201d": '"',   # right double quotation mark
        "\u2022": "",    # bullet
        "\u2026": "...", # ellipsis
        "\u2212": "-",   # minus sign
        "\u00b7": " ",   # middle dot
    }
    for char, replacement in unicode_replacements.items():
        text = text.replace(char, replacement)

    # Strip common Markdown the LLM emits (bold/italic), it is not valid LaTeX.
    text = text.replace("**", "").replace("__", "")
    # Protect backslashes first with a placeholder so later { } escaping
    # does not corrupt the \textbackslash{} macro itself.
    placeholder = "\x00BACKSLASH\x00"
    text = text.replace("\\", placeholder)
    for character, replacement in (
        ("&", r"\&"),
        ("%", r"\%"),
        ("$", r"\$"),
        ("#", r"\#"),
        ("_", r"\_"),
        ("{", r"\{"),
        ("}", r"\}"),
        ("~", r"\textasciitilde{}"),
        ("^", r"\textasciicircum{}"),
    ):
        text = text.replace(character, replacement)
    text = text.replace(placeholder, r"\textbackslash{}")
    return text


def _escape_latex_recursive(data):
    """Recursively escape strings for LaTeX across dicts, lists, and primitives."""
    if isinstance(data, str):
        return _escape_latex(data)
    elif isinstance(data, list):
        return [_escape_latex_recursive(item) for item in data]
    elif isinstance(data, dict):
        return {key: _escape_latex_recursive(value) for key, value in data.items()}
    return data


async def render(state):
    """Render resume using Jinja2 template."""
    project_root = Path(__file__).resolve().parent.parent
    output_dir = project_root / "output"
    output_dir.mkdir(exist_ok=True)

    environment = Environment(loader=FileSystemLoader(project_root / "templates"))
    template = environment.get_template("resume_template.tex.jinja")
    candidate_profile = state["candidate_profile"]
    resume_content = state["resume_content"]

    personal_info = _escape_latex_recursive(candidate_profile.personal_info.model_dump())
    content = _escape_latex_recursive(resume_content.model_dump())

    rendered_tex = template.render(personal_info=personal_info, content=content)

    output_path = output_dir / "resume.tex"
    output_path.write_text(rendered_tex, encoding="utf-8")

    return {"rendered_tex_path": str(output_path)}

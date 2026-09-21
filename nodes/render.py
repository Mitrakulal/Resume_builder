"""
Node for rendering resume from template.
Applies content to LaTeX template.
"""

from pathlib import Path

from jinja2 import Environment, FileSystemLoader


def _escape_latex(value):
    """Escape plain text before inserting it into a LaTeX document."""
    text = str(value)
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


def _escape_sections(sections):
    return {
        key: [_escape_latex(item) for item in values]
        for key, values in sections.items()
    }


async def render(state):
    """Render resume using Jinja2 template."""
    project_root = Path(__file__).resolve().parent.parent
    output_dir = project_root / "output"
    output_dir.mkdir(exist_ok=True)

    environment = Environment(loader=FileSystemLoader(project_root / "templates"))
    template = environment.get_template("resume_template.tex.jinja")
    candidate_profile = state["candidate_profile"]
    resume_content = state["resume_content"]
    personal_info = {
        key: _escape_latex(value)
        for key, value in candidate_profile.personal_info.model_dump().items()
        if value is not None
    }
    content = resume_content.model_dump()
    content["professional_summary"] = _escape_latex(
        content["professional_summary"] or ""
    )
    content.update(
        _escape_sections(
            {
                key: value
                for key, value in content.items()
                if isinstance(value, list)
            }
        )
    )

    rendered_tex = template.render(personal_info=personal_info, content=content)

    output_path = output_dir / "resume.tex"
    output_path.write_text(rendered_tex, encoding="utf-8")

    return {"rendered_tex_path": str(output_path)}

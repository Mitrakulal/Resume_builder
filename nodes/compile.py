"""
Node for compiling LaTeX to PDF.
Generates final PDF output.
"""

import asyncio
import shutil
import subprocess
from pathlib import Path


async def compile(state):
    """Compile LaTeX to PDF."""
    latex_executable = shutil.which("pdflatex")
    if latex_executable is None:
        miktex_path = (
            Path.home()
            / "AppData"
            / "Local"
            / "Programs"
            / "MiKTeX"
            / "miktex"
            / "bin"
            / "x64"
            / "pdflatex.exe"
        )
        if miktex_path.exists():
            latex_executable = str(miktex_path)

    if latex_executable is None:
        raise RuntimeError(
            "pdflatex was not found. Install MiKTeX or add its bin folder "
            "to PATH, then run the graph again."
        )

    tex_path = Path(state["rendered_tex_path"]).resolve()
    output_dir = tex_path.parent

    command = [
        latex_executable,
        "-interaction=nonstopmode",
        "-halt-on-error",
        "-output-directory",
        str(output_dir),
        str(tex_path),
    ]

    result = await asyncio.to_thread(
        subprocess.run,
        command,
        cwd=output_dir,
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(
            "LaTeX compilation failed:\n"
            f"{result.stdout}\n{result.stderr}"
        )

    pdf_path = output_dir / f"{tex_path.stem}.pdf"
    if not pdf_path.exists():
        raise RuntimeError(f"LaTeX completed but did not create {pdf_path}")

    return {"output_pdf_path": str(pdf_path)}

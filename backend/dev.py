"""
Runs the application for local development. This file should not be used to start the
application for production.

Refer to https://www.uvicorn.org/deployment/ for production deployments.
"""
import os
import uvicorn
from blacksheep.server.env import is_development
from app.log import get_log_config

try:
    import uvloop
except ModuleNotFoundError:
    pass
else:
    uvloop.install()

if __name__ == "__main__":
    os.environ["APP_ENV"] = os.environ.get("APP_ENV", "dev")
    port = int(os.environ.get("APP_PORT", 5000))
    if is_development():
        from rich.console import Console
        console = Console()
        console.rule("[bold yellow]Running for local development", align="left")
        console.print(f"[bold yellow]Visit http://localhost:{port}/docs")
    os.makedirs("logs", exist_ok=True)
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        lifespan="on",
        log_level="info",
        log_config=get_log_config(),
        reload=is_development(),
    )

from blacksheep import get, redirect
from app.settings import Settings


@get("/")
async def index(settings: Settings):
    return redirect(settings.root_path)

"""
This module configures the BlackSheep application before it starts.
"""
from blacksheep import Application
from blacksheep.server.env import is_development
from blacksheepsqlalchemy import use_sqlalchemy
from rodi import Container
from app.auth import configure_authentication
from app.docs import configure_docs
from app.errors import configure_error_handlers
from app.services import configure_services
from app.settings import load_settings, Settings
from app.middleware import middleware_storage_lang
# from app.scheduler import configure_scheduler

def configure_application(
        services: Container,
        settings: Settings,
) -> Application:
    app = Application(
        services=services, show_error_details=settings.app.show_error_details
    )
    configure_authentication(app, settings)
    configure_error_handlers(app)
    app.middlewares.append(middleware_storage_lang)
    if settings.db_connection_string:
        use_sqlalchemy(app, connection_string=settings.db_connection_string)
    if is_development():
        configure_docs(app, settings)

    # configure_scheduler(app)
    return app


app = configure_application(*configure_services(load_settings()))

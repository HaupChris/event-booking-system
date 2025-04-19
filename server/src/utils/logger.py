import os
import logging
from flask import Flask

def configure_logging(app: Flask) -> None:
    """
    Configures logging to file in production.
    """
    # You can keep app.debug check if you want separate dev logs
    if not os.path.exists('logs'):
        os.mkdir('logs')

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    file_handler = logging.FileHandler('logs/flask_app.log')
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.DEBUG)
    app.logger.addHandler(file_handler)
    root_logger.addHandler(file_handler)

    app.logger.setLevel(logging.DEBUG)
    app.logger.info('Flask app startup')

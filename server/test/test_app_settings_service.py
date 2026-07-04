from flask import Flask
from src.services import app_settings_service as service


def test_public_app_url_uses_request_origin_when_setting_missing(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(service, "DB_FILE_PATH", str(tmp_path / "settings.db"))
    monkeypatch.setattr(service, "DEFAULT_PUBLIC_APP_URL", "http://localhost:3000")

    app = Flask(__name__)
    with app.test_request_context("/api/submitForm", base_url="https://wiesenwahn.de"):
        assert service.get_public_app_url() == "https://wiesenwahn.de"


def test_public_app_url_ignores_localhost_setting_for_public_request(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(service, "DB_FILE_PATH", str(tmp_path / "settings.db"))
    monkeypatch.setattr(service, "DEFAULT_PUBLIC_APP_URL", "http://localhost:3000")
    assert service.set_public_app_url("http://localhost:3000") is True

    app = Flask(__name__)
    with app.test_request_context("/api/profile/recover", base_url="https://wiesenwahn.de"):
        assert service.get_public_app_url() == "https://wiesenwahn.de"


def test_public_app_url_keeps_explicit_public_setting(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(service, "DB_FILE_PATH", str(tmp_path / "settings.db"))
    monkeypatch.setattr(service, "DEFAULT_PUBLIC_APP_URL", "http://localhost:3000")
    assert service.set_public_app_url("https://festival.example") is True

    app = Flask(__name__)
    with app.test_request_context("/api/profile/recover", base_url="https://wiesenwahn.de"):
        assert service.get_public_app_url() == "https://festival.example"

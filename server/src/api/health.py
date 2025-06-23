import time
import os
from flask import Blueprint, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.utils.logger import get_logger

# Initialize logger
logger = get_logger(__name__)

health_bp = Blueprint("health", __name__)
limiter_health = Limiter(get_remote_address)


@health_bp.route("/health", methods=["GET"])
@limiter_health.limit("60/minute")
def health_check():
    """Comprehensive health check with logging."""
    start_time = time.time()

    try:
        logger.debug("Health check started")

        health_status = {
            "status": "healthy",
            "timestamp": time.time(),
            "checks": {}
        }

        # Check database connectivity
        try:
            from src.services.booking_service import _connect_db
            with _connect_db() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()

            health_status["checks"]["database"] = {
                "status": "healthy",
                "message": "Database connection successful"
            }
            logger.debug("Database health check passed")

        except Exception as db_error:
            health_status["status"] = "unhealthy"
            health_status["checks"]["database"] = {
                "status": "unhealthy",
                "message": f"Database connection failed: {str(db_error)}"
            }
            logger.error(f"Database health check failed: {str(db_error)}")

        # Check log directory
        try:
            log_dir = '/app/logs' if os.environ.get('IN_DOCKER') else 'logs'
            if os.path.exists(log_dir) and os.access(log_dir, os.W_OK):
                health_status["checks"]["logging"] = {
                    "status": "healthy",
                    "message": "Log directory accessible"
                }
                logger.debug("Logging health check passed")
            else:
                health_status["status"] = "degraded"
                health_status["checks"]["logging"] = {
                    "status": "unhealthy",
                    "message": "Log directory not accessible"
                }
                logger.warning("Log directory not accessible")

        except Exception as log_error:
            health_status["status"] = "degraded"
            health_status["checks"]["logging"] = {
                "status": "unhealthy",
                "message": f"Logging check failed: {str(log_error)}"
            }
            logger.error(f"Logging health check failed: {str(log_error)}")

        # Check environment variables
        required_env_vars = ['JWT_SECRET_KEY', 'PASSWORD', 'ADMIN_PASSWORD']
        missing_vars = []

        for var in required_env_vars:
            if not os.environ.get(var):
                missing_vars.append(var)

        if missing_vars:
            health_status["status"] = "degraded"
            health_status["checks"]["environment"] = {
                "status": "unhealthy",
                "message": f"Missing environment variables: {', '.join(missing_vars)}"
            }
            logger.warning(f"Missing environment variables: {missing_vars}")
        else:
            health_status["checks"]["environment"] = {
                "status": "healthy",
                "message": "All required environment variables present"
            }
            logger.debug("Environment variables health check passed")

        duration = time.time() - start_time
        health_status["response_time_ms"] = round(duration * 1000, 2)

        # Log based on overall status
        if health_status["status"] == "healthy":
            logger.info(f"Health check passed in {duration:.3f}s")
            return jsonify(health_status), 200
        elif health_status["status"] == "degraded":
            logger.warning(f"Health check degraded in {duration:.3f}s")
            return jsonify(health_status), 200
        else:
            logger.error(f"Health check failed in {duration:.3f}s")
            return jsonify(health_status), 503

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Health check system failure after {duration:.3f}s: {str(e)}", exc_info=True)
        return jsonify({
            "status": "unhealthy",
            "message": "Health check system failure",
            "response_time_ms": round(duration * 1000, 2)
        }), 503


@health_bp.route("/health/simple", methods=["GET"])
@limiter_health.limit("120/minute")
def simple_health_check():
    """Simple health check for load balancers."""
    logger.debug("Simple health check accessed")
    return jsonify({"status": "ok"}), 200
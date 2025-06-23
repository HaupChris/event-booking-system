import os
import logging
import logging.handlers
import re
from collections import defaultdict
from datetime import datetime, timedelta
import glob
from flask import Flask, request, g
import uuid
import sys


def setup_logging(app: Flask) -> None:
    """
    Configure structured logging with separate files for different purposes.
    """
    # Create logs directory if it doesn't exist
    log_dir = '/app/logs' if os.environ.get('IN_DOCKER') else 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Remove default Flask handler to avoid duplicates
    app.logger.handlers.clear()

    # Define log format
    detailed_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s'
    )

    access_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s'
    )

    # 1. Application Logger (INFO and above)
    app_handler = logging.handlers.TimedRotatingFileHandler(
        filename=os.path.join(log_dir, 'app.log'),
        when='midnight',
        interval=1,
        backupCount=30,
        encoding='utf-8'
    )
    app_handler.setLevel(logging.INFO)
    app_handler.setFormatter(detailed_formatter)
    app_handler.suffix = '%Y-%m-%d'

    # 2. Error Logger (WARNING and above)
    error_handler = logging.handlers.TimedRotatingFileHandler(
        filename=os.path.join(log_dir, 'errors.log'),
        when='midnight',
        interval=1,
        backupCount=30,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.WARNING)
    error_handler.setFormatter(detailed_formatter)
    error_handler.suffix = '%Y-%m-%d'

    # 3. Access Logger (separate logger for HTTP requests)
    access_logger = logging.getLogger('access')
    access_logger.setLevel(logging.INFO)
    access_logger.handlers.clear()

    access_handler = logging.handlers.TimedRotatingFileHandler(
        filename=os.path.join(log_dir, 'access.log'),
        when='midnight',
        interval=1,
        backupCount=30,
        encoding='utf-8'
    )
    access_handler.setLevel(logging.INFO)
    access_handler.setFormatter(access_formatter)
    access_handler.suffix = '%Y-%m-%d'
    access_logger.addHandler(access_handler)

    # 4. Debug Logger (only in development)
    if app.debug or os.environ.get('FLASK_ENV') == 'development':
        debug_handler = logging.handlers.TimedRotatingFileHandler(
            filename=os.path.join(log_dir, 'debug.log'),
            when='midnight',
            interval=1,
            backupCount=7,  # Keep debug logs for only 7 days
            encoding='utf-8'
        )
        debug_handler.setLevel(logging.DEBUG)
        debug_handler.setFormatter(detailed_formatter)
        debug_handler.suffix = '%Y-%m-%d'
        app.logger.addHandler(debug_handler)

    # 5. Console handler for Docker logs (stdout/stderr)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter(
        '%(levelname)s: %(message)s'
    ))

    # 6. Error console handler (stderr for Docker error logs)
    error_console_handler = logging.StreamHandler(sys.stderr)
    error_console_handler.setLevel(logging.ERROR)
    error_console_handler.setFormatter(logging.Formatter(
        'ERROR: %(message)s'
    ))

    # Add handlers to app logger
    app.logger.addHandler(app_handler)
    app.logger.addHandler(error_handler)
    app.logger.addHandler(console_handler)
    app.logger.addHandler(error_console_handler)

    # Set app logger level
    app.logger.setLevel(logging.DEBUG if app.debug else logging.INFO)

    # Configure root logger to catch all other loggers
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(app_handler)
    root_logger.addHandler(error_handler)

    # Clean up old log files on startup
    cleanup_old_logs(log_dir)

    app.logger.info('Logging system initialized')


def cleanup_old_logs(log_dir: str, retention_days: int = 30) -> None:
    """
    Remove log files older than retention_days.
    """
    cutoff_date = datetime.now() - timedelta(days=retention_days)

    # Pattern to match rotated log files
    patterns = [
        'app.log.*',
        'errors.log.*',
        'access.log.*',
        'debug.log.*'
    ]

    removed_count = 0
    for pattern in patterns:
        for log_file in glob.glob(os.path.join(log_dir, pattern)):
            try:
                file_time = datetime.fromtimestamp(os.path.getctime(log_file))
                if file_time < cutoff_date:
                    os.remove(log_file)
                    removed_count += 1
            except OSError:
                pass  # File might have been deleted already

    if removed_count > 0:
        logging.getLogger().info(f'Cleaned up {removed_count} old log files')


def log_request():
    """
    Generate a unique request ID and log request details.
    """
    # Generate unique request ID for tracing
    g.request_id = str(uuid.uuid4())[:8]

    access_logger = logging.getLogger('access')

    # Log basic request info
    access_logger.info(
        f'[{g.request_id}] {request.method} {request.path} '
        f'from {request.remote_addr} | User-Agent: {request.headers.get("User-Agent", "Unknown")}'
    )

    # Log auth status if present
    if 'Authorization' in request.headers:
        access_logger.info(f'[{g.request_id}] Authenticated request')


def log_response(response):
    """
    Log response details.
    """
    access_logger = logging.getLogger('access')
    request_id = getattr(g, 'request_id', 'unknown')

    access_logger.info(
        f'[{request_id}] Response: {response.status_code} | '
        f'Size: {response.content_length or "unknown"} bytes'
    )

    return response


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the request ID context if available.
    Safe to call during module import.
    """
    base_logger = logging.getLogger(name)

    # Create a wrapper that only tries to access Flask context when actually logging
    class SafeRequestLogger:
        def __init__(self, base_logger):
            self.base_logger = base_logger

        def _format_with_request_id(self, msg):
            try:
                from flask import has_request_context, g
                if has_request_context() and hasattr(g, 'request_id'):
                    return f'[{g.request_id}] {msg}'
            except (RuntimeError, ImportError):
                pass
            return msg

        def info(self, msg, *args, **kwargs):
            self.base_logger.info(self._format_with_request_id(msg), *args, **kwargs)

        def warning(self, msg, *args, **kwargs):
            self.base_logger.warning(self._format_with_request_id(msg), *args, **kwargs)

        def error(self, msg, *args, **kwargs):
            self.base_logger.error(self._format_with_request_id(msg), *args, **kwargs)

        def debug(self, msg, *args, **kwargs):
            self.base_logger.debug(self._format_with_request_id(msg), *args, **kwargs)

    return SafeRequestLogger(base_logger)


# Global tracking for security events
failed_attempts = defaultdict(list)
suspicious_ips = set()


def log_security_event(event_type: str, details: dict, severity: str = 'WARNING'):
    """Log security-relevant events with structured format."""
    security_logger = logging.getLogger('security')

    # Format security event consistently
    event_data = {
        'timestamp': datetime.now().isoformat(),
        'request_id': getattr(g, 'request_id', 'unknown'),
        'event_type': event_type,
        'client_ip': request.remote_addr if hasattr(request, 'remote_addr') else 'unknown',
        'user_agent': request.headers.get('User-Agent', 'Unknown') if hasattr(request, 'headers') else 'unknown',
        **details
    }

    log_message = ' | '.join([f"{k}={v}" for k, v in event_data.items()])

    if severity == 'ERROR':
        security_logger.error(f"SECURITY_EVENT | {log_message}")
    else:
        security_logger.warning(f"SECURITY_EVENT | {log_message}")


def detect_suspicious_patterns(request_data: str) -> list:
    """Detect common attack patterns in request data."""
    patterns = {
        'sql_injection': [
            r'union\s+select', r'drop\s+table', r'delete\s+from',
            r'insert\s+into', r'update\s+set', r'or\s+1\s*=\s*1'
        ],
        'xss': [
            r'<script[^>]*>', r'javascript:', r'onload\s*=',
            r'onerror\s*=', r'onclick\s*=', r'alert\s*\('
        ],
        'path_traversal': [
            r'\.\./', r'\.\.\\', r'%2e%2e%2f', r'%252e%252e%252f'
        ],
        'command_injection': [
            r';\s*rm\s', r';\s*cat\s', r';\s*ls\s', r'`[^`]*`',
            r'\$\([^)]*\)', r'&&\s*\w+', r'\|\|\s*\w+'
        ]
    }

    detected = []
    request_lower = request_data.lower()

    for attack_type, pattern_list in patterns.items():
        for pattern in pattern_list:
            if re.search(pattern, request_lower, re.IGNORECASE):
                detected.append(attack_type)
                break

    return detected


def track_failed_authentication(client_ip: str, endpoint: str):
    """Track and alert on repeated authentication failures."""
    now = datetime.now()

    # Clean old attempts (older than 1 hour)
    failed_attempts[client_ip] = [
        attempt for attempt in failed_attempts[client_ip]
        if now - attempt < timedelta(hours=1)
    ]

    failed_attempts[client_ip].append(now)
    attempt_count = len(failed_attempts[client_ip])

    # Log escalating severity based on attempt count
    if attempt_count >= 20:
        log_security_event('BRUTE_FORCE_ATTACK', {
            'endpoint': endpoint,
            'attempt_count': attempt_count,
            'time_window': '1_hour'
        }, severity='ERROR')
        suspicious_ips.add(client_ip)
    elif attempt_count >= 5:
        log_security_event('MULTIPLE_AUTH_FAILURES', {
            'endpoint': endpoint,
            'attempt_count': attempt_count,
            'time_window': '1_hour'
        })


def enhanced_log_request():
    """Enhanced request logging with security monitoring."""
    # Generate unique request ID
    g.request_id = str(uuid.uuid4())[:8]

    access_logger = logging.getLogger('access')

    # Basic request logging
    access_logger.info(
        f'[{g.request_id}] {request.method} {request.path} '
        f'from {request.remote_addr} | User-Agent: {request.headers.get("User-Agent", "Unknown")}'
    )

    # Security monitoring
    client_ip = request.remote_addr

    # Check if IP is already flagged as suspicious
    if client_ip in suspicious_ips:
        log_security_event('REQUEST_FROM_SUSPICIOUS_IP', {
            'path': request.path,
            'method': request.method
        })

    # Analyze request data for attacks
    try:
        # Check URL path
        if '../' in request.path or '..\\' in request.path:
            log_security_event('PATH_TRAVERSAL_ATTEMPT', {
                'path': request.path,
                'method': request.method
            })

        # Check request body if present
        if request.content_length and request.content_length > 0:
            request_data = request.get_data(as_text=True)[:1000]  # First 1000 chars

            suspicious_patterns = detect_suspicious_patterns(request_data)
            if suspicious_patterns:
                log_security_event('MALICIOUS_PAYLOAD_DETECTED', {
                    'attack_types': suspicious_patterns,
                    'path': request.path,
                    'method': request.method,
                    'payload_sample': request_data[:200]  # First 200 chars for analysis
                })

        # Check for unusual headers
        suspicious_headers = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip']
        for header in suspicious_headers:
            if header in request.headers:
                log_security_event('PROXY_HEADER_DETECTED', {
                    'header': header,
                    'value': request.headers[header],
                    'path': request.path
                })

    except Exception as e:
        # Don't let security logging break the app
        logging.getLogger(__name__).warning(f"Security analysis failed: {e}")


def log_authentication_event(event_type: str, user_identity: str, success: bool):
    """Log authentication events with context."""
    if success:
        log_security_event('AUTH_SUCCESS', {
            'user_identity': user_identity,
            'endpoint': request.endpoint
        })
    else:
        track_failed_authentication(request.remote_addr, request.endpoint)
        log_security_event('AUTH_FAILURE', {
            'user_identity': user_identity,
            'endpoint': request.endpoint
        })

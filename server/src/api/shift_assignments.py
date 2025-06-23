import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.models.datatypes import ShiftAssignment
from src.services.shift_assignment_service import (
    create_assignment,
    update_assignment,
    delete_assignment,
    get_booking_assignments_summary,
    get_timeslot_summary,
    run_auto_assignment,
    get_booking_shift_count,
    get_booking_max_shifts,
    get_timeslot_assignment_count,
    get_timeslot_capacity
)
from src.utils.logger import get_logger, log_security_event

# Initialize logger
logger = get_logger(__name__)

shift_assignments_bp = Blueprint("shift_assignments", __name__)
limiter_assignments = Limiter(get_remote_address)


@shift_assignments_bp.route("/shifts/assignments", methods=["POST"])
@limiter_assignments.limit("100/minute")
@jwt_required()
def create_shift_assignment():
    """Create shift assignment with comprehensive validation and logging."""
    start_time = time.time()

    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity != "admin":
            logger.warning(f"Unauthorized shift assignment attempt by {identity} from {request.remote_addr}")
            log_security_event('UNAUTHORIZED_SHIFT_ASSIGNMENT', {
                'endpoint': 'create_shift_assignment',
                'user_identity': identity
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} creating shift assignment")

        if not request.json:
            logger.warning("Shift assignment creation failed: missing JSON body")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json

        # Validate required fields
        if 'booking_id' not in data or 'timeslot_id' not in data:
            logger.warning(f"Shift assignment creation failed: missing required fields - {data.keys()}")
            return jsonify({"error": "Missing required fields"}), 400

        booking_id = data['booking_id']
        timeslot_id = data['timeslot_id']

        logger.info(f"Creating assignment: booking {booking_id} -> timeslot {timeslot_id}")

        # Check if booking already has max shifts assigned
        current_shifts = get_booking_shift_count(booking_id)
        max_shifts = get_booking_max_shifts(booking_id)

        if current_shifts >= max_shifts:
            logger.warning(
                f"Assignment rejected: booking {booking_id} already has {current_shifts}/{max_shifts} shifts")
            return jsonify({
                "error": "Booking already has maximum shifts assigned",
                "current": current_shifts,
                "max": max_shifts
            }), 400

        # Check if timeslot has capacity
        current_assigned = get_timeslot_assignment_count(timeslot_id)
        capacity = get_timeslot_capacity(timeslot_id)

        if current_assigned >= capacity:
            logger.warning(f"Assignment rejected: timeslot {timeslot_id} at capacity {current_assigned}/{capacity}")
            return jsonify({
                "error": "Timeslot is already at capacity",
                "current": current_assigned,
                "capacity": capacity
            }), 400

        # Create assignment
        assignment = ShiftAssignment(
            booking_id=booking_id,
            timeslot_id=timeslot_id,
            is_confirmed=data.get('is_confirmed', True),
            admin_notes=data.get('admin_notes', '')
        )

        assignment_id = create_assignment(assignment)

        if assignment_id < 0:
            logger.error(f"Failed to create assignment: booking {booking_id} -> timeslot {timeslot_id}")
            return jsonify({"error": "Assignment creation failed"}), 500

        duration = time.time() - start_time
        logger.info(
            f"Assignment {assignment_id} created successfully in {duration:.3f}s: booking {booking_id} -> timeslot {timeslot_id}")

        return jsonify({
            "message": "Assignment created successfully",
            "assignment_id": assignment_id
        }), 201

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Assignment creation failed after {duration:.3f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Assignment creation failed"}), 500


@shift_assignments_bp.route("/shifts/assignments/<int:assignment_id>", methods=["PUT"])
@limiter_assignments.limit("100/minute")
@jwt_required()
def update_shift_assignment(assignment_id):
    """Update shift assignment with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity != "admin":
            logger.warning(f"Unauthorized assignment update attempt by {identity} for assignment {assignment_id}")
            log_security_event('UNAUTHORIZED_ASSIGNMENT_UPDATE', {
                'endpoint': 'update_shift_assignment',
                'user_identity': identity,
                'assignment_id': assignment_id
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} updating assignment {assignment_id}")

        if not request.json:
            logger.warning(f"Assignment update failed: missing JSON body for assignment {assignment_id}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        success = update_assignment(assignment_id, data)

        if success:
            logger.info(f"Assignment {assignment_id} updated successfully by admin {identity}")
            return jsonify({"message": "Assignment updated successfully"}), 200
        else:
            logger.warning(f"Assignment update failed: assignment {assignment_id} not found")
            return jsonify({"error": "Assignment not found"}), 404

    except Exception as e:
        logger.error(f"Failed to update assignment {assignment_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to update assignment"}), 500


@shift_assignments_bp.route("/shifts/assignments/<int:assignment_id>", methods=["DELETE"])
@limiter_assignments.limit("60/minute")
@jwt_required()
def delete_shift_assignment(assignment_id):
    """Delete shift assignment with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity != "admin":
            logger.warning(f"Unauthorized assignment deletion attempt by {identity} for assignment {assignment_id}")
            log_security_event('UNAUTHORIZED_ASSIGNMENT_DELETE', {
                'endpoint': 'delete_shift_assignment',
                'user_identity': identity,
                'assignment_id': assignment_id
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.warning(f"Admin {identity} deleting assignment {assignment_id}")  # Use warning for deletions

        success = delete_assignment(assignment_id)

        if success:
            logger.warning(f"Assignment {assignment_id} deleted by admin {identity}")
            return jsonify({"message": "Assignment deleted successfully"}), 200
        else:
            logger.warning(f"Assignment deletion failed: assignment {assignment_id} not found")
            return jsonify({"error": "Assignment not found"}), 404

    except Exception as e:
        logger.error(f"Failed to delete assignment {assignment_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to delete assignment"}), 500


@shift_assignments_bp.route("/shifts/summary/bookings", methods=["GET"])
@limiter_assignments.limit("200/minute")
@jwt_required()
def get_bookings_summary():
    """Get booking assignments summary with performance monitoring."""
    start_time = time.time()

    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity != "admin":
            logger.warning(f"Unauthorized booking summary access by {identity} from {request.remote_addr}")
            log_security_event('UNAUTHORIZED_BOOKING_SUMMARY_ACCESS', {
                'endpoint': 'get_bookings_summary',
                'user_identity': identity
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} accessing booking assignments summary")

        summary = get_booking_assignments_summary()
        booking_count = len(summary) if summary else 0

        duration = time.time() - start_time
        logger.info(f"Booking summary generated for {booking_count} bookings in {duration:.3f}s")

        if duration > 2.0:
            logger.warning(f"Slow booking summary generation: {duration:.3f}s for {booking_count} bookings")

        return jsonify(summary), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Failed to generate booking summary after {duration:.3f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate booking summary"}), 500


@shift_assignments_bp.route("/shifts/summary/timeslots", methods=["GET"])
@limiter_assignments.limit("200/minute")
@jwt_required()
def get_timeslots_summary():
    """Get timeslot summary with performance monitoring."""
    start_time = time.time()

    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity != "admin":
            logger.warning(f"Unauthorized timeslot summary access by {identity} from {request.remote_addr}")
            log_security_event('UNAUTHORIZED_TIMESLOT_SUMMARY_ACCESS', {
                'endpoint': 'get_timeslots_summary',
                'user_identity': identity
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} accessing timeslot summary")

        summary = get_timeslot_summary()
        timeslot_count = len(summary) if summary else 0

        duration = time.time() - start_time
        logger.info(f"Timeslot summary generated for {timeslot_count} timeslots in {duration:.3f}s")

        if duration > 2.0:
            logger.warning(f"Slow timeslot summary generation: {duration:.3f}s for {timeslot_count} timeslots")

        return jsonify(summary), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Failed to generate timeslot summary after {duration:.3f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate timeslot summary"}), 500


@shift_assignments_bp.route("/shifts/autoassign", methods=["POST"])
@limiter_assignments.limit("20/minute")
@jwt_required()
def auto_assign_shifts():
    """Run auto-assignment with comprehensive logging."""
    start_time = time.time()

    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity != "admin":
            logger.warning(f"Unauthorized auto-assignment attempt by {identity} from {request.remote_addr}")
            log_security_event('UNAUTHORIZED_AUTO_ASSIGNMENT', {
                'endpoint': 'auto_assign_shifts',
                'user_identity': identity
            })
            return jsonify({"error": "Unauthorized"}), 403

        if not request.json:
            logger.warning("Auto-assignment failed: missing JSON body")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        strategy = data.get('strategy', 'priority')
        reset = data.get('reset', False)

        logger.info(f"Admin {identity} starting auto-assignment with strategy: {strategy}, reset: {reset}")

        if strategy not in ['priority', 'fill']:
            logger.warning(f"Auto-assignment failed: invalid strategy '{strategy}'")
            return jsonify({"error": "Invalid strategy"}), 400

        result = run_auto_assignment(strategy)

        if 'error' in result:
            logger.error(f"Auto-assignment failed with strategy {strategy}: {result['error']}")
            return jsonify({"error": result['error']}), 500

        duration = time.time() - start_time
        assignments_made = result.get('assignments_made', 0)
        logger.info(
            f"Auto-assignment completed in {duration:.3f}s: {assignments_made} assignments made with strategy {strategy}")

        if duration > 30.0:  # Log slow auto-assignments
            logger.warning(f"Slow auto-assignment: {duration:.3f}s for {assignments_made} assignments")

        return jsonify(result), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Auto-assignment failed after {duration:.3f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Auto-assignment failed"}), 500
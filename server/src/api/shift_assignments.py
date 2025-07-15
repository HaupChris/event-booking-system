from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.models.datatypes import ShiftAssignment
from src.services.shift_assignment_service import (
    get_all_shift_assignments,
    get_assignments_by_timeslot,
    get_assignments_by_booking,
    create_assignment,
    update_assignment,
    delete_assignment,
    get_booking_shift_count,
    get_booking_max_shifts,
    get_timeslot_capacity,
    get_timeslot_assignment_count,
    get_booking_assignments_summary,
    get_timeslot_summary
)

shift_assignments_bp = Blueprint("shift_assignments", __name__)
limiter_assignments = Limiter(get_remote_address)


@shift_assignments_bp.route("/shifts/assignments", methods=["GET"])
@limiter_assignments.limit("200/minute")
@jwt_required()
def get_assignments():
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    timeslot_id = request.args.get('timeslot_id')
    booking_id = request.args.get('booking_id')

    if timeslot_id:
        # Get assignments for specific timeslot
        assignments = get_assignments_by_timeslot(int(timeslot_id))
    elif booking_id:
        # Get assignments for specific booking
        assignments = get_assignments_by_booking(int(booking_id))
    else:
        # Get all assignments
        assignments = get_all_shift_assignments()

    return jsonify([vars(a) for a in assignments]), 200


@shift_assignments_bp.route("/shifts/assignments", methods=["POST"])
@limiter_assignments.limit("100/minute")
@jwt_required()
def create_shift_assignment():
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json

    # Validate required fields
    if 'booking_id' not in data or 'timeslot_id' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    # Check if booking already has max shifts assigned
    current_shifts = get_booking_shift_count(data['booking_id'])
    max_shifts = get_booking_max_shifts(data['booking_id'])

    if current_shifts >= max_shifts:
        return jsonify({
            "error": "Booking already has maximum shifts assigned",
            "current": current_shifts,
            "max": max_shifts
        }), 400

    # Check if timeslot has capacity
    current_assigned = get_timeslot_assignment_count(data['timeslot_id'])
    capacity = get_timeslot_capacity(data['timeslot_id'])

    if current_assigned >= capacity:
        return jsonify({
            "error": "Timeslot is already at capacity",
            "current": current_assigned,
            "capacity": capacity
        }), 400

    # Create assignment
    assignment = ShiftAssignment(
        booking_id=data['booking_id'],
        timeslot_id=data['timeslot_id'],
        is_confirmed=data.get('is_confirmed', True),
        admin_notes=data.get('admin_notes', '')
    )

    assignment_id = create_assignment(assignment)

    if assignment_id < 0:
        return jsonify({"error": "Assignment already exists"}), 400

    if assignment_id == 0:
        return jsonify({"error": "Failed to create assignment"}), 500

    return jsonify({
        "message": "Assignment created successfully",
        "id": assignment_id
    }), 201


@shift_assignments_bp.route("/shifts/assignments/<int:assignment_id>", methods=["PUT"])
@limiter_assignments.limit("100/minute")
@jwt_required()
def update_shift_assignment(assignment_id):
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json

    # Create assignment object (only update is_confirmed and notes)
    assignment = ShiftAssignment(
        booking_id=0,  # not used for update
        timeslot_id=0,  # not used for update
        is_confirmed=data.get('is_confirmed', True),
        admin_notes=data.get('admin_notes', '')
    )

    success = update_assignment(assignment_id, assignment)

    if not success:
        return jsonify({"error": "Assignment not found"}), 404

    return jsonify({"message": "Assignment updated successfully"}), 200


@shift_assignments_bp.route("/shifts/assignments/<int:assignment_id>", methods=["DELETE"])
@limiter_assignments.limit("100/minute")
@jwt_required()
def delete_shift_assignment(assignment_id):
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    success = delete_assignment(assignment_id)

    if not success:
        return jsonify({"error": "Assignment not found"}), 404

    return jsonify({"message": "Assignment deleted successfully"}), 200


@shift_assignments_bp.route("/shifts/summary/bookings", methods=["GET"])
@limiter_assignments.limit("200/minute")
@jwt_required()
def get_bookings_summary():
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    summary = get_booking_assignments_summary()
    return jsonify(summary), 200


@shift_assignments_bp.route("/shifts/summary/timeslots", methods=["GET"])
@limiter_assignments.limit("200/minute")
@jwt_required()
def get_timeslots_summary():
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    summary = get_timeslot_summary()
    return jsonify(summary), 200


@shift_assignments_bp.route("/shifts/bulk-assign", methods=["POST"])
@limiter_assignments.limit("20/minute")
@jwt_required()
def bulk_assign_shifts():
    """Assign multiple users to multiple timeslots"""
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    user_ids = data.get('user_ids', [])
    timeslot_ids = data.get('timeslot_ids', [])

    if not user_ids or not timeslot_ids:
        return jsonify({"error": "Missing user_ids or timeslot_ids"}), 400

    successful = 0
    failed = []

    for user_id in user_ids:
        for timeslot_id in timeslot_ids:
            # Check if user can be assigned
            current_shifts = get_booking_shift_count(user_id)
            max_shifts = get_booking_max_shifts(user_id)

            if current_shifts >= max_shifts:
                failed.append({
                    'user_id': user_id,
                    'timeslot_id': timeslot_id,
                    'reason': 'User at maximum shifts'
                })
                continue

            # Check timeslot capacity
            current_assigned = get_timeslot_assignment_count(timeslot_id)
            capacity = get_timeslot_capacity(timeslot_id)

            if current_assigned >= capacity:
                failed.append({
                    'user_id': user_id,
                    'timeslot_id': timeslot_id,
                    'reason': 'Timeslot at capacity'
                })
                continue

            # Create assignment
            assignment = ShiftAssignment(
                booking_id=user_id,
                timeslot_id=timeslot_id,
                is_confirmed=True
            )

            assignment_id = create_assignment(assignment)
            if assignment_id > 0:
                successful += 1
            else:
                failed.append({
                    'user_id': user_id,
                    'timeslot_id': timeslot_id,
                    'reason': 'Assignment already exists or creation failed'
                })

    return jsonify({
        'successful_assignments': successful,
        'failed_assignments': failed
    }), 200
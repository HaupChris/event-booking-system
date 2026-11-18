"""Server-side booking prices and server-owned booking fields.

Prices and payment status are always determined here, never taken from the client.
The calculation mirrors frontend/src/components/core/utils/Pricing.ts.
"""

from typing import Any

# Fields a booking submission must never set; they are only changed by admins.
SERVER_OWNED_PAYMENT_DEFAULTS: dict[str, Any] = {
    "is_paid": False,
    "paid_amount": 0.0,
    "payment_notes": "",
    "payment_date": "",
}

NO_OPTION_SELECTED = -1


def _option_price(options: list[dict[str, Any]], option_id: int, *, required: bool) -> float:
    if option_id == NO_OPTION_SELECTED and not required:
        return 0.0
    for option in options:
        if int(option.get("id", NO_OPTION_SELECTED)) == option_id:
            return float(option.get("price") or 0)
    raise ValueError(f"Unknown option id {option_id}")


def calculate_option_total(
    form_content: dict[str, Any], ticket_id: int, beverage_id: int, food_id: int
) -> float:
    """Sum of ticket, beverage and food price. Raises ValueError for unknown options."""
    if not form_content.get("ticket_options"):
        raise ValueError("Form content is not available")

    total = (
        _option_price(form_content["ticket_options"], ticket_id, required=True)
        + _option_price(form_content.get("beverage_options", []), beverage_id, required=False)
        + _option_price(form_content.get("food_options", []), food_id, required=False)
    )
    return round(total, 2)


def calculate_shift_discount(form_content: dict[str, Any], amount_shifts: int) -> float:
    """Every shift beyond the first is rewarded with one free meal (price of the first meal)."""
    food_options = form_content.get("food_options", [])
    if amount_shifts <= 1 or not food_options:
        return 0.0
    return round(float(food_options[0].get("price") or 0) * (amount_shifts - 1), 2)


def calculate_regular_total_price(
    form_content: dict[str, Any], ticket_id: int, beverage_id: int, food_id: int, amount_shifts: int
) -> float:
    option_total = calculate_option_total(form_content, ticket_id, beverage_id, food_id)
    return round(option_total - calculate_shift_discount(form_content, amount_shifts), 2)

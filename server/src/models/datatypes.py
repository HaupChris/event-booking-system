from dataclasses import dataclass
from typing import List, Dict
from py_ts_interfaces import Interface

@dataclass
class TimeSlot(Interface):
    id: int
    title: str
    start_time: str
    end_time: str
    num_needed: int
    num_booked: int = 0

@dataclass
class WorkShift(Interface):
    id: int
    title: str
    description: str
    time_slots: List[TimeSlot]

@dataclass
class Material(Interface):
    id: int
    title: str
    num_needed: int
    num_booked: int = 0

@dataclass
class BeverageOption(Interface):
    id: int
    title: str
    description: str
    price: float
    num_booked: int = 0

@dataclass
class FoodOption(Interface):
    id: int
    title: str
    description: str
    price: float
    num_booked: int = 0

@dataclass
class TicketOption(Interface):
    id: int
    title: str
    price: float
    amount: int
    num_booked: int = 0

@dataclass
class FormContent(Interface):
    ticket_options: List[TicketOption]
    beverage_options: List[BeverageOption]
    food_options: List[FoodOption]
    work_shifts: List[WorkShift]
    materials: List[Material]

@dataclass
class Booking(Interface):
    last_name: str
    first_name: str
    email: str
    phone: str
    ticket_id: int
    beverage_id: int
    food_id: int
    timeslot_priority_1: int
    timeslot_priority_2: int
    timeslot_priority_3: int
    material_ids: List[int]
    amount_shifts: int
    supporter_buddy: str
    total_price: float
    signature: str

@dataclass
class BookingWithTimestamp(Booking):
    timestamp: str

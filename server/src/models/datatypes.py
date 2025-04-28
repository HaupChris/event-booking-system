from dataclasses import dataclass, field
from typing import List
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
class ArtistMaterial(Interface):
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
    artist_materials: List[ArtistMaterial] = field(default_factory=list)

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
    is_paid: bool
    paid_amount: float
    payment_notes: str
    payment_date: str
    artist_material_ids: List[int] = field(default_factory=list)

@dataclass
class BookingWithTimestamp(Booking):
    id: int = -1
    timestamp: str = ""


@dataclass
class ArtistBooking(Interface):
    last_name: str
    first_name: str
    email: str
    phone: str
    ticket_id: int
    beverage_id: int
    food_id: int
    artist_material_ids: List[int]
    total_price: float
    signature: str
    is_paid: bool = False
    paid_amount: float = 0.0
    payment_notes: str = ""
    payment_date: str = ""
    equipment: str = ""
    special_requests: str = ""
    performance_details: str = ""


@dataclass
class ArtistBookingWithTimestamp(ArtistBooking):
    id: int = -1
    timestamp: str = ""


@dataclass
class ArtistFormContent(Interface):
    ticket_options: List[TicketOption]
    beverage_options: List[BeverageOption]
    food_options: List[FoodOption]
    artist_materials: List[ArtistMaterial]
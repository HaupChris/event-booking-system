from dataclasses import dataclass
from typing import List, Dict
from py_ts_interfaces import Interface


@dataclass
class TimeSlot(Interface):
    title: str
    start_time: str
    end_time: str
    needed_workers: int
    taken_workers: int = 0


@dataclass
class WorkShift(Interface):
    title: str
    description: str
    time_slots: List[TimeSlot]

    @staticmethod
    def from_dict(data: Dict) -> 'WorkShift':
        return WorkShift(
            title=data['title'],
            description=data['description'],
            time_slots=[TimeSlot(**time_slot) for time_slot in data['time_slots']]
        )


@dataclass
class Material(Interface):
    title: str
    num_needed: int
    num_brought: int = 0


@dataclass
class BeverageOption(Interface):
    title: str
    description: str
    price: float
    chosen: int = 0


@dataclass
class TicketOption(Interface):
    title: str
    price: float
    amount: int
    taken: int = 0


@dataclass
class FormContent(Interface):
    ticket_options: List[TicketOption]
    beverage_options: List[BeverageOption]
    work_shifts: List[WorkShift]
    materials: List[Material]

    @staticmethod
    def from_dict(data: Dict) -> 'FormContent':
        return FormContent(
            ticket_options=[TicketOption(**ticket_option) for ticket_option in data['ticket_options']],
            beverage_options=[BeverageOption(**beverage_option) for beverage_option in data['beverage_options']],
            work_shifts=[WorkShift.from_dict(work_shift) for work_shift in data['work_shifts']],
            materials=[Material(**material) for material in data['materials']]
        )


@dataclass
class Booking(Interface):
    last_name: str
    first_name: str
    email: str
    phone: str
    street: str
    postal_code: str
    city: str
    ticket_title: str
    beverage_title: str
    work_shift_priority_1: str
    work_shift_priority_2: str
    work_shift_priority_3: str
    amount_shifts: int
    total_price: float
    signature: bytes




from dataclasses import dataclass
from typing import List, Dict, Tuple
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

    @staticmethod
    def from_dict(idx, data: Dict) -> 'WorkShift':
        return WorkShift(
            id=idx,
            title=data['title'],
            description=data['description'],
            time_slots=[TimeSlot(0, **time_slot) for time_slot in data['time_slots']]
        )


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
    work_shifts: List[WorkShift]
    materials: List[Material]

    @staticmethod
    def from_dict(data: Dict) -> 'FormContent':
        timeslot_idx = 0
        work_shifts = []
        for idx, work_shift in enumerate(data['work_shifts']):
            work_shifts.append(WorkShift.from_dict(idx, work_shift))
            for time_slot in work_shifts[idx].time_slots:
                time_slot.id = timeslot_idx
                timeslot_idx += 1

        return FormContent(
            ticket_options=[TicketOption(idx, **ticket_option) for idx, ticket_option in enumerate(data['ticket_options'])],
            beverage_options=[BeverageOption(idx, **beverage_option) for idx, beverage_option in enumerate(data['beverage_options'])],
            work_shifts=work_shifts,
            materials=[Material(idx, **material) for idx, material in enumerate(data['materials'])]
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
    ticket_id: str
    beverage_id: str
    timeslot_priority_1: int
    timeslot_priority_2: int
    timeslot_priority_3: int
    material_ids: List[int]
    amount_shifts: int
    total_price: float
    # signature: bytes




// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface TimeSlot {
    title: string;
    start: string;
    end: string;
    needed_workers: number;
    taken_workers: number;
}

interface WorkShift {
    title: string;
    description: string;
    time_slots: Array<TimeSlot>;
}

interface Material {
    title: string;
    num_needed: number;
    num_brought: number;
}

interface BeverageOption {
    title: string;
    description: string;
    price: number;
    chosen: number;
}

interface TicketOption {
    title: string;
    price: number;
    amount: number;
    taken: number;
}

interface FormContent {
    ticket_options: Array<TicketOption>;
    beverage_options: Array<BeverageOption>;
    work_shifts: Array<WorkShift>;
    materials: Array<Material>;
}

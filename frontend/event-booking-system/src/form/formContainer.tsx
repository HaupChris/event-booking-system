

interface Address {
    street: string;
    city: string;
    postcode: string;
}

interface TicketOption {
    name: string;
    price: number;
}

interface BeverageOption {
    name: string;
    price: number;
}

interface WorkshiftWithPriority {
    workshift: string;
    priority: number;
}



interface FormData {
    name: string;
    address: Address;
    selectedTicket: TicketOption;
    selectedBeverage: BeverageOption;
    selectedWorkshiftsWithPrioritiy: WorkshiftWithPriority[];
}

export function FormContainer() {
    return <div>FormContainer</div>;
}

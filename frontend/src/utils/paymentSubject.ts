interface PaymentSubjectOptions {
  firstName: string;
  lastName: string;
  ticketTitle: string;
  beverageTitle: string;
  foodTitle: string;
  totalPrice: number;
}

export const createPaymentSubject = ({
  firstName,
  lastName,
  ticketTitle,
  beverageTitle,
  foodTitle,
  totalPrice,
}: PaymentSubjectOptions): string =>
  `WWWW: ${lastName}, ${firstName} - ${ticketTitle} - ${beverageTitle} - ${foodTitle} - ${totalPrice}€`;

export interface TicketResponse {
  id: number;
  seatNumber: number;
  status: string;
  bookedAt: string;
  showId: number;
  showTitle: string;
  showDateTime: string;
  showVenue: string;
}

export function toTicketResponse(ticket: any): TicketResponse {
  const show = ticket.show;
  return {
    id: ticket.id,
    seatNumber: ticket.seatNumber,
    status: ticket.status,
    bookedAt: ticket.bookedAt instanceof Date
      ? ticket.bookedAt.toISOString()
      : String(ticket.bookedAt),
    showId: show.id,
    showTitle: show.title,
    showDateTime: show.showDateTime instanceof Date
      ? show.showDateTime.toISOString()
      : String(show.showDateTime),
    showVenue: show.venue,
  };
}

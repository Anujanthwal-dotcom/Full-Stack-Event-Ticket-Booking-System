export interface ShowResponse {
  id: number;
  title: string;
  description: string | null;
  showDateTime: string;
  venue: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  createdById: number;
  createdAt: string;
}

export function toShowResponse(show: any): ShowResponse {
  return {
    id: show.id,
    title: show.title,
    description: show.description ?? null,
    showDateTime: show.showDateTime instanceof Date
      ? show.showDateTime.toISOString()
      : String(show.showDateTime),
    venue: show.venue,
    totalSeats: show.totalSeats,
    availableSeats: show.availableSeats,
    price: Number(show.price),
    createdById: show.createdById,
    createdAt: show.createdAt instanceof Date
      ? show.createdAt.toISOString()
      : String(show.createdAt),
  };
}

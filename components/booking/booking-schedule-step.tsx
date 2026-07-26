"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { BOOKING_TIME_SLOTS } from "@/lib/booking/booking-status";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BookingScheduleStep({
  defaultValues,
  onSubmit,
}: {
  defaultValues: { date: string; timeSlot: string; notes: string };
  onSubmit: (data: { date: string; timeSlot: string; notes: string }) => void;
}) {
  const [date, setDate] = useState(defaultValues.date || todayIsoDate());
  const [timeSlot, setTimeSlot] = useState(defaultValues.timeSlot);
  const [notes, setNotes] = useState(defaultValues.notes);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!date) {
      setError("Choose a date for your appointment.");
      return;
    }
    if (!timeSlot) {
      setError("Choose a time slot.");
      return;
    }
    setError(null);
    onSubmit({ date, timeSlot, notes });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <CalendarDays className="h-5 w-5 text-primary" />
        When would you like this done?
      </h2>

      <div className="mt-4 space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" min={todayIsoDate()} value={date} onChange={(e) => setDate(e.target.value)} className="max-w-xs" />
      </div>

      <div className="mt-4 space-y-2">
        <Label>Time</Label>
        <div className="flex flex-wrap gap-2">
          {BOOKING_TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setTimeSlot(slot)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                timeSlot === slot ? "border-primary bg-accent text-primary" : "hover:border-primary",
              )}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="notes">Notes for the provider (optional)</Label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. number of cameras, your child's age, what you'd like to cover..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Button type="submit" className="mt-6">
        Continue
      </Button>
    </form>
  );
}

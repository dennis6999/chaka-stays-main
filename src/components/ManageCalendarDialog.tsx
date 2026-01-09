import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Trash, X } from 'lucide-react';
import { addDays, format, isSameDay } from 'date-fns';
import { DateRange } from "react-day-picker";

interface ManageCalendarDialogProps {
    propertyId: string | null;
    propertyTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

interface BlockedDate {
    id: string;
    start_date: string;
    end_date: string;
    reason?: string;
}

export function ManageCalendarDialog({ propertyId, propertyTitle, isOpen, onClose }: ManageCalendarDialogProps) {
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
    const [submitting, setSubmitting] = useState(false);

    const fetchBlockedDates = React.useCallback(async () => {
        if (!propertyId) return;
        try {
            setLoading(true);
            const data = await api.getBlockedDates(propertyId);
            setBlockedDates(data);
        } catch (error) {
            console.error("Failed to fetch blocked dates", error);
            toast.error("Could not load calendar");
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        if (isOpen && propertyId) {
            fetchBlockedDates();
            setSelectedRange(undefined);
        }
    }, [isOpen, propertyId, fetchBlockedDates]);

    const handleBlockDates = async () => {
        if (!propertyId || !selectedRange?.from || !selectedRange?.to) return;

        try {
            setSubmitting(true);
            await api.blockDates({
                property_id: propertyId,
                start_date: selectedRange.from,
                end_date: selectedRange.to,
                reason: 'Manual block'
            });

            toast.success("Dates blocked successfully");
            await fetchBlockedDates();
            setSelectedRange(undefined);
        } catch (error) {
            console.error("Failed to block dates", error);
            toast.error("Failed to block these dates");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveBlock = async (id: string) => {
        try {
            // Optimistic update
            const previous = blockedDates;
            setBlockedDates(prev => prev.filter(b => b.id !== id));

            await api.removeBlock(id);
            toast.success("Block removed");
        } catch (error) {
            console.error("Failed to remove block", error);
            toast.error("Failed to remove block");
            fetchBlockedDates(); // Revert on failure
        }
    };

    // Convert blocked dates to disabled matchers for the calendar
    const disabledDays = blockedDates.map(block => ({
        from: new Date(block.start_date),
        to: new Date(block.end_date)
    }));

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Availability: {propertyTitle}</DialogTitle>
                    <DialogDescription>
                        Select a date range to block it from availability. Guests won't be able to book these dates.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* Calendar Section */}
                    <div className="flex flex-col items-center border rounded-lg p-4 bg-card">
                        <Calendar
                            mode="range"
                            selected={selectedRange}
                            onSelect={setSelectedRange}
                            disabled={disabledDays}
                            fromDate={new Date()}
                            className="rounded-md border shadow-sm"
                            numberOfMonths={1}
                        />

                        <div className="w-full mt-4 space-y-2">
                            <div className="text-sm font-medium">Selected Range:</div>
                            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                {selectedRange?.from ? (
                                    selectedRange.to ? (
                                        `${format(selectedRange.from, 'MMM d, yyyy')} - ${format(selectedRange.to, 'MMM d, yyyy')}`
                                    ) : (
                                        format(selectedRange.from, 'MMM d, yyyy')
                                    )
                                ) : (
                                    "No dates selected"
                                )}
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleBlockDates}
                                disabled={!selectedRange?.from || !selectedRange?.to || submitting}
                            >
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Block Dates
                            </Button>
                        </div>
                    </div>

                    {/* List of Blocks */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center justify-between">
                            Blocked Periods
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </h3>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {blockedDates.length === 0 && !loading && (
                                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                    <span className="block mb-1">📅</span>
                                    No dates blocked manually.
                                </div>
                            )}

                            {blockedDates.map(block => (
                                <div key={block.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border group hover:bg-muted/60 transition-colors">
                                    <div className="text-sm">
                                        <span className="font-medium">
                                            {format(new Date(block.start_date), 'MMM d, yyyy')}
                                        </span>
                                        <span className="text-muted-foreground mx-2">→</span>
                                        <span className="font-medium">
                                            {format(new Date(block.end_date), 'MMM d, yyyy')}
                                        </span>
                                        {block.reason && (
                                            <div className="text-xs text-muted-foreground mt-0.5">{block.reason}</div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => handleRemoveBlock(block.id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

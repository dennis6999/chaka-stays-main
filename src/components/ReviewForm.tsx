import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/services/api';

interface ReviewFormProps {
    propertyId: string;
    userId: string;
    onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ propertyId, userId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.createReview({
                property_id: propertyId,
                user_id: userId,
                rating,
                comment
            });
            toast.success('Review submitted successfully!');
            setComment('');
            setRating(5);
            onReviewSubmitted();
        } catch (error: unknown) {
            console.error('Error submitting review:', error);
            const err = error as { code?: string; message?: string };
            if (err.code === '23505' || err.message?.includes('duplicate key')) {
                toast.error('You have already reviewed this property');
            } else {
                toast.error(err.message || 'Failed to submit review');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-xl font-serif font-bold">Write a Review</h3>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">Your Experience</label>
                <Textarea
                    id="comment"
                    placeholder="Tell us about your stay..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Submitting...' : 'Post Review'}
            </Button>
        </form>
    );
};

export default ReviewForm;

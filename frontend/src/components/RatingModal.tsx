"use client";

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FreelanceEscrowABI, contractAddress } from '../constants';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerAddress: string;
  onRatingComplete: () => void;
}

export default function RatingModal({ 
  isOpen, 
  onClose, 
  freelancerAddress, 
  onRatingComplete 
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmitRating = async () => {
    if (!freelancerAddress) return;
    
    try {
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: FreelanceEscrowABI,
        functionName: 'rateUser',
        args: [freelancerAddress as `0x${string}`, rating, comment],
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      onRatingComplete();
      onClose();
    }
  }, [isSuccess, onRatingComplete, onClose]);

  const renderStarRating = () => {
    return (
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-3xl transition-colors ${
              star <= (hoveredRating || rating)
                ? 'text-yellow-400'
                : 'text-muted'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-primary mb-4">Rate Freelancer</h3>
        
        <div className="mb-4">
          <p className="text-muted mb-3">
            How was your experience working with this freelancer?
          </p>
          
          <div className="text-center">
            <p className="text-primary mb-2">Rating: {rating}/5</p>
            {renderStarRating()}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-primary font-medium mb-2">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-background-secondary text-primary px-3 py-2 rounded-lg border border-secondary focus:border-primary focus:outline-none"
            rows={3}
            placeholder="Share your experience working with this freelancer..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-outline flex-1"
            disabled={isPending || isConfirming}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitRating}
            className="btn-primary flex-1"
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
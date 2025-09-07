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
                : 'text-[#f0d0e0]'
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
      <div className="bg-[#4d0026] rounded-lg p-6 max-w-md w-full mx-4 border border-[#660033]">
        <h3 className="text-xl font-bold text-[#f8f0f5] mb-4">Rate Freelancer</h3>
        
        <div className="mb-4">
          <p className="text-[#f0d0e0] mb-3">
            How was your experience working with this freelancer?
          </p>
          
          <div className="text-center">
            <p className="text-[#f8f0f5] mb-2">Rating: {rating}/5</p>
            {renderStarRating()}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[#f8f0f5] font-medium mb-2">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-[#660033] text-[#f8f0f5] px-3 py-2 rounded-lg border border-[#800040] focus:border-[#ff1493] focus:outline-none"
            rows={3}
            placeholder="Share your experience working with this freelancer..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#660033] text-[#f8f0f5] py-2 px-4 rounded-lg hover:bg-[#800040]"
            disabled={isPending || isConfirming}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitRating}
            className="flex-1 bg-[#ff1493] text-white py-2 px-4 rounded-lg hover:bg-[#cc1076] disabled:opacity-50"
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Auto-redirect to game
        navigate('/game');
    }, [navigate]);
    
    return (
        <div className="w-full h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="text-white text-xl">Loading...</div>
        </div>
    );
}
import React, { useState, useEffect, useRef } from 'react';

interface TokenInfo {
    token: string;
    timestamp: number;
}

interface SmoothTextProps {
    incomingText: string;
    windowSize: number;  // Number of tokens to consider for the moving average
    delayMultiplier?: number;  // Multiplier for the delay between tokens
}

const SmoothText: React.FC<SmoothTextProps> = ({ incomingText, windowSize, delayMultiplier=1.1 }) => {
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [displayedText, setDisplayedText] = useState<string>('');
    const [receivedText, setReceivedText] = useState<string>('');  // Dummy state to trigger useEffect
    const timerHandles = useRef<NodeJS.Timeout[]>([]);
    const lastTokenTime = useRef<number>(performance.now());
    const lastDisplayTime = useRef<number>(performance.now());
    const lastScheduledTime = useRef<number>(0);

    useEffect(() => {
        // Update the tokens array with new tokens and their arrival times
        const newTokens = incomingText.slice(receivedText.length).split(' ');
        if (newTokens.length === 0) return;
        setReceivedText(incomingText);

        const currentTime = performance.now();
        const additionalTokens = newTokens.map((token, index) => ({
            token,
            timestamp: lastTokenTime.current + (currentTime - lastTokenTime.current) * index / newTokens.length 
        }));
        const updatedTokens = [...tokens, ...additionalTokens];
        setTokens(updatedTokens);

        // Calculate the average time interval between the last 'windowSize' tokens
        const relevantTokens = updatedTokens.slice(-windowSize);
        const intervals = relevantTokens.slice(1).map((t, i) => t.timestamp - relevantTokens[i].timestamp);
        const averageInterval = intervals.length > 0 ? intervals.reduce((acc, val) => acc + val, 0) / intervals.length : 1000; // default 1 second

        // Clear previous timers
        // timerHandles.current.forEach(handle => clearTimeout(handle));
        // timerHandles.current = [];

        const timeSinceLastDisplay = currentTime - lastScheduledTime.current;

        // Schedule each new token for display
        additionalTokens.forEach((tokenInfo, index) => {
            const delay = Math.max(0, (index + 1) * averageInterval - timeSinceLastDisplay / delayMultiplier) * delayMultiplier;
            // console.log('Delay:', delay, 'ms');
            lastScheduledTime.current = Math.max(currentTime + delay, lastScheduledTime.current);
            const handle = setTimeout(() => {
                setDisplayedText(prev => `${prev} ${tokenInfo.token}`);
                lastDisplayTime.current = performance.now();
            }, delay);
            timerHandles.current.push(handle);
        });
        lastTokenTime.current = currentTime;
    }, [incomingText, windowSize]);  // Dependencies on incomingText and windowSize

    return (
        <>
            {displayedText}
        </>
    );
};

export default SmoothText;

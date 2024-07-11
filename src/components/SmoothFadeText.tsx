import React, { useState, useEffect, useRef } from 'react';
import './animations.css';

interface TokenInfo {
    token: string;
    timestamp: number;
}

interface SmoothTextProps {
    content: string;
    windowSize: number;  // Number of tokens to consider for the moving average
    delayMultiplier?: number;  // Multiplier for the delay between tokens
    sep?: string;  // Token separator
    animation?: string;  // Animation name
    animationDuration?: string;  // Animation duration
    animationTimingFunction?: string;  // Animation timing function
}

const SmoothAnimateText: React.FC<SmoothTextProps> = ({ content, windowSize=0, delayMultiplier=1.05, sep="token", animation="fadeIn", animationDuration="1s", animationTimingFunction="ease-in-out" }) => {
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [completedTokens, setCompletedTokens] = useState<string[]>([]);
    const [animatingTokens, setAnimatingTokens] = useState<{ token: string, timestamp: number}[]>([]);
    const receivedText = useRef<string>('');
    const timerHandles = useRef<NodeJS.Timeout[]>([]);
    const lastTokenTime = useRef<number>(performance.now());
    const lastDisplayTime = useRef<number>(performance.now());
    const lastScheduledTime = useRef<number>(0);

    useEffect(() => {
        if (content) {
            const textToSplit = content.slice(receivedText.current.length);

            // Split the text and include spaces in the tokens list
            let newTokens: string[] = [];
            if (sep === 'token') {
                newTokens = textToSplit.split(/(\s+)/).filter(token => token.length > 0);
            } else if (sep === 'char') {
                newTokens = textToSplit.split('');
            } else {
                throw new Error('Invalid separator');
            }
            const currentTime = performance.now();
            const additionalTokens = newTokens.map((token, index) => ({
                token,
                timestamp: lastTokenTime.current + (currentTime - lastTokenTime.current) * index / newTokens.length
            }));

            const updatedTokens = [...tokens, ...additionalTokens];
            setTokens(updatedTokens);

            lastTokenTime.current = currentTime;
            receivedText.current = content;
            // Calculate the average time interval between the last 'windowSize' tokens
            if (windowSize === 0) {
                setAnimatingTokens(prev => [...prev, ...additionalTokens]);
                lastDisplayTime.current = performance.now();
                return;
            }
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
                    setAnimatingTokens(prev => [...prev, tokenInfo]);
                    lastDisplayTime.current = performance.now();
                }, delay);
                timerHandles.current.push(handle);
            });
        }
    }, [content]);

    useEffect(() => {
        return () => {
            setCompletedTokens([]);
            setAnimatingTokens([]);
            setTokens([]);
            receivedText.current = '';
            timerHandles.current.forEach(handle => clearTimeout(handle));
            lastTokenTime.current = performance.now();
            lastDisplayTime.current = performance.now();
            lastScheduledTime.current = 0;
        };
    }, []);

    return (
        <>
        <span
        >{completedTokens.join('')}</span>
            {
        animatingTokens.map(({ token, timestamp }) => {
            if (token === '\n') return <br key={timestamp} />;

            return <span
                key={timestamp}
                style={{
                    animationName: animation,
                    animationDuration: animationDuration,
                    animationTimingFunction: animationTimingFunction,
                    animationIterationCount: 1,
                    whiteSpace: 'pre',
                    display: 'inline-block',
                }}
            >
                {token}
            </span>
            })
            }
        </>
    );
};

export default SmoothAnimateText;

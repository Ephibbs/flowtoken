import React, { useState, useEffect, useRef } from 'react';
import './animations.css';

interface TokenInfo {
    token: string;
    timestamp: number;
}

enum Separator {
    Word = 'word',
    Char = 'char',
}

interface SmoothTextProps {
    content: string;
    windowSize?: number;  // Number of tokens to consider for the moving average
    delayMultiplier?: number;  // Multiplier for the delay between tokens
    sep?: string;  // Separator for splitting the text into either words or characters
    animation?: string;  // Animation name
    animationDuration?: string;  // Animation duration in css format ex. '1s'
    animationTimingFunction?: string;  // Animation timing function
}

const SmoothAnimateText: React.FC<SmoothTextProps> = ({ content, windowSize = 0, delayMultiplier = 1.05, sep ="word", animation="fadeIn", animationDuration="1s", animationTimingFunction="ease-in-out" }) => {
    const tokens = useRef<TokenInfo[]>([]);
    // const [completedTokens, setCompletedTokens] = useState<string[]>([]);
    const [animatingTokens, setAnimatingTokens] = useState<{ token: string, timestamp: number}[]>([]);
    const receivedTextLength = useRef<number>(0);
    const timerHandle = useRef<NodeJS.Timeout | null>(null);
    const lastTokenTime = useRef<number>(performance.now());
    const lastDisplayTime = useRef<number>(performance.now());
    const tokenIndex = useRef<number>(0);
    const averageInterval = useRef<number>(0);

    const addToken = () => {
        const tokenInfo = tokens.current[tokenIndex.current];
        if (!tokenInfo) {
            timerHandle.current = null;
            return;
        }
        tokenIndex.current += 1;
        setAnimatingTokens(prev => [...prev, tokenInfo]);
        lastDisplayTime.current = performance.now();

        const delay = averageInterval.current * delayMultiplier;
        // console.log('Delay:', delay, 'ms');
        timerHandle.current = setTimeout(addToken, delay);

    }

    useEffect(() => {
        if (content) {
            const textToSplit = content.slice(receivedTextLength.current);

            // Split the text and include spaces in the tokens list
            let newTokens: string[] = [];
            if (sep === 'word') {
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

            tokens.current = [...tokens.current, ...additionalTokens];

            lastTokenTime.current = currentTime;
            receivedTextLength.current = content.length;
            if (windowSize > 1) {
                const relevantTokens = tokens.current.slice(-windowSize);
                const intervals = relevantTokens.slice(1).map((t, i) => t.timestamp - relevantTokens[i].timestamp);
                averageInterval.current = intervals.length > 0 ? intervals.reduce((acc, val) => acc + val, 0) / intervals.length : 0; // default 1 second
                // console.log('Average interval:', averageInterval.current);
            } else {
                averageInterval.current = 0;  // default 1 second
            }
            // Schedule each new token for display
            if (!timerHandle.current) {
                addToken();
            }
        }
    }, [content]);

    return (
        <>
            {
        animatingTokens.map(({ token, timestamp }, index) => {
            if (token === '\n') return <br key={`${index}`} />; // key={`${timestamp}-${index}`}

            return <span
                key={`${index}`}
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

import React, { useState, useEffect } from 'react';
import SmoothText from '../components/SmoothText'; // Adjust the import path accordingly

interface RandomTextSenderProps {
    initialText: string;
    windowSize: number;  // Propagate this to SmoothText for consistency
}

const RandomTextSender: React.FC<RandomTextSenderProps> = ({ initialText, windowSize }) => {
    const [currentText, setCurrentText] = useState('');
    const [remainingTokens, setRemainingTokens] = useState<string[]>([]);
    const [baseLatency, setBaseLatency] = useState<number>(200);
    const [tokenCount, setTokenCount] = useState<number>(0);

    // Initialize the tokens
    useEffect(() => {
        setRemainingTokens(initialText.split(' ')); // Assuming space-separated tokens
    }, [initialText]);

    // Update base latency every 10 tokens
    useEffect(() => {
        if (tokenCount > 0 && tokenCount % 10 === 0) {
            const newBaseLatency = 50 + (Math.random() > 0.5 ? 400 : 0); // Randomly choose between 200ms and 800ms
            setBaseLatency(newBaseLatency);
            console.log(`Base latency updated to: ${newBaseLatency}ms`);
        }
    }, [tokenCount]);

    // Function to send a token at random intervals
    useEffect(() => {
        if (remainingTokens.length > 0) {
            // Jitter is up to 100ms more based on windowSize (unused)
            const jitter = Math.random() * 100;
            const networkDelay = baseLatency + jitter;

            const timeout = setTimeout(() => {
                const nextToken = remainingTokens[0];
                setCurrentText(prev => prev ? `${prev} ${nextToken}` : nextToken);
                setRemainingTokens(prev => prev.slice(1));
                setTokenCount(prev => prev + 1); // Increment token count
            }, networkDelay);

            return () => clearTimeout(timeout);
        }
    }, [remainingTokens, baseLatency, windowSize]);

    return (
        <div>
            <SmoothText incomingText={currentText} windowSize={windowSize} />
            <div style={{ marginTop: '1rem' }}>
                {currentText}
            </div>
        </div>
    );
};

// This is the default export that defines the component title and other configuration
export default {
    title: 'Components/SmoothText',
    component: RandomTextSender,
};

// Here we define a "story" for the default view of SmoothText
export const Default = () => <RandomTextSender initialText="Hello world from Storybook" windowSize={5} />;

// You can add more stories to showcase different props or states
export const LongText = () => <RandomTextSender initialText="This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset. This is a longer piece of text to test the smoothing functionality over a larger dataset." windowSize={30} />;

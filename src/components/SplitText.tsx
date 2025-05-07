import React, { useRef, useEffect, ReactElement, isValidElement } from 'react';

// IMPORTANT: Simple implementation that focuses ONLY on table elements
const TokenizedText = ({ input, sep, animation, animationDuration, animationTimingFunction, animationIterationCount }: any) => {
    // Early return for no animation case
    if (animation === 'none' || !animation) {
        return <>{input}</>;
    }
    
    // DEBUG: Log what we're receiving to help understand the issue
    console.log('TokenizedText input:', input);
    
    // Direct check for string tag name (most reliable way to check)
    const isTableElement = (el: any): boolean => {
        try {
            if (!isValidElement(el)) return false;
            
            // For standard HTML elements
            if (typeof el.type === 'string') {
                console.log('Element type:', el.type);
                return el.type === 'th' || el.type === 'td' || el.type === 'br';
            }

            // DEBUG: Log complex element types
            if (typeof el.type === 'function' || typeof el.type === 'object') {
                console.log('Complex element type:', 
                  typeof el.type === 'function' ? el.type.name || 'unnamed function' : 
                  (el.type as any)?.displayName || 'unknown object'
                );
            }
            
            return false;
        } catch (e) {
            console.error('Error checking element type:', e);
            return false;
        }
    };
    
    // IMMEDIATE PASS-THROUGH: If it's a table element, don't process it at all
    if (isValidElement(input) && isTableElement(input)) {
        console.log('DIRECT PASS-THROUGH of table element');
        return input;
    }
    
    // Special case for arrays with table elements
    if (Array.isArray(input)) {
        const processedArray = input.map((item, index) => {
            if (isValidElement(item) && isTableElement(item)) {
                console.log('Preserving table element in array');
                return item; // Return table elements as-is
            }
            if (typeof item === 'string') {
                // Only animate text content
                return processTextContent(item, index.toString(), sep, animation, animationDuration, animationTimingFunction, animationIterationCount);
            }
            // For other elements, just add a key
            return isValidElement(item) ? React.cloneElement(item, { key: index }) : item;
        });
        
        return <>{processedArray}</>;
    }
    
    // Process normal text content
    if (typeof input === 'string') {
        return processTextContent(input, '0', sep, animation, animationDuration, animationTimingFunction, animationIterationCount);
    }
    
    // For any other type of input, just pass it through
    return <>{input}</>;
};

// Separate function to process text content
const processTextContent = (
    text: string, 
    keyPrefix: string, 
    sep: string, 
    animation: string, 
    animationDuration: string, 
    animationTimingFunction: string, 
    animationIterationCount: string
) => {
    // Skip processing if no animation
    if (animation === 'none' || !animation) {
        return <>{text}</>;
    }

    // Animation styles for tokens
    const baseStyle = {
        animationName: animation,
        animationDuration,
        animationTimingFunction,
        animationIterationCount,
        display: 'inline-block',
    };

    // Break text into tokens
    let tokens: string[] = [];
    
    if (sep === 'word') {
        tokens = text.split(/(\s+)/).filter(Boolean);
    } else if (sep === 'char') {
        tokens = Array.from(text);
    } else if (sep === 'diff') {
        tokens = [text]; // For diff mode, treat as single token
    } else {
        throw new Error('Invalid separator: must be "word", "char", or "diff"');
    }
    
    // Make sure line breaks are handled separately
    const processedTokens: React.ReactNode[] = [];
    let currentIndex = 0;
    
    tokens.forEach((token, i) => {
        // Handle line breaks specially
        if (token === '\n') {
            processedTokens.push(<br key={`${keyPrefix}-${currentIndex}`} />);
            currentIndex++;
            return;
        }
        
        // Handle whitespace
        const isWhitespace = /^\s+$/.test(token);
        
        // Pair spaces with the following word to avoid leading spaces in wrapped lines
        if (isWhitespace && i < tokens.length - 1 && !/^\s+$/.test(tokens[i+1]) && tokens[i+1] !== '\n') {
            const space = token;
            const word = tokens[i+1];
            
            processedTokens.push(
                <span key={`${keyPrefix}-${currentIndex}`} style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                    <span style={{ ...baseStyle, whiteSpace: 'pre' }}>{space}</span>
                    <span style={{ ...baseStyle, whiteSpace: 'normal' }}>{word}</span>
                </span>
            );
            
            currentIndex++;
            tokens[i+1] = ''; // Mark the next token as processed
        } 
        // Handle regular tokens (that haven't been paired)
        else if (token && token !== '') {
            processedTokens.push(
                <span 
                    key={`${keyPrefix}-${currentIndex}`} 
                    style={{
                        ...baseStyle,
                        whiteSpace: isWhitespace ? 'pre' : 'normal'
                    }}
                >
                    {token}
                </span>
            );
            currentIndex++;
        }
    });
    
    // Container style for proper text flow
    const containerStyle: React.CSSProperties = {
        display: 'inline',
        wordWrap: 'break-word',
        wordBreak: 'normal'
    };
    
    return (
        <span style={containerStyle}>
            {processedTokens}
        </span>
    );
};

export default React.memo(TokenizedText);
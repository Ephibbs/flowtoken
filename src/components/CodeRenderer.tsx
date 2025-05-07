import React from 'react';

interface CustomRendererProps {
    rows: any[];
    stylesheet: any;
    useInlineStyles: boolean;
}

// Not a react component, but returns a function that returns a react component 
// to be used as a custom code renderer in the SyntaxHighlighter component
const customCodeRenderer = ({ animation, animationDuration, animationTimingFunction }: any) => {
    // Memoize the animation style to avoid recreating it for each text segment
    const animationStyle = {
        animationName: animation || '',
        animationDuration,
        animationTimingFunction,
        animationIterationCount: 1,
        whiteSpace: 'pre-wrap',
        display: 'inline-block',
    };

    return ({rows, stylesheet, useInlineStyles}: CustomRendererProps) => rows.map((node, i) => (
        <div key={i} style={node.properties?.style || {}}>
            {node.children.map((token: any, key: string) => {
                // Extract and apply styles from the stylesheet if available and inline styles are used
                const tokenStyles = useInlineStyles && stylesheet ? { ...stylesheet[token?.properties?.className[1]], ...token.properties?.style } : token.properties?.style || {};
                return (
                    <span key={key} style={tokenStyles}>
                        {token.children && token.children[0].value.split(' ').map((word: string, index: number) => (
                            <span key={index} style={{
                                animationName: animation || '',
                                animationDuration,
                                animationTimingFunction,
                                animationIterationCount: 1,
                                whiteSpace: 'pre-wrap',
                                display: 'inline-block',
                            }}>
                                {word + (index < token.children[0].value.split(' ').length - 1 ? ' ' : '')}
                            </span>
                        ))}
                    </span>
                );
            })}
        </div>
    ));
};

export default customCodeRenderer; // Cannot use React.memo here as this is a function that returns a function

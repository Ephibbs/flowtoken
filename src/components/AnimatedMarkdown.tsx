'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark as style } from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';
import './animations.css';
import './custom-lists.css';

const AnimatedImage = ({ src, alt, animation, animationDuration, animationTimingFunction, animationIterationCount }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    const imageStyle = isLoaded ? {
        animationName: animation,
        animationDuration: animationDuration,
        animationTimingFunction: animationTimingFunction,
        animationIterationCount: animationIterationCount,
        whiteSpace: 'pre-wrap',
    } : {};

    return (
        <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            style={imageStyle}
        />
    );
};

const MarkdownAnimateText: React.FC<SmoothTextProps> = ({
    children,
    sep = "word",
    animation = "fadeIn",
    animationDuration = "1s",
    animationTimingFunction = "ease-in-out"
}) => {
    const animationStyle = {
        '--marker-animation': `${animation} ${animationDuration} ${animationTimingFunction}`,
    };
    // Memoize animateText function to prevent recalculations if props do not change
    const animateText = React.useCallback((text, type) => {
        // console.log('Animating type:', type);
        // console.log('Text:', text);
        const processText = (input) => {
            if (Array.isArray(input)) {
                // Process each element in the array
                return input.map(element => processText(element));
            } else if (typeof input === 'string') {
                // Process strings based on the specified separator
                let tokens = [];
                if (sep === 'word') {
                    tokens = input.split(/(\s+)/).filter(token => token.length > 0);
                } else if (sep === 'char') {
                    tokens = input.split('');
                } else {
                    throw new Error('Invalid separator');
                }
                return tokens.map((token, index) => (
                    <span key={index} style={{
                        animationName: animation,
                        animationDuration,
                        animationTimingFunction,
                        animationIterationCount: 1,
                        whiteSpace: 'pre-wrap',
                        display: 'inline-block',
                    }}>
                        {token}
                    </span>
                ));
            } else if (React.isValidElement(input)) {
                // If the element is a React component or element, clone it and process its children
                return input;
            } else {
                // Return non-string, non-element inputs unchanged (null, undefined, etc.)
                return '';
            }
        };

        return processText(text);
    }, [animation, animationDuration, animationTimingFunction, sep]);

    const customRenderer = ({ rows, stylesheet, useInlineStyles }) => {
        return rows.map((node, i) => (
            <div key={i} style={node.properties?.style || {}}>
                {node.children.map((token, key) => {
                    // Extract and apply styles from the stylesheet if available and inline styles are used
                    const tokenStyles = useInlineStyles && stylesheet ? { ...stylesheet[token?.properties?.className[1]], ...token.properties?.style } : token.properties?.style || {};
                    return (
                        <span key={key} style={tokenStyles}>
                            {token.children && token.children[0].value.split(' ').map((word, index) => (
                                <span key={index} style={{
                                    animationName: animation,
                                    animationDuration,
                                    animationTimingFunction,
                                    animationIterationCount: 1,
                                    whiteSpace: 'pre-wrap',
                                    display: 'inline-block', // Ensuring that animation is visible
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

    // Memoize components object to avoid redefining components unnecessarily
    const components = React.useMemo(() => ({
        text: ({ node, ...props }) => animateText(props.children, 'text'),
        h1: ({ node, ...props }) => <h1>{animateText(props.children, 'h1')}</h1>,
        h2: ({ node, ...props }) => <h2>{animateText(props.children, 'h2')}</h2>,
        h3: ({ node, ...props }) => <h3>{animateText(props.children, 'h3')}</h3>,
        h4: ({ node, ...props }) => <h4>{animateText(props.children, 'h4')}</h4>,
        h5: ({ node, ...props }) => <h5>{animateText(props.children, 'h5')}</h5>,
        h6: ({ node, ...props }) => <h6>{animateText(props.children, 'h6')}</h6>,
        p: ({ node, ...props }) => <p>{animateText(props.children, 'p')}</p>,
        li: ({ node, ...props }) => <li className="custom-li" style={animationStyle}>{animateText(props.children, 'li')}</li>,
        a: ({ node, ...props }) => <a href={props.href} target="_blank" rel="noopener noreferrer">{animateText(props.children, 'a')}</a>,
        strong: ({ node, ...props }) => <strong>{animateText(props.children, 'strong')}</strong>,
        i: ({ node, ...props }) => <i>{animateText(props.children, 'italic')}</i>,
        u: ({ node, ...props }) => <u>{animateText(props.children, 'u')}</u>,
        em: ({ node, ...props }) => <em>{animateText(props.children, 'em')}</em>,
        code: ({ node, inline, className, children, ...props }) => {
            console.log('className:', className?.substring(9).trim() || '');
            return <div style={animationStyle} className="code-block" >
                <SyntaxHighlighter style={style} language={className?.substring(9).trim() || ''} renderer={customRenderer}>
                    {children}
                </SyntaxHighlighter>
            </div>
        },
        hr: ({ node, ...props }) => <hr style={{
            animationName: animation,
            animationDuration,
            animationTimingFunction,
            animationIterationCount: 1,
            whiteSpace: 'pre-wrap',
        }} />,
        img: ({ node, ...props }) => <AnimatedImage src={props.src} alt={props.alt} animation={animation} animationDuration={animationDuration} animationTimingFunction={animationTimingFunction} animationIterationCount={1} />,
        table: ({ node, ...props }) => <table className="code-block">{props.children}</table>,
        tr: ({ node, ...props }) => <tr>{animateText(props.children, 'row')}</tr>,
        td: ({ node, ...props }) => <td>{animateText(props.children, 'cell')}</td>,
        // More tags can be added here
    }), [animateText]);

    return <div className="smooth-height-transition">
        <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
            {children}
        </ReactMarkdown>
    </div>;
};

export default MarkdownAnimateText;
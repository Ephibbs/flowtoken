'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/docco'
import './animations.css';
import './custom-lists.css';

interface SmoothTextProps {
    content: string;
    sep?: string;
    animation?: string | null;
    animationDuration?: string;
    animationTimingFunction?: string;
    codeStyle?: any;
}

interface AnimatedImageProps {
    src: string;
    alt: string;
    animation: string;
    animationDuration: string;
    animationTimingFunction: string;
    animationIterationCount: number;
}

interface CustomRendererProps {
    rows: any[];
    stylesheet: any;
    useInlineStyles: boolean;
}

const AnimatedImage: React.FC<AnimatedImageProps>  = ({ src, alt, animation, animationDuration, animationTimingFunction, animationIterationCount }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    const imageStyle = isLoaded ? {
        animationName: animation,
        animationDuration: animationDuration,
        animationTimingFunction: animationTimingFunction,
        animationIterationCount: animationIterationCount,
        whiteSpace: 'pre-wrap',
    } : {
        display: 'none',
    };

    return (
        <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            style={imageStyle}
        />
    );
};

const TokenizedText = ({ input, sep, animation, animationDuration, animationTimingFunction, animationIterationCount }: any) => {
    const tokens = React.useMemo(() => {
        if (typeof input !== 'string') return null;

        let splitRegex;
        if (sep === 'word') {
            splitRegex = /(\s+)/;
        } else if (sep === 'char') {
            splitRegex = /(.)/;
        } else {
            throw new Error('Invalid separator');
        }

        return input.split(splitRegex).filter(token => token.length > 0);
    }, [input, sep]);

    return (
        <>
            {tokens?.map((token, index) => (
                <span key={index} style={{
                    animationName: animation,
                    animationDuration,
                    animationTimingFunction,
                    animationIterationCount,
                    whiteSpace: 'pre-wrap',
                    display: 'inline-block',
                }}>
                    {token}
                </span>
            ))}
        </>
    );
};

const MarkdownAnimateText: React.FC<SmoothTextProps> = ({
    content,
    sep = "word",
    animation = "fadeIn",
    animationDuration = "1s",
    animationTimingFunction = "ease-in-out",
    codeStyle=null,
}) => {
    codeStyle = codeStyle || style.docco;
    const animationStyle: any
     = {
        '--marker-animation': `${animation} ${animationDuration} ${animationTimingFunction}`,
    };
    // Memoize animateText function to prevent recalculations if props do not change
    const animateText: (text: string | Array<any>) => React.ReactNode = React.useCallback((text: string | Array<any>) => {
        let count = 0;
        const processText: (input: any) => React.ReactNode = (input: any) => {
            if (Array.isArray(input)) {
                // Process each element in the array
                return input.map(element => processText(element));
            } else if (typeof input === 'string') {
                return <TokenizedText input={input} sep={sep} animation={animation} animationDuration={animationDuration} animationTimingFunction={animationTimingFunction} animationIterationCount={1} />;
            } else if (React.isValidElement(input)) {
                // If the element is a React component or element, clone it and process its children
                return input;
            } else {
                // Return non-string, non-element inputs unchanged (null, undefined, etc.)
                return input;
            }
        };
        if (!animation) {
            return text;
        }
        return processText(text);
    }, [animation, animationDuration, animationTimingFunction, sep]);

    const customRenderer: React.FC<CustomRendererProps> = ({ rows, stylesheet, useInlineStyles }) => {
        return rows.map((node, i) => (
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

    // Memoize components object to avoid redefining components unnecessarily
    const components: any
     = React.useMemo(() => ({
        text: ({ node, ...props }: any) => animateText(props.children),
         h1: ({ node, ...props }: any) => <h1 {...props}>{animateText(props.children)}</h1>,
         h2: ({ node, ...props }: any) => <h2 {...props}>{animateText(props.children)}</h2>,
         h3: ({ node, ...props }: any) => <h3 {...props}>{animateText(props.children)}</h3>,
         h4: ({ node, ...props }: any) => <h4 {...props}>{animateText(props.children)}</h4>,
         h5: ({ node, ...props }: any) => <h5 {...props}>{animateText(props.children)}</h5>,
         h6: ({ node, ...props }: any) => <h6 {...props}>{animateText(props.children)}</h6>,
         p: ({ node, ...props }: any) => <p {...props}>{animateText(props.children)}</p>,
         li: ({ node, ...props }: any) => <li {...props} className="custom-li" style={animationStyle}>{animateText(props.children)}</li>,
         a: ({ node, ...props }: any) => <a {...props} href={props.href} target="_blank" rel="noopener noreferrer">{animateText(props.children)}</a>,
         strong: ({ node, ...props }: any) => <strong {...props}>{animateText(props.children)}</strong>,
         em: ({ node, ...props }: any) => <em {...props}>{animateText(props.children)}</em>,
        code: ({ node, className, children, ...props }: any) => {
            if (!className || !className.startsWith("language-")) {
                return <code {...props}>
                    {animateText(children)}
                </code>;
            }
            return <div {...props} style={animationStyle} className={`code-block`}>
                <SyntaxHighlighter style={codeStyle} language={className?.substring(9).trim() || ''} renderer={customRenderer}>
                    {children}
                </SyntaxHighlighter>
            </div>
        },

         hr: ({ node, ...props }: any) => <hr {...props} style={{
            animationName: animation,
            animationDuration,
            animationTimingFunction,
            animationIterationCount: 1,
            whiteSpace: 'pre-wrap',
        }} />,
        img: ({ node, ...props }: any) => <AnimatedImage src={props.src} alt={props.alt} animation={animation || ''} animationDuration={animationDuration} animationTimingFunction={animationTimingFunction} animationIterationCount={1} />,
        table: ({ node, ...props }: any) => <table {...props} className="code-block">{props.children}</table>,
        tr: ({ node, ...props }: any) => <tr {...props}>{animateText(props.children)}</tr>,
        td: ({ node, ...props }: any) => <td {...props}>{animateText(props.children)}</td>,
    }), [animateText]);

    return <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
        {content}
        </ReactMarkdown>;
};

export default MarkdownAnimateText;
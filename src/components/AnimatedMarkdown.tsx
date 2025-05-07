'use client';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/docco'
import TokenizedText from './SplitText';
import AnimatedImage from './AnimatedImage';
import { animations } from '../utils/animations';
import DefaultCode from './DefaultCode';

interface MarkdownAnimateTextProps {
    content: string;
    sep?: string;
    animation?: string | null;
    animationDuration?: string;
    animationTimingFunction?: string;
    codeStyle?: any;
    customComponents?: Record<string, any>;
    imgHeight?: string;
}

const DEFAULT_CUSTOM_COMPONENTS: Record<string, any> = {};

// Function to create animation style object - extracted outside of component
const createAnimationStyle = (animation: string | null, animationDuration: string, animationTimingFunction: string) => ({
    animation: animation ? `${animation} ${animationDuration} ${animationTimingFunction}` : 'none',
});

// Memoized component for text elements to avoid creating many instances
const MemoizedText = React.memo(({ children, animation, animationDuration, animationTimingFunction, sep }: any) => (
    <TokenizedText
        input={children}
        sep={sep}
        animation={animation}
        animationDuration={animationDuration}
        animationTimingFunction={animationTimingFunction}
        animationIterationCount={1}
    />
));

// Optimize rendering for lists to reduce memory usage
const MemoizedList = React.memo(({ children, style }: { children: React.ReactNode, style: React.CSSProperties }) => (
    <li className="custom-li" style={style}>{children}</li>
));

const MarkdownAnimateText: React.FC<MarkdownAnimateTextProps> = ({
    content,
    sep = "diff",
    animation: animationName = "fadeIn",
    animationDuration = "1s",
    animationTimingFunction = "ease-in-out",
    codeStyle=null,
    customComponents = DEFAULT_CUSTOM_COMPONENTS,
    imgHeight = '20rem'
}) => {
    const animation = animations[animationName as keyof typeof animations] || animationName;
    
    codeStyle = codeStyle || style.docco;
    
    // Memoize the animation style to avoid recreating it on every render
    const animationStyle = useMemo(() => 
        createAnimationStyle(animation, animationDuration, animationTimingFunction), 
        [animation, animationDuration, animationTimingFunction]
    );
    
    // Enhanced hidePartialCustomComponents function that also handles tag attributes
    const hidePartialCustomComponents = React.useCallback((input: string): React.ReactNode => {
        if (!input || Object.keys(customComponents).length === 0) return input;
        
        // Check for any opening tag without a closing '>'
        const lastOpeningBracketIndex = input.lastIndexOf('<');
        if (lastOpeningBracketIndex !== -1) {
            const textAfterLastOpeningBracket = input.substring(lastOpeningBracketIndex);
            
            // If there's no closing bracket, then it's potentially a partial tag
            if (!textAfterLastOpeningBracket.includes('>')) {
                // Check if it starts with any of our custom component names
                for (const tag of Object.keys(customComponents)) {
                    // Check if the text starts with the tag name (allowing for partial tag name)
                    // For example, '<Cus' would match a component named 'CustomTag'
                    if (textAfterLastOpeningBracket.substring(1).startsWith(tag.substring(0, textAfterLastOpeningBracket.length - 1)) ||
                        // Or it's a complete tag name followed by attributes
                        textAfterLastOpeningBracket.match(new RegExp(`^<${tag}(\\s|$)`))) {
                        
                        // Remove the partial tag
                        return input.substring(0, lastOpeningBracketIndex);
                    }
                }
            }
        }
        
        return input;
    }, [customComponents]);

    // Memoize animateText function to prevent recreations
    const animateText = React.useCallback((text: string | Array<any>) => {
        text = Array.isArray(text) ? text : [text];
        
        if (!animation) return text;
        
        return text.map((item, index) => {
            if (typeof item === 'string') {
                // Strings are handled by MemoizedText (SplitText), which now has the logic
                // to avoid animating specific HTML strings like "<br>", "<ul>", etc.
                return (
                    <MemoizedText
                        key={`text-${index}`}
                        children={hidePartialCustomComponents(item)}
                        animation={animation}
                        animationDuration={animationDuration}
                        animationTimingFunction={animationTimingFunction}
                        sep={sep}
                    />
                );
            } else if (React.isValidElement(item)) {
                // Check if the React element is one of the types we don't want to animate
                const noAnimateElementTypes: Array<React.ElementType> = ['br', 'ul', 'ol', 'td', 'th'];
                let typeName = item.type
                if (typeof typeName === 'function') {
                    typeName = typeName.name
                }
                if (typeof typeName === 'string' && noAnimateElementTypes.includes(typeName as React.ElementType)) {
                    // Render these elements directly without an animation wrapper
                    return item;
                }
                // For other React elements, wrap them in animation span if they are not container elements
                // whose children are already animated by the `components` prop of ReactMarkdown
                // This else block might still wrap elements if they are not explicitly handled
                // by the ReactMarkdown components mapping (e.g. custom components not passing animateText to children)
                // For standard HTML elements, the `components` mapping should handle animation of children.
                return (
                    <span key={`other-element-${index}`} style={{
                        animationName: animation,
                        animationDuration,
                        animationTimingFunction,
                        animationIterationCount: 1,
                        whiteSpace: 'pre-wrap',
                        display: 'inline-block',
                    }}>
                        {item}
                    </span>
                );
            }
            // Fallback for other types (e.g. numbers, if they ever appear)
            // This was the original 'else' block logic
            return (
                <span key={`other-${index}`} style={{
                    animationName: animation,
                    animationDuration,
                    animationTimingFunction,
                    animationIterationCount: 1,
                    whiteSpace: 'pre-wrap',
                    display: 'inline-block',
                }}>
                    {item}
                </span>
            );
        });
    }, [animation, animationDuration, animationTimingFunction, sep, hidePartialCustomComponents]);

    // Memoize components object to avoid recreating on every render
    // Using proper React types instead of trying to import Components type
    const components = useMemo(() => ({
        // Handle text node with specific memoization for performance
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
            return <DefaultCode 
                node={node} 
                className={className} 
                style={animationStyle} 
                codeStyle={codeStyle} 
                animateText={animateText} 
                animation={animation as string}
                animationDuration={animationDuration}
                animationTimingFunction={animationTimingFunction}
                {...props}
            >
                {children}
            </DefaultCode>;
        },
         hr: ({ node, ...props }: any) => <hr {...props} style={{
            animationName: animation,
            animationDuration,
            animationTimingFunction,
            animationIterationCount: 1,
            whiteSpace: 'pre-wrap',
        }} />,
        img: ({ node, ...props }: any) => <AnimatedImage src={props.src} height={imgHeight} alt={props.alt} animation={animation || ''} animationDuration={animationDuration} animationTimingFunction={animationTimingFunction} animationIterationCount={1} />,
        table: ({ node, ...props }: any) => <table {...props} style={animationStyle}>{props.children}</table>,
        tr: ({ node, ...props }: any) => <tr {...props}>{animateText(props.children)}</tr>,
        td: ({ node, ...props }: any) => <td {...props}>{animateText(props.children)}</td>,
        // Add custom components
        ...Object.entries(customComponents).reduce((acc, [key, value]) => {
            acc[key] = (elements: any) => value({...elements, animateText});
            return acc;
        }, {} as Record<string, (elements: any) => React.ReactNode>),
    }), [animateText, customComponents, animation, animationDuration, animationTimingFunction, animationStyle, codeStyle, imgHeight]);

    // Optimize for large content by chunking if needed
    const optimizedContent = useMemo(() => {
        // For extremely large content (>50KB), we could implement chunking or virtualization here
        return content;
    }, [content]);

    return (
        <ReactMarkdown 
            components={components as any} 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw]}
        >
            {optimizedContent}
        </ReactMarkdown>
    );
};

// Wrap the entire component in React.memo to prevent unnecessary rerenders
export default React.memo(MarkdownAnimateText);
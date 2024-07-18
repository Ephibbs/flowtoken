import React, { useState, useEffect } from 'react';
import SmoothText from '../components/SmoothText'; // Adjust the import path accordingly
import AnimatedMarkdown from '../components/AnimatedMarkdown';
import Markdown from 'react-markdown'

interface RandomTextSenderProps {
    initialText: string;
    windowSize: number;  // Propagate this to SmoothText for consistency
    animation?: string;  // Animation name
    sep?: string;  // Token separator
}

interface Controls {
    animation: string;
    sep: string;
    windowSize: number;
    delayMultiplier: number;
    animationDuration: number;
    animationTimingFunction: string;
    simulateNetworkIssue: boolean;
    generationSpeed: number;
}

const Controls = ({ controls, setControls }: { controls: Controls, setControls: React.Dispatch<React.SetStateAction<Controls>> }) => {
    const { animation, sep, windowSize, delayMultiplier, animationDuration, animationTimingFunction
     } = controls;

    const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setControls({ ...controls, animation: e.target.value });
    };

    const handleSepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setControls({ ...controls, sep: e.target.value });
    };

    const handleWindowSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setControls({ ...controls, windowSize: parseInt(e.target.value) });
    };

    const handleDelayMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setControls({ ...controls, delayMultiplier: parseFloat(e.target.value) });
    };

    const handleAnimationDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setControls({ ...controls, animationDuration: parseFloat(e.target.value) });
    };

    const handleAnimationTimingFunctionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setControls({ ...controls, animationTimingFunction: e.target.value });
    };

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>
                Animation:
                <select value={animation} onChange={handleAnimationChange}>
                    <option value="none">None</option>
                    <option value="fadeIn">Fade In</option>
                    <option value="blurIn">Blur In</option>
                    <option value="slideInFromLeft">Slide In From Left</option>
                    <option value="fadeAndScale">Fade and Scale</option>
                    <option value="colorTransition">Color Transition</option>
                    <option value="rotateIn">Rotate In</option>
                    <option value="bounceIn">Bounce In</option>
                    <option value="elastic">Elastic</option>
                    <option value="highlight">Highlight</option>
                    <option value="blurAndSharpen">Blur and Sharpen</option>
                    <option value="wave">Wave</option>
                    <option value="dropIn">Drop In</option>
                    <option value="slideUp">Slide Up</option>
                </select>
            </label>
            <label style={{ marginRight: '1rem' }}>
                Separator:
                <select value={sep} onChange={handleSepChange}>
                    <option value="word">Word</option>
                    <option value="char">Character</option>
                </select>
            </label>
            <label style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
                Window Size:
                <input type="number" value={windowSize} onChange={handleWindowSizeChange} />
            </label>
            <label style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
                Delay Multiplier:
                <input type="number" value={delayMultiplier} onChange={handleDelayMultiplierChange} />
            </label>
            <label style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
                Animation Duration:
                <input type="text" value={animationDuration} onChange={handleAnimationDurationChange} />
            </label>
            <label style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
                Animation Timing Function:
                <select value={animationTimingFunction} onChange={handleAnimationTimingFunctionChange}>
                    <option value="ease-in-out">Ease In Out</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="linear">Linear</option>
                </select>
            </label>
        </div>
    );
}

const RandomTextSender: React.FC<RandomTextSenderProps> = ({ initialText }) => {
    const [currentText, setCurrentText] = useState('');
    const [remainingTokens, setRemainingTokens] = useState<string[]>([]);
    const [baseLatency, setBaseLatency] = useState<number>(10);
    const [tokenCount, setTokenCount] = useState<number>(0);
    const [controls, setControls] = useState({
        animation: "fadeIn",
        sep: "word",
        windowSize: 5,
        delayMultiplier: 1.4,
        animationDuration: 0.6,
        animationTimingFunction: "ease-in-out",
        generationSpeed: 3,
        simulateNetworkIssue: false
    });
    const [slowSection, setSlowSection] = useState<boolean>(false);
    const [numId, setNumId] = useState<number>(0);
    console.log('Controls:', controls);
    useEffect(() => {
        let extra = 0;
        if (tokenCount > 0 && tokenCount % 5 === 0 && controls.simulateNetworkIssue) {
            extra = (Math.random() > 0.5 ? 400 : 0); // Randomly choose between 200ms and 800m
        }
        const newBaseLatency = 1000 / controls.generationSpeed + extra
        setBaseLatency(newBaseLatency);
        setSlowSection(extra > 0);
    }, [tokenCount, controls]);

    useEffect(() => {
        //reset the text when the animation changes
        setNumId((prev) => prev + 1);
    }, [controls]);

    // Function to send a token at random intervals
    useEffect(() => {
        if (remainingTokens.length > 0) {
            // Jitter is up to 100ms more based on windowSize (unused)
            const jitter = Math.random() * 5;
            const networkDelay = baseLatency + jitter;

            const timeout = setTimeout(() => {
                const nextToken = remainingTokens[0];
                setCurrentText(prev => prev ? `${prev} ${nextToken}` : nextToken);
                setRemainingTokens(prev => prev.slice(1));
                setTokenCount(prev => prev + 1); // Increment token count
            }, networkDelay);

            return () => clearTimeout(timeout);
        } else {
            // reset the text when the animation changes
            setTimeout(() => {
                setNumId((prev) => prev + 1);
            }, 1000);
        }
    }, [remainingTokens, baseLatency]);

    // Initialize the tokens
    useEffect(() => {
        setRemainingTokens(initialText.split(' ')); // Assuming space-separated tokens
        setCurrentText('');
        setTokenCount(0);
    }, [initialText, numId]);

    const animationDurationString = `${controls.animationDuration}s`;
    return (
        <div className="flex flex-col md:flex-row justify-start items-start w-full gap-16">
            <div className="w-full max-w-80">
                <h1 className="text-3xl font-bold">FlowToken</h1>
                <div className="mb-4">
                    <span className="text-xs mb-4 text-gray-500 mr-2">In development</span>
                    <a href="https://github.com/Backless-AI/flowtoken" className="text-xs text-blue-500">Github</a>
                </div>
                <p className="text-sm mb-4">FlowToken is a text visualization library to animate and smooth streaming LLM token generation.</p>
                <Controls controls={controls} setControls={setControls} />
                <div className="h-10 text-red-500">
                    {slowSection && <p>Simulated Network Issue</p>}
                </div>
            </div>
            <div className="text-sm w-1/2" style={{ height: '3000px'}}>
                {currentText.length > 0 &&
                    <AnimatedMarkdown incomingText={currentText} animation={controls.animation === 'none' ? null : controls.animation} sep={controls.sep} animationDuration={animationDurationString} animationTimingFunction={controls.animationTimingFunction} />   
                }
            </div>
        </div>
    );
};

// This is the default export that defines the component title and other configuration
export default {
    title: 'Components/SmoothFadeInMarkdown',
    component: RandomTextSender,
};

const text = `
# Main Heading(H1)

## Subheading(H2)

### Another Subheading(H3)

Regular text is just written as plain text. You can add **bold** text, *italic* text, and even ***bold italic*** text.

You can also create hyperlinks: [OpenAI](https://www.openai.com)

---

### Lists

#### Unordered List

- Item 1 and some *more*
- Item 2
    - Subitem 2.1
    - Subitem 2.2
- Item 3

#### Ordered List

1. First Item
2. Second Item
3. Third Item

---

### Code

\`Inline code\` with backticks.

\`\`\`python
# Python code block
def hello_world():
    print("Hello, world!")
\`\`\`

### Blockquotes

> This is a blockquote.
>
> This is part of the same quote.

### Tables

A table:

| a | b |
| - | - |
| 1 | 2 |
| 3 | 4 |

---

### Images

![Alt Text](https://via.placeholder.com/150 "Image Title")

### Horizontal Rule

---

### Task List

- [x] Task 1 completed
- [ ] Task 2 not completed
- [ ] Task 3 not completed
`

// Here we define a "story" for the default view of SmoothText
export const Default = () => <RandomTextSender initialText={text} windowSize={30} />;
export const DefaultChar = () => <RandomTextSender initialText={text} windowSize={30} sep="char" />;
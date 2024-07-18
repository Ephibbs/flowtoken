import React, { useState, useEffect } from 'react';
import SmoothText from '../components/SmoothText'; // Adjust the import path accordingly
import StreamText from '../components/SmoothFadeText';
import Markdown from 'react-markdown'

interface RandomTextSenderProps {
    initialText: string;
    windowSize: number;  // Propagate this to SmoothText for consistency
    animation?: string;  // Animation name
    sep?: any;  // Token separator
}

interface Controls {
    animation: string;
    sep: any;
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
                    <option value="default">Default</option>
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
        sep: "char",
        windowSize: 5,
        delayMultiplier: 1.4,
        animationDuration: 0.6,
        animationTimingFunction: "ease-in-out",
        generationSpeed: 10,
        simulateNetworkIssue: false
    });
    const [slowSection, setSlowSection] = useState<boolean>(false);
    const [numId, setNumId] = useState<number>(0);

    useEffect(() => {
        let extra = 0;
        if (tokenCount > 0 && tokenCount % 5 === 0 && controls.simulateNetworkIssue) {
            extra = (Math.random() > 0.5 ? 400 : 0); // Randomly choose between 200ms and 800m
        }
        const newBaseLatency = 1000 / controls.generationSpeed + extra
        console.log(`Base latency updated to: ${newBaseLatency}ms`);
        setBaseLatency(newBaseLatency);
        setSlowSection(extra > 0);
    }, [tokenCount, controls]);

    useEffect(() => {
        //reset the text when the animation changes
        setNumId((prev) => prev + 1);
        console.log('Animation changed', numId);
    }, [controls]);

    // Function to send a token at random intervals
    useEffect(() => {
        if (remainingTokens.length > 0) {
            // Jitter is up to 100ms more based on windowSize (unused)
            const jitter = Math.random() * 50;
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
            setNumId((prev) => prev + 1);
            console.log('Animation changed', numId);
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
            <div className="text-sm w-1/2">
                {currentText.length > 0 &&
                    <StreamText content={currentText} animation={controls.animation} sep={controls.sep} windowSize={controls.windowSize} delayMultiplier={controls.delayMultiplier} animationDuration={animationDurationString} animationTimingFunction={controls.animationTimingFunction} />
                }
            </div>
        </div>
    );
};

// This is the default export that defines the component title and other configuration
export default {
    title: 'Components/SmoothFadeIn',
    component: RandomTextSender,
};

const text = `To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them. To die—to sleep,
No more; and by a sleep to say we end
The heart-ache and the thousand natural shocks
That flesh is heir to: 'tis a consummation
Devoutly to be wish'd. To die, to sleep;
To sleep, perchance to dream—ay, there's the rub:
For in that sleep of death what dreams may come,
When we have shuffled off this mortal coil,
Must give us pause—there's the respect
That makes calamity of so long life.
For who would bear the whips and scorns of time,
Th'oppressor's wrong, the proud man's contumely,
The pangs of dispriz'd love, the law's delay,
The insolence of office, and the spurns
That patient merit of th'unworthy takes,
When he himself might his quietus make
With a bare bodkin? Who would fardels bear,
To grunt and sweat under a weary life,
But that the dread of something after death,
The undiscovere'd country, from whose bourn
No traveller returns, puzzles the will,
And makes us rather bear those ills we have
Than fly to others that we know not of?
Thus conscience doth make cowards of us all,
And thus the native hue of resolution
Is sicklied o'er with the pale cast of thought,
And enterprises of great pith and moment
With this regard their currents turn awry
And lose the name of action.
`

// Here we define a "story" for the default view of SmoothText
export const Default = () => <RandomTextSender initialText={text} windowSize={30} />;
export const DefaultChar = () => <RandomTextSender initialText={text} windowSize={30} sep="char" />;

// You can add more stories to showcase different props or states
export const fadeIn = () => <RandomTextSender initialText={text} windowSize={30} animation={"fadeIn"} />;
export const AllAtOnceFadeIn = () => <StreamText content={text} animation={"fadeIn"} />;

export const blurIn = () => <RandomTextSender initialText={text} windowSize={30} animation={"blurIn"} />;
export const blurInChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"blurIn"} sep="char" />;

// export const typewriter = () => <RandomTextSender initialText={text} windowSize={30} animation={"typewriter"} sep="char" />;

export const slideInFromLeft = () => <RandomTextSender initialText={text} windowSize={30} animation={"slideInFromLeft"} />;
export const slideInFromLeftChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"slideInFromLeft"} sep="char" />;

export const fadeAndScale = () => <RandomTextSender initialText={text} windowSize={30} animation={"fadeAndScale"} />;
export const fadeAndScaleChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"fadeAndScale"} sep="char" />;

export const colorTransition = () => <RandomTextSender initialText={text} windowSize={30} animation={"colorTransition"} />;

export const rotateIn = () => <RandomTextSender initialText={text} windowSize={30} animation={"rotateIn"} />;
export const rotateInChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"rotateIn"} sep="char" />;

export const bounceIn = () => <RandomTextSender initialText={text} windowSize={30} animation={"bounceIn"} />;
export const bounceInChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"bounceIn"} sep="char" />;

export const elastic = () => <RandomTextSender initialText={text} windowSize={30} animation={"elastic"} />;
export const elasticChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"elastic"} sep="char" />;

export const highlight = () => <RandomTextSender initialText={text} windowSize={30} animation={"highlight"} />;
export const highlightChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"highlight"} sep="char" />;

export const blurAndSharpen = () => <RandomTextSender initialText={text} windowSize={30} animation={"blurAndSharpen"} />;

export const wave = () => <RandomTextSender initialText={text} windowSize={30} animation={"wave"} />;
export const waveChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"wave"} sep="char" />;

export const dropIn = () => <RandomTextSender initialText={text} windowSize={30} animation={"dropIn"} />;
export const dropInChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"dropIn"} sep="char" />;

export const slideUp = () => <RandomTextSender initialText={text} windowSize={30} animation={"slideUp"} />;
export const slideUpChar = () => <RandomTextSender initialText={text} windowSize={30} animation={"slideUp"} sep="char" />;
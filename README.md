
# FlowToken - Smooth Animation Library for LLM Text Streaming

![flow token demo](https://nextjs-omega-five-46.vercel.app/demo.gif)

FlowToken is a React component library designed to enhance the visual presentation of text streaming from large language models (LLMs). This library offers a variety of animations that make the text appear smoothly and dynamically, providing an engaging user experience.

## Demo

Try the demo here: [Demo link](https://nextjs-omega-five-46.vercel.app/)

## Features

FlowToken includes several key features:

- **Customizable Animations:** A range of animations such as fade, blur-in, drop-in, slide from the left, typewriter effect, word pull-up, flip text, gradual spacing, and more.
- **Smooth Text Streaming:** Options to control the speed and manner of text appearance to handle the variability in text generation speed.
- **Responsive and Lightweight:** Optimized for performance and compatibility across all modern browsers.

## Installation

Install FlowToken using npm:

```bash
npm install flowtoken
```

Or using yarn:

```bash
yarn add flowtoken
```

## Usage

Here is a simple example of how to use the `StreamText` component from FlowToken:

```jsx
import React from 'react';
import { StreamText } from 'flowtoken';

const App = () => {
  return (
    <StreamText
      incomingText="Hello, world!"
      windowSize={5}
      delayMultiplier={1.1}
      sep="word"
      animation="fadeIn"
      animationDuration="0.5s"
      animationTimingFunction="ease-in-out"
    />
  );
};

export default App;
```

### Real World with Vercel AI SDK

```jsx
'use client'

import { useChat } from 'ai/react'
import { StreamText } from 'flowtoken';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: <StreamText content={m.content} windowSize={5}
            delayMultiplier={1.1}
            sep="word"
            animation="fadeIn"
            animationDuration="0.5s"
            animationTimingFunction="ease-in-out"
            />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <label>
          Say something...
          <input
            value={input}
            onChange={handleInputChange}
          />
        </label>
      </form>
    </div>
  )
}
```

### Markdown Support

To use markdown, import the `AnimatedMarkdown` component.

```jsx
import React from 'react';
import { AnimatedMarkdown } from 'flowtoken';

const App = () => {
  return (
    <AnimatedMarkdown
      incomingText="## Hello, world!"
      sep="word"
      animation="fadeIn"
      animationDuration="0.5s"
      animationTimingFunction="ease-in-out"
    />
  );
};

export default App;
```

### StreamText Props

- **incomingText**: The text to be displayed.
- **windowSize**: Number of tokens to consider for smoothing animations.
- **delayMultiplier**: Multiplier to adjust the delay for each token or character's appearance.
- **sep**: `word` or `char` (`word` recommended).
- **animation**: Name of the CSS animation to apply.
- **animationDuration**: Duration of the animation.
- **animationTimingFunction**: Timing function of the animation.

## Animations

FlowToken supports various CSS animations:
- **fadeIn**
- **blurIn**
- **typewriter**
- **slideInFromLeft**
- **fadeAndScale**
- **rotateIn**
- **bounceIn**
- **elastic**
- **highlight**
- **blurAndSharpen**
- **dropIn**
- **slideUp**
- **wave**

For custom animations, define your keyframes in CSS and pass the animation name to the `animation` prop.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to suggest features or report bugs.

## License

FlowToken is MIT licensed. Please see the LICENSE file for more details.
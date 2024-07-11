
# FlowToken - Smooth Animation Library for LLM Text Streaming

FlowToken is a React component library designed to enhance the visual presentation of text streaming from large language models (LLMs). This library offers a variety of animations that make the text appear smoothly and dynamically, providing an engaging user experience.

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

Here is a simple example of how to use the `SmoothAnimateText` component from FlowToken:

```jsx
import React from 'react';
import { SmoothAnimateText } from 'flowtoken';

const App = () => {
  return (
    <SmoothAnimateText
      incomingText="Hello, world!"
      windowSize={5}
      delayMultiplier={1.1}
      sep=" "
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

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: <SmoothAnimateText content={m.content} windowSize={5}
            delayMultiplier={1.1}
            sep=" "
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

### Props

- **incomingText**: The text to be displayed.
- **windowSize**: Number of tokens to consider for smoothing animations.
- **delayMultiplier**: Multiplier to adjust the delay for each token or character's appearance.
- **sep**: Separator used to split the incoming text into tokens or characters.
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
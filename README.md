# Content-Checker (by OpenModerator)

![Release Content Checker](https://github.com/utilityfueled/content-checker/actions/workflows/release-package.yml/badge.svg)
[![npm](https://img.shields.io/npm/v/content-checker.svg)](https://www.npmjs.com/package/content-checker)

`content-checker` is designed to be a modern, open-source library for programmatic and AI content moderation. Currently content-checker supports image and text moderation.
Thanks to LLMs in addition to detecting specific profane words, we can detect malicious **intent** in text.
So, a user who tries to circumvent the AI profanity filter by using a variation of a profane word, or even just a malicious phrase
without a specific word in the profanity list, will still be flagged. Image moderation is also supported, using the Inception V3 model of the NSFW JS library.

Future features will include moderation tools (auto-ban, bots), more powerful models, and multimedia support for video and audio moderation.

## How It Works

`content-checker` builds on the popular [bad-words](https://www.npmjs.com/package/bad-words) package,
but updated to use TypeScript and ES6, and merging in [badwords-list](https://www.npmjs.com/package/badwords-list), which it used as a dependency.

The AI moderation is powered by a database of profane words, multiple LLMs for text analysis, and the NSFW JS library for image analysis.
The models will likely be changed in the future as more powerful models become available.
The importance of AI moderation for text is we need to be able to detect malicious intent, not just specific words.

The API will return whether text is profane or not, but note that different types of profanity can be detected, and the
exact types returned will depend on the model used. Currently, the hosted model uses around a 60% confidence threshold for a profanity detection when using Google's Perspective API or Google's Natural Language API.

Unsafe text:

```json
{
  "profane": true,
  "type": ["TOXICITY", "SEVERE_TOXICITY"]
}
```

Safe text:

```json
{
  "profane": false,
  "type": []
}
```

The API returns responses in the following format for image moderation (the possible image types for now include "Porn" and "Hentai"). If the highest probability category is a NSFW category like the ones mentioned then the image will be flagged as NSFW:

Unsafe image:

```json
{
  "nsfw": true,
  "type": ["Porn"]
}
```

Safe image:

```json
{
  "nsfw": false,
  "type": []
}
```

Note that type is an array, so it can contain multiple types of profanity or none at all (if it hits the fine-tuned model).
The API is rate limited to 10 requests from the same IP address per 10 seconds. If you need more, please contact me.

## Installation

Use npm to install `content-checker`.

```bash
npm install content-checker
```

## Table of Contents

1. [Standard Text Moderation](#Standard-Text-Moderation)
2. [AI Text Moderation](#AI-Text-Moderation)
3. [AI Image Moderation](#AI-Image-Moderation)

## Usage

## Standard Text Moderation

### Initialize a filter

```js
import { Filter } from "content-checker";
// Or for CommonJS: const { Filter } = require('content-checker');
const filter = new Filter();

console.log(filter.clean("Don't be an ash0le")); //Don't be an ******
```

### Placeholder Overrides

```js
import { Filter } from "content-checker";
const customFilter = new Filter({ placeHolder: "x" });

customFilter.clean("Don't be an ash0le");
```

### Regex Overrides

```js
const filter = new Filter({ regex: /\*|\.|$/gi });

const filter = new Filter({ replaceRegex: /[A-Za-z0-9가-힣_]/g });
```

### Add words to the blacklist

```js
const filter = new Filter();

filter.addWords("some", "bad", "word");

filter.clean("some bad word!");

// or use an array using the spread operator

const newBadWords = ["some", "bad", "word"];

filter.addWords(...newBadWords);

filter.clean("some bad word!"); //**** *** ****!

// or

const filter = new Filter({ list: ["some", "bad", "word"] });

filter.clean("some bad word!"); // **** *** ****!
```

### Instantiate with an empty list

```js
const filter = new Filter({ emptyList: true });

filter.clean("hell this wont clean anything"); // hell this wont clean anything
```

### Remove words from the blacklist

```js
const filter = new Filter();

filter.removeWords("hells", "sadist");

filter.clean("some hells word!"); // some hells word!

// or use an array using the spread operator

let removeWords = ["hells", "sadist"];

filter.removeWords(...removeWords);

filter.clean("some sadist hells word!");
```

## AI Text Moderation

To use AI text moderation, ensure you have the OPEN_MODERATOR_API_KEY set in your environment variables (one can be generated for free at www.openmoderator.com) or passed as a parameter during the initialization of the Filter class.

### Initialize a filter

```js
import { Filter } from "content-checker";

const filter = new Filter({ openModeratorAPIKey: "your_api_key_here" });
```

### Check a string for profanity

The isProfaneAI method checks if a string contains profane language using AI. It returns a promise that resolves to an object containing a profane boolean and a type array which lists the categories of profanity detected (e.g., "harassment").

```js
const config = {
  // checkManualProfanityList is optional and defaults to false; it checks for the words in lang.ts (if under 50 words) before hitting the AI model. Note that this affects performance.
  checkManualProfanityList: false,
  // provider defaults to "google-perspective-api" (Google's Perspective API); it can also be "openai" (OpenAI Moderation API) or "google-natural-language-api" (Google's Natural Language API)
  provider: "google-perspective-api",
};

filter.isProfaneAI("your string here", config).then((response) => {
  if (response.profane) {
    console.log("Profanity found. Types: ", response.type.join(", "));
  } else {
    console.log("No profanity found");
  }
});
```

## AI Image Moderation

To use AI image moderation, ensure you have the OPEN_MODERATOR_API_KEY set in your environment variables (one can be generated for free at www.openmoderator.com) or passed as a parameter during the initialization of the Filter class.
For now the NSFW JS library is used for image moderation, but this will be replaced with a more powerful model in the future.
Ensure you're uploading either a PNG or JPEG image.

### Check an image for NSFW content

Raw JS example:

```js
const imageInput = document.getElementById("imageInput");

imageInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      const response = await filter.isImageNSFW(file);
      if (response.nsfw) {
        console.log("NSFW content detected. Types:", response.type.join(", "));
      } else {
        console.log("Image is safe.");
      }
    } catch (error) {
      console.error("Error checking image:", error);
    }
  }
});
```

React example:

```jsx
import React, { useState } from "react";
import { Filter } from "content-checker";

const ImageModeration = () => {
  const [image, setImage] = useState(null);
  const [moderationResult, setModerationResult] = useState("");

  const filter = new Filter({ openModeratorAPIKey: "your_api_key_here" });

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const checkImage = async () => {
    if (image) {
      try {
        const response = await filter.isImageNSFW(image);
        if (response.nsfw) {
          setModerationResult(
            `NSFW content detected. Types: ${response.type.join(", ")}`,
          );
        } else {
          setModerationResult("Image is safe.");
        }
      } catch (error) {
        console.error("Error checking image:", error);
        setModerationResult("Error occurred while checking the image.");
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleImageChange}
        accept="image/png, image/jpeg"
      />
      <button onClick={checkImage}>Check Image</button>
      {moderationResult && <p>{moderationResult}</p>}
    </div>
  );
};

export default ImageModeration;
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Authors

- Jacob Habib (@jahabeebs), founder of OpenModerator

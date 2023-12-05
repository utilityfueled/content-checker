# Content-Checker (by OpenModerator)

Content-Checker is designed to be a modern, open-source library for programmatic and AI content moderation.
Thanks to OpenAI's models, in addition to detecting specific profane words, we can detect malicious **intent** in text.
So, a user who tries to circumvent the AI profanity filter by using a variation of a profane word, or even just a malicious phrase
without a specific word in the profanity list, will still be flagged.

Future features will include multimedia support for moderating images, videos, and audio

## How It Works

Content-checker builds on the popular [bad-words](https://www.npmjs.com/package/bad-words) package,
but updated to use TypeScript and ES6, and merging in [badwords-list](https://www.npmjs.com/package/badwords-list), which it used as a dependency.

The AI moderation is powered by OpenAI's content moderation API and my own fine-tuned GTP-3.5 Turbo model. The reason is
we need to be able to detect malicious intent, not just specific words. Also, we cannot send profane text directly to OpenAI's API,
so we need to hit the moderation API first, and then use the fine-tuned model to for additional checks (if needed). The API returns responses in the following format:

```json
{
  "profane": true,
  "type": ["harassment"]
}
```

Note that type is an array, so it can contain multiple types of profanity (if it hits OpenAI's content moderation endpoint) or none at all (if it hits the fine-tuned model).
The API is rate limited to 10 requests from the same IP address per 10 seconds. If you need more, please contact me.

## Installation

Use npm to install content-checker.

```bash
npm install content-checker
```

## Table of Contents

1. [Standard Text Moderation](#Standard-Text-Moderation)
2. [AI Text Moderation](#AI-Text-Moderation)

## Usage

## Standard Text Moderation

### Initialize a filter

```js
import { Filter } from "content-checker";
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

To use AI moderation, ensure you have the CONTENT_CHECKER_API_KEY set in your environment variables or passed as a parameter during the initialization of the Filter class.

The content checker endpoint uses the latest OpenAI models to detect profanity in text.

### Initialize a filter

```js
import { Filter } from "content-checker";

const filter = new Filter({ contentCheckerAPIKey: "your_api_key_here" });
```

### Check a string for profanity

The isProfaneAI method checks if a string contains profane language using AI. It returns a promise that resolves to an object containing a profane boolean and a type array which lists the categories of profanity detected (e.g., "harassment").

```js
filter.isProfaneAI("your string here").then((response) => {
  if (response.profane) {
    console.log("Profanity found. Types: ", response.type.join(", "));
  } else {
    console.log("No profanity found");
  }
});
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Authors

- Jacob Habib (@jahabeebs), founder of OpenModerator

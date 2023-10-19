# Content Checker

Content checker is designed to be a modern, open-source library for programmatic and AI content moderation. Multimedia support is on the way.

Content-checker builds on the popular [bad-words](https://www.npmjs.com/package/bad-words) package,
but updated to use TypeScript and ES6, and merging in [badwords-list](https://www.npmjs.com/package/badwords-list), which it used as a dependency.

Content checker uses code from Vercel's [AI package](https://github.com/vercel/ai) for interacting with OpenAI's API.
This code is also licensed under the Apache 2.0 license.

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

WIP

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Authors

- Jacob Habib (@jahabeebs)

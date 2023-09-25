# Content Checker

Content checker is design to be a modern, open-source library for AI content moderation.

As of September 24th, 2023, content-checker builds on the popular [bad-words](https://www.npmjs.com/package/bad-words) package,
but updated to TypeScript, and merging in [badwords-list](https://www.npmjs.com/package/badwords-list), which it used as a dependency.

Future work will focus on adding AI text moderation before moving on to multimedia content.

## Installation

Use npm to install content-checker.

```bash
npm install content-checker
```

## Usage

```js
var Filter = require("bad-words"),
  filter = new Filter();

console.log(filter.clean("Don't be an ash0le")); //Don't be an ******
```

### Placeholder Overrides

```js
var Filter = require("bad-words");
var customFilter = new Filter({ placeHolder: "x" });

customFilter.clean("Don't be an ash0le"); //Don't be an xxxxxx
```

### Regex Overrides

```js
var filter = new Filter({ regex: /\*|\.|$/gi });

var filter = new Filter({ replaceRegex: /[A-Za-z0-9가-힣_]/g });
//multilingual support for word filtering
```

### Add words to the blacklist

```js
var filter = new Filter();

filter.addWords("some", "bad", "word");

filter.clean("some bad word!"); //**** *** ****!

//or use an array using the spread operator

var newBadWords = ["some", "bad", "word"];

filter.addWords(...newBadWords);

filter.clean("some bad word!"); //**** *** ****!

//or

var filter = new Filter({ list: ["some", "bad", "word"] });

filter.clean("some bad word!"); //**** *** ****!
```

### Instantiate with an empty list

```js
var filter = new Filter({ emptyList: true });
filter.clean("hell this wont clean anything"); //hell this wont clean anything
```

### Remove words from the blacklist

```js
let filter = new Filter();

filter.removeWords("hells", "sadist");

filter.clean("some hells word!"); //some hells word!

//or use an array using the spread operator

let removeWords = ["hells", "sadist"];

filter.removeWords(...removeWords);

filter.clean("some sadist hells word!");
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Authors

- Jacob Habib (@jahabeebs)

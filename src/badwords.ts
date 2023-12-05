import { words as localList } from "./lang";

export class Filter {
  list: string[];
  exclude: string[];
  splitRegex: RegExp;
  placeHolder: string;
  regex: RegExp;
  replaceRegex: RegExp;
  contentCheckerAPIKey: string | undefined;

  /**
   * Filter constructor. To use AI functions must set in .env or pass as param: CONTENT_CHECKER_API_KEY
   * @constructor
   * @param {object} options - Filter instance options
   * @param {boolean} options.emptyList - Instantiate filter with no blacklist
   * @param {array} options.list - Instantiate filter with a custom list
   * @param {string} options.placeHolder - Character used to replace profane words.
   * @param {string} options.regex - Regular expression used to sanitize words before comparing them to the blacklist.
   * @param {string} options.replaceRegex - Regular expression used to replace profane words with placeHolder.
   * @param {string} options.splitRegex - Regular expression used to split a string into words.
   * @param {string} options.contentCheckerAPIKey - API key for Content Checker API
   */
  constructor(
    options: {
      emptyList?: boolean;
      list?: string[];
      exclude?: string[];
      placeHolder?: string;
      regex?: RegExp;
      replaceRegex?: RegExp;
      splitRegex?: RegExp;
      contentCheckerAPIKey?: string;
    } = {},
  ) {
    this.list = options.emptyList
      ? []
      : [...localList, ...(options.list || [])];
    this.exclude = options.exclude || [];
    this.splitRegex = options.splitRegex || /\b/;
    this.placeHolder = options.placeHolder || "*";
    this.regex = options.regex || /[^a-zA-Z0-9|$|@]|\^/g;
    this.replaceRegex = options.replaceRegex || /\w/g;
    this.contentCheckerAPIKey =
      process.env.CONTENT_CHECKER_API_KEY || options.contentCheckerAPIKey;
  }

  /**
   * Determine if a string contains profane language.
   * @param {string} string - String to evaluate for profanity.
   */
  isProfane(string: string): boolean {
    return (
      this.list.filter((word) => {
        const wordExp = new RegExp(
          `\\b${word.replace(/(\W)/g, "\\$1")}\\b`,
          "gi",
        );
        return (
          !this.exclude.includes(word.toLowerCase()) && wordExp.test(string)
        );
      }).length > 0 || false
    );
  }

  /**
   * Replace a word with placeHolder characters;
   * @param {string} string - String to replace.
   */
  replaceWord(string: string): string {
    return string
      .replace(this.regex, "")
      .replace(this.replaceRegex, this.placeHolder);
  }

  /**
   * Evaluate a string for profanity and return an edited version.
   * @param {string} string - Sentence to filter.
   */
  clean(string: string): string {
    return string
      .split(this.splitRegex)
      .map((word) => {
        return this.isProfane(word) ? this.replaceWord(word) : word;
      })
      .join(this.splitRegex.exec(string)![0]);
  }

  /**
   * Add word(s) to blacklist filter / remove words from whitelist filter
   * @param {...string} words - Word(s) to add to the blacklist
   */
  addWords(...words: string[]): void {
    this.list.push(...words);

    words
      .map((word) => word.toLowerCase())
      .forEach((word) => {
        if (this.exclude.includes(word)) {
          this.exclude.splice(this.exclude.indexOf(word), 1);
        }
      });
  }

  /**
   * Add words to whitelist filter
   * @param {...string} words - Word(s) to add to the whitelist.
   */
  removeWords(...words: string[]): void {
    this.exclude.push(...words.map((word) => word.toLowerCase()));
  }


  /**
   * AI-enabled way to determine if a string contains profane language. Ensure that you've set an API key for content checker
   * @param {string} str - String to evaluate for profanity.
   */
  async isProfaneAI(str: string): Promise<{ profane: boolean, type: string[] }> {
    if (!this.contentCheckerAPIKey) {
      console.warn(
        "No API key found. AI functions will not work. Set in .env or pass as param: CONTENT_CHECKER_API_KEY",
      );
      throw new Error("Content Checker API key is not set.");
    }

    const data = {
      prompt: str,
    };

    const contentCheckerAPIUrl =
      "https://openmoderator.com/api/moderate";

    try {
      const response = await fetch(contentCheckerAPIUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this?.contentCheckerAPIKey || "",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error("Error calling Content Checker API", error);
      throw error;
    }
  }
}

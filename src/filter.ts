import { words as localList } from "./lang";
import { ProfanityCheckConfig } from "./types";

export class Filter {
  list: string[];
  exclude: string[];
  splitRegex: RegExp;
  placeHolder: string;
  regex: RegExp;
  replaceRegex: RegExp;
  openModeratorAPIKey: string | undefined;

  /**
   * Filter constructor. To use AI functions must set in .env or pass as param: OPEN_MODERATOR_API_KEY
   * @constructor
   * @param {object} options - Filter instance options
   * @param {boolean} options.emptyList - Instantiate filter with no blacklist
   * @param {array} options.list - Instantiate filter with a custom list
   * @param {string} options.placeHolder - Character used to replace profane words.
   * @param {string} options.regex - Regular expression used to sanitize words before comparing them to the blacklist.
   * @param {string} options.replaceRegex - Regular expression used to replace profane words with placeHolder.
   * @param {string} options.splitRegex - Regular expression used to split a string into words.
   * @param {string} options.contentCheckerAPIKey - API key for OpenModerator API
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
      openModeratorAPIKey?: string;
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
    this.openModeratorAPIKey =
      process.env.OPEN_MODERATOR_API_KEY || options.openModeratorAPIKey;
  }

  /**
   * Determine if a string contains profane language.
   * @param {string} string - String to evaluate for profanity.
   */
  isProfane(string: string): boolean {
    return this.list.some((word) => {
      const cleanWord = word.replace(/(\W)/g, "\\$1");
      const wordExp = new RegExp(`\\b${cleanWord}(?:${cleanWord})*\\b`, "gi");
      return !this.exclude.includes(word.toLowerCase()) && wordExp.test(string);
    });
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
    if (string === "") return "";
    const words = string.split(this.splitRegex);
    const delimiter = this.splitRegex.exec(string)?.[0] || "";
    return words
      .map((word) => {
        return this.isProfane(word) ? this.replaceWord(word) : word;
      })
      .join(delimiter);
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
   * AI-enabled way to determine if a string contains profane language. Ensure that you've set an API key for OpenModerator
   * @param {string} str - String to evaluate for profanity.
   * @param {ProfanityCheckConfig} config - Configuration object containing checkManualProfanityList and provider.
   * In config: provider can be "openai" (OpenAI's Moderation API) or "google-perspective-api" (Google's Perspective API) or "google-natural-language-api" (Google's Natural Language API)
   * In config: checkManualProfanityList is a boolean to determine if the manual profanity list in lang.ts should be checked first.
   * @returns {Promise<{ profane: boolean; type: string[] }>} - Object containing profane flag and types of detected content ("PROFANITY")
   */
  async isProfaneAI(
    str: string,
    config: ProfanityCheckConfig = {
      checkManualProfanityList: false,
      provider: "google-perspective-api",
    },
  ): Promise<{ profane: boolean; type: string[] }> {
    if (!this.openModeratorAPIKey) {
      console.warn(
        "No API key found. AI functions will not work. Set in .env or pass as param: OPEN_MODERATOR_API_KEY",
      );
      throw new Error("OpenModerator API key is not set.");
    }

    const data = {
      prompt: str,
      config,
    };

    const contentCheckerAPIUrl =
      "https://www.openmoderator.com/api/moderate/text";

    try {
      const response = await fetch(contentCheckerAPIUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.openModeratorAPIKey || "",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error("Error calling OpenModerator API", error);
      throw error;
    }
  }

  /**
   * AI-enabled way to determine if an image contains NSFW content.
   * Ensure that you've set an API key for OpenModerator.
   * @param {Blob} image - Image file (jpg, png) to evaluate for NSFW content.
   * @returns {Promise<{ nsfw: boolean; types: string[] }>} - Object containing NSFW flag and types of detected content ("Hentai" or "Porn")
   */
  async isImageNSFW(image: Blob): Promise<{ nsfw: boolean; types: string[] }> {
    if (!this.openModeratorAPIKey) {
      console.warn(
        "No API key found. AI functions will not work. Set in .env or pass as param: OPEN_MODERATOR_API_KEY",
      );
      throw new Error("OpenModerator API key is not set.");
    }

    const formData = new FormData();
    formData.append("file", image);

    const contentCheckerAPIUrl =
      "https://www.openmoderator.com/api/moderate/image";

    try {
      const response = await fetch(contentCheckerAPIUrl, {
        method: "POST",
        headers: {
          "x-api-key": this?.openModeratorAPIKey || "",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error calling OpenModerator API", error);
      throw error;
    }
  }
}

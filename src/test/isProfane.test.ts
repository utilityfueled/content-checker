import { assert } from "chai";
import { Filter } from "../filter";
let filter = new Filter();

describe("filter", function () {
  describe("isProfane", function () {
    it("Should detect a bad word and return a boolean value", function () {
      assert(filter.isProfane("ash0le"));
    });

    it("Should return false when no bad word is detected", function () {
      assert(filter.isProfane("wife") === false);
    });

    it("Should be able to detect a bad word in a sentence", function () {
      assert(filter.isProfane("that person is an ash0le"));
    });

    it("Filters out special characters appropriately", function () {
      assert(filter.isProfane("You're an asshole^ you are"));
    });

    it("Should detect filtered words from badwords-list", function () {
      assert(filter.isProfane("willies"));
    });

    it("Should detect filtered words regardless of type case", function () {
      var filter = new Filter({
        list: ["Test"],
      });
      assert(filter.isProfane("test"));
    });

    it("Should tokenize words according to regex word boundaries", function () {
      assert(filter.isProfane("that person is an\nasshole"));
    });

    it("Should detect bad word phrases", function () {
      filter.addWords("oh no");
      assert(filter.isProfane("oh no! this is profane!"));
    });
  });

  it("should detect repeated profane words like 'shitshit'", function () {
    assert(
      filter.isProfane("shitshit"),
      "Failed to detect repeated profane word",
    );
  });

  it("should detect profane words surrounded by punctuation", function () {
    assert(
      filter.isProfane("!shit!"),
      "Failed to detect profane word with surrounding punctuation",
    );
  });

  it("should detect multiple different profane words in a sentence", function () {
    assert(
      filter.isProfane("fuck shit asshole"),
      "Failed to detect multiple profane words",
    );
  });

  it("should be case insensitive", function () {
    assert(filter.isProfane("ShIt"), "Failed to be case insensitive");
  });

  it("should detect profane words at the start and end of strings", function () {
    assert(
      filter.isProfane("shit happens"),
      "Failed to detect profane word at start of string",
    );
    assert(
      filter.isProfane("happens shit"),
      "Failed to detect profane word at end of string",
    );
  });

  it("should not incorrectly flag words like 'assistant' when 'ass' is on the blacklist", function () {
    assert(!filter.isProfane("assistant"), "Incorrectly flagged a benign word");
  });

  it("should not detect words removed from the blacklist", function () {
    filter.removeWords("shit");
    assert(
      !filter.isProfane("shit"),
      "Failed to respect removal of words from blacklist",
    );
  });

  it("should handle words with internal capitalization and mixed cases", function () {
    assert(
      filter.isProfane("biTcH"),
      "Failed to detect word with internal capitalization",
    );
  });

  it("should not flag profane substrings within larger benign words", function () {
    assert(
      !filter.isProfane("classes"),
      "Incorrectly flagged part of a benign word",
    );
  });
});

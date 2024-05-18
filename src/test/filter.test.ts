import { assert } from "chai";
import { Filter } from "../filter";
let filter = new Filter();

describe("filter", function () {
  describe("clean", function () {
    it("Should replace a bad word within a sentence asterisks (******)", function () {
      console.log(filter.clean("Don't be an ash0le"));
      assert(filter.clean("Don't be an ash0le") === "Don't be an ******");
    });

    it("Should replace multiple instances of any bad words within a sentence asterisks (******)", function () {
      assert(filter.clean("cnts ash0le knob xxx") === "**** ****** **** ***");
    });

    it("Should not replace anything within a sentence if there are no bad words", function () {
      assert(filter.clean("The cat ran fast") === "The cat ran fast");
    });

    it("Should replace a string with proper placeholder when overridden", function () {
      var customFilter = new Filter({ placeHolder: "x" });
      assert(
        customFilter.clean("This is a hells good test") ===
          "This is a xxxxx good test",
      );
    });

    it("Should allow an instance of filter with an empty blacklist", function () {
      var customFilter = new Filter({
        emptyList: true,
      });
      assert(
        customFilter.clean("This is a hells good test") ===
          "This is a hells good test",
      );
    });

    it("Should tokenize words according to regex word boundaries", function () {
      assert(
        filter.clean("what a bitch...fuck you") === "what a *****...**** you",
      );
      assert(
        filter.clean("<p>Don't be an asshole</p>") ===
          "<p>Don't be an *******</p>",
      );
    });

    it("Should filter words that are derivatives of words from the filter blacklist", function () {
      assert(filter.clean("shitshit") === "********");
    });

    it("Shouldn't filter words that aren't profane.", function () {
      assert(filter.clean("hello there") === "hello there");
    });
  });
  it("Should handle mixed-case inputs correctly", function () {
    assert(
      filter.clean("Don't be an AsH0Le") === "Don't be an ******",
      "Failed to handle mixed-case inputs",
    );
  });

  it("Should maintain spaces and special characters when replacing words", function () {
    assert(
      filter.clean("Here, take this: fuck, shit, bitch!") ===
        "Here, take this: ****, ****, *****!",
      "Failed to maintain special characters",
    );
  });

  it("Should handle words joined by hyphens and not replace non-profane parts", function () {
    assert(
      filter.clean("This is a mother-fucking test") ===
        "This is a mother-******* test",
      "Failed to handle hyphenated words correctly",
    );
  });

  it("Should not replace numbers that form part of words", function () {
    assert(
      filter.clean("This is b4d") === "This is b4d",
      "Incorrectly replaced part of a word with a number",
    );
  });

  it("Should not alter HTML tags but still clean their content", function () {
    assert(
      filter.clean("<div>Fuck this</div>") === "<div>**** this</div>",
      "Failed to properly handle HTML content without altering tags",
    );
  });

  it("Should handle long strings and paragraphs effectively", function () {
    const longText =
      "Here is a paragraph with some asshole and shit words that need cleaning. It's important this works well.";
    const expected =
      "Here is a paragraph with some ******* and **** words that need cleaning. It's important this works well.";
    assert(
      filter.clean(longText) === expected,
      "Failed to handle long strings effectively",
    );
  });

  it("Should handle empty strings without error", function () {
    assert(filter.clean("") === "", "Failed to handle empty strings correctly");
  });

  it("Should correctly handle profane words embedded in larger benign words without replacement", function () {
    assert(
      filter.clean("The classic word is here") === "The classic word is here",
      "Incorrectly modified parts of larger benign words",
    );
  });

  // Currently we don't handle this scenario
  // xit("Should handle strings with no spaces", function () {
  //   assert(filter.clean("shitfuckbitch") === "*************", "Failed to replace a string with no spaces");
  // });

  // Currently we don't handle this scenario
  // xit("Should correctly replace words with punctuation interspersed", function () {
  //   assert(filter.clean("What a f.u.c.k! Really?") === "What a *****! Really?", "Failed to handle interspersed punctuation");
  // });
});

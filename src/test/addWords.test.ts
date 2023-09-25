import { expect } from "chai";
import { Filter } from "../badwords.js";

describe("filter", function () {
  describe("addWords", function () {
    let filter: Filter;

    beforeEach(() => {
      filter = new Filter();
    });

    it("Should append words to the filter list.", function () {
      filter.addWords("dog", "go");
      expect(filter.clean("Go dog go")).to.equal("** *** **");
    });

    it("Should append words to the filter using an array", () => {
      const addWords = ["go", "dog"];
      filter.addWords(...addWords);
      expect(filter.clean("Go dog go")).to.equal("** *** **");
    });

    it("Should allow a list to be passed to the constructor", function () {
      filter = new Filter({
        list: ["dog"],
      });
      expect(filter.clean("Go dog go")).to.equal("Go *** go");
    });
  });
});

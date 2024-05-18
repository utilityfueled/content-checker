import { assert } from "chai";
import { Filter } from "../filter";
let filter = new Filter();

describe("filter", () => {
  describe("removeWords", () => {
    it("Should allow you to remove words from the filter blacklist and no longer filter them (case-insensitive)", () => {
      filter.removeWords("Hells");
      assert(
        filter.clean("This is a hells good test") ===
          "This is a hells good test",
      );
    });

    it("Should allow you to remove an array of words from the filter blacklist and no longer filter them", () => {
      let removingWords = ["hells", "sadist"];

      filter = new Filter();
      filter.removeWords(...removingWords);
      assert(
        filter.clean("This is a hells sadist test") ===
          "This is a hells sadist test",
      );
    });
  });
});

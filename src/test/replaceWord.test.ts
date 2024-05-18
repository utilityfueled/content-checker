import { assert } from "chai";
import { Filter } from "../filter";
let filter = new Filter();

describe("filter", function () {
  describe("replaceWord", function () {
    it("Should replace a bad word with asterisks (******)", function () {
      assert(filter.replaceWord("ash0le") == "******");
    });
  });
});

import { Testing } from "cdktf";
import "cdktf/lib/testing/adapters/jest"; // Load types for expect matchers
import { TpStack } from "../lib/tp";

describe("My CDKTF Application", () => {
  describe("Checking validity", () => {
    it("check if the produced terraform configuration is valid", () => {
      const app = Testing.app();
      const stack = new TpStack(app, "test");
      expect(Testing.fullSynth(stack)).toBeValidTerraform();
    });

    it("check if this can be planned", () => {
      const app = Testing.app();
      const stack = new TpStack(app, "test");
      expect(Testing.fullSynth(stack)).toPlanSuccessfully();
    });
  });
});

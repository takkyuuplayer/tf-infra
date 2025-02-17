import { App } from "cdktf";
import { TpStack } from "./lib/tp";

{
  const app = new App();
  new TpStack(app, "tf-infra-state");
  app.synth();
}

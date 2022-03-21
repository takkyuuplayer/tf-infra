import { AwsProvider } from "@cdktf/provider-aws";
import { App, S3Backend, TerraformStack } from "cdktf";
import { Construct } from "constructs";

class StateStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
    const aws = new AwsProvider(this, "aws", {
      region: "ap-northeast-1",
    });
    new S3Backend(this, {
      bucket: "tp-tfstate",
      key: "tf-infra/cdktf.tfstate",
      region: aws.region,
    });
  }
}

const app = new App();
new StateStack(app, "tf-infra");
app.synth();

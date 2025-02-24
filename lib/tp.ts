import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { S3Backend, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { Cloudflare } from "./cloudflare";
import { GitHub } from "./github";

export class TpStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const aws = new AwsProvider(this, "aws", {
      region: "ap-northeast-1",
    });
    new S3Backend(this, {
      bucket: "tp-tfstate",
      key: "tf-infra/cdktf.tfstate",
      region: aws.region,
    });

    Cloudflare(this);
    GitHub(this);
  }
}

import { AwsProvider } from "@cdktf/provider-aws";
import { App, S3Backend, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import {
  CloudflareProvider,
  DataCloudflareZone,
  Record,
} from "./.gen/providers/cloudflare";

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

class CloudflareStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new CloudflareProvider(this, "cloudflare");
    const zone = new DataCloudflareZone(this, "takkyuuplayer.com", {
      name: "takkyuuplayer.com",
    });
    [
      {
        priority: 1,
        value: "ASPMX.L.GOOGLE.COM",
      },
      {
        priority: 5,
        value: "ALT1.ASPMX.L.GOOGLE.COM",
      },
      {
        priority: 5,
        value: "ALT2.ASPMX.L.GOOGLE.COM",
      },
      {
        priority: 10,
        value: "ALT3.ASPMX.L.GOOGLE.COM",
      },
      {
        priority: 10,
        value: "ALT4.ASPMX.L.GOOGLE.COM",
      },
    ].forEach((record) => {
      new Record(this, record.value, {
        name: "@",
        zoneId: zone.zoneId,
        type: "MX",
        priority: record.priority,
        value: record.value,
      });
    });
  }
}

const app = new App();
new StateStack(app, "tf-infra-state");
new CloudflareStack(app, "tf-infra-cloudflare");
app.synth();

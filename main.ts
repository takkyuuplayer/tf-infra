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
        value: "aspmx.l.google.com",
      },
      {
        priority: 5,
        value: "alt1.aspmx.l.google.com",
      },
      {
        priority: 5,
        value: "alt2.aspmx.l.google.com",
      },
      {
        priority: 10,
        value: "alt3.aspmx.l.google.com",
      },
      {
        priority: 10,
        value: "alt4.aspmx.l.google.com",
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

    new Record(this, "spf", {
      name: "@",
      zoneId: zone.zoneId,
      value:
        "v=spf1 include:_spf.google.com include:_amazonses.takkyuuplayer.com ~all",
      type: "TXT",
    });
    new Record(this, "dmarc", {
      name: "_dmarc",
      zoneId: zone.zoneId,
      value: "v=DMARC1; p=none; rua=mailto:takkyuuplayer@gmail.com",
      type: "TXT",
    });
  }
}

const app = new App();
new StateStack(app, "tf-infra-state");
new CloudflareStack(app, "tf-infra-cloudflare");
app.synth();

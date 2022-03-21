import { AwsProvider } from "@cdktf/provider-aws";
import { DataAwsCloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront";
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

    const aws = new AwsProvider(this, "aws", {
      region: "ap-northeast-1",
    });
    new S3Backend(this, {
      bucket: "tp-tfstate",
      key: "tf-infra/cdktf.tfstate",
      region: aws.region,
    });

    Cloudflare(this);
  }
}

function Cloudflare(scope: Construct) {
  new CloudflareProvider(scope, "cloudflare");

  const zone = new DataCloudflareZone(scope, "takkyuuplayer.com", {
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
    new Record(scope, record.value, {
      name: "@",
      zoneId: zone.zoneId,
      type: "MX",
      priority: record.priority,
      value: record.value,
    });
  });

  new Record(scope, "spf", {
    name: "@",
    zoneId: zone.zoneId,
    value:
      "v=spf1 include:_spf.google.com include:_amazonses.takkyuuplayer.com ~all",
    type: "TXT",
  });
  new Record(scope, "dmarc", {
    name: "_dmarc",
    zoneId: zone.zoneId,
    value: "v=DMARC1; p=none; rua=mailto:takkyuuplayer@gmail.com",
    type: "TXT",
  });

  [
    {
      fqdn: "takkyuuplayer.com",
      cloudfrontId: "E1G6FSVIWAIZ4",
      name: "@",
    },
    {
      fqdn: "www.takkyuuplayer.com",
      cloudfrontId: "E3HUV11AFSHUKJ",
      name: "www",
    },
  ].forEach((record) => {
    const cf = new DataAwsCloudfrontDistribution(
      scope,
      `Cloudfront/${record.fqdn}`,
      {
        id: record.cloudfrontId,
      }
    );
    new Record(scope, `CNAME/${record.fqdn}`, {
      name: record.name,
      zoneId: zone.zoneId,
      value: cf.domainName,
      type: "CNAME",
      proxied: true,
    });
  });
}

const app = new App();
new StateStack(app, "tf-infra-state");
app.synth();

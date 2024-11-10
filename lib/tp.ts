import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { DataCloudflareZone } from "@cdktf/provider-cloudflare/lib/data-cloudflare-zone";
import { CloudflareProvider } from "@cdktf/provider-cloudflare/lib/provider";
import { Record } from "@cdktf/provider-cloudflare/lib/record";
import { S3Backend, TerraformStack } from "cdktf";
import { Construct } from "constructs";

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
      content: "aspmx.l.google.com",
    },
    {
      priority: 5,
      content: "alt1.aspmx.l.google.com",
    },
    {
      priority: 5,
      content: "alt2.aspmx.l.google.com",
    },
    {
      priority: 10,
      content: "alt3.aspmx.l.google.com",
    },
    {
      priority: 10,
      content: "alt4.aspmx.l.google.com",
    },
  ].forEach((record) => {
    new Record(scope, record.content, {
      name: "@",
      zoneId: zone.zoneId,
      type: "MX",
      priority: record.priority,
      content: record.content,
    });
  });

  new Record(scope, "spf", {
    name: "@",
    zoneId: zone.zoneId,
    content:
      "v=spf1 include:_spf.google.com include:_amazonses.takkyuuplayer.com ~all",
    type: "TXT",
  });
  new Record(scope, "dmarc", {
    name: "_dmarc",
    zoneId: zone.zoneId,
    content: "v=DMARC1; p=none; rua=mailto:takkyuuplayer@gmail.com",
    type: "TXT",
  });

  new Record(scope, `CNAME/www.takkyuuplayer.com`, {
    name: "@",
    zoneId: zone.zoneId,
    content: "www.takkyuuplayer.com.s3-website-ap-northeast-1.amazonaws.com",
    type: "CNAME",
    proxied: true,
  });
  new Record(scope, `CNAME/takkyuuplayer.com`, {
    name: "www",
    zoneId: zone.zoneId,
    content: "takkyuuplayer.com.s3-website-ap-northeast-1.amazonaws.com",
    type: "CNAME",
    proxied: true,
  });
}

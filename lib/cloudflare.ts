import { DataCloudflareZone } from "@cdktf/provider-cloudflare/lib/data-cloudflare-zone";
import { DnsRecord } from "@cdktf/provider-cloudflare/lib/dns-record";
import { CloudflareProvider } from "@cdktf/provider-cloudflare/lib/provider";
import { TerraformVariable } from "cdktf";
import { Construct } from "constructs";

export function Cloudflare(scope: Construct) {
  new CloudflareProvider(scope, "cloudflare");

  const domain = "takkyuuplayer.com";
  const zoneId = new TerraformVariable(scope, "cloudflare_zone_id", {
    type: "string",
  });
  const zone = new DataCloudflareZone(scope, domain, {
    zoneId: zoneId.value,
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
    new DnsRecord(scope, record.content, {
      name: domain,
      zoneId: zone.zoneId,
      type: "MX",
      priority: record.priority,
      content: record.content,
      ttl: 60,
    });
  });

  new DnsRecord(scope, "spf", {
    name: domain,
    zoneId: zone.zoneId,
    content: `v=spf1 include:_spf.google.com include:_amazonses.${domain} ~all`,
    type: "TXT",
    ttl: 60,
  });
  new DnsRecord(scope, "dmarc", {
    name: `_dmarc.${domain}`,
    zoneId: zone.zoneId,
    content: "v=DMARC1; p=none; rua=mailto:takkyuuplayer@gmail.com",
    type: "TXT",
    ttl: 60,
  });

  new DnsRecord(scope, `CNAME/www.${domain}`, {
    name: domain,
    zoneId: zone.zoneId,
    content: `www.${domain}.s3-website-ap-northeast-1.amazonaws.com`,
    type: "CNAME",
    proxied: true,
    ttl: 1,
  });
  new DnsRecord(scope, `CNAME/${domain}`, {
    name: `www.${domain}`,
    zoneId: zone.zoneId,
    content: `${domain}.s3-website-ap-northeast-1.amazonaws.com`,
    type: "CNAME",
    proxied: true,
    ttl: 1,
  });
}

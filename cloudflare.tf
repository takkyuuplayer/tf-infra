locals {
  domain = "takkyuuplayer.com"
}

data "cloudflare_zone" "main" {
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_dns_record" "mx" {
  for_each = {
    aspmx      = { priority = 1, content = "aspmx.l.google.com" }
    alt1_aspmx = { priority = 5, content = "alt1.aspmx.l.google.com" }
    alt2_aspmx = { priority = 5, content = "alt2.aspmx.l.google.com" }
    alt3_aspmx = { priority = 10, content = "alt3.aspmx.l.google.com" }
    alt4_aspmx = { priority = 10, content = "alt4.aspmx.l.google.com" }
  }

  name     = local.domain
  zone_id  = data.cloudflare_zone.main.zone_id
  type     = "MX"
  priority = each.value.priority
  content  = each.value.content
  ttl      = 60
}

resource "cloudflare_dns_record" "spf" {
  name    = local.domain
  zone_id = data.cloudflare_zone.main.zone_id
  content = "v=spf1 include:_spf.google.com include:_amazonses.${local.domain} ~all"
  type    = "TXT"
  ttl     = 60
}

resource "cloudflare_dns_record" "dmarc" {
  name    = "_dmarc.${local.domain}"
  zone_id = data.cloudflare_zone.main.zone_id
  content = "v=DMARC1; p=none; rua=mailto:takkyuuplayer@gmail.com"
  type    = "TXT"
  ttl     = 60
}

resource "cloudflare_dns_record" "cname_root" {
  name    = local.domain
  zone_id = data.cloudflare_zone.main.zone_id
  content = "www.${local.domain}.s3-website-ap-northeast-1.amazonaws.com"
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "cname_www" {
  name    = "www.${local.domain}"
  zone_id = data.cloudflare_zone.main.zone_id
  content = "${local.domain}.s3-website-ap-northeast-1.amazonaws.com"
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

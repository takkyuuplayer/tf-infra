locals {
  domain = "takkyuuplayer.com"
}

data "cloudflare_zone" "main" {
  filter = {
    name = local.domain
  }
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

resource "cloudflare_workers_custom_domain" "root" {
  account_id = data.cloudflare_zone.main.account.id
  zone_id    = data.cloudflare_zone.main.zone_id
  hostname   = local.domain
  service    = "homepage5"
}

# www は redirect rule を効かせるためだけのレコード。proxied なので 192.0.2.0 には届かない
resource "cloudflare_dns_record" "www" {
  name    = "www.${local.domain}"
  zone_id = data.cloudflare_zone.main.zone_id
  content = "192.0.2.0"
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_ruleset" "redirect" {
  zone_id = data.cloudflare_zone.main.zone_id
  name    = "redirect"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"
  rules = [{
    description = "www to apex"
    expression  = "(http.host eq \"www.${local.domain}\")"
    action      = "redirect"
    action_parameters = {
      from_value = {
        status_code           = 301
        preserve_query_string = true
        target_url = {
          expression = "concat(\"https://${local.domain}\", http.request.uri.path)"
        }
      }
    }
  }]
}

resource "cloudflare_zero_trust_access_application" "preview" {
  account_id = data.cloudflare_zone.main.account.id
  name       = "preview"

  type = "self_hosted"
  destinations = [{
    type = "all_preview_workers",
  }]

  policies = [{
    id         = cloudflare_zero_trust_access_policy.preview.id,
    precedence = 1
  }]
}

resource "cloudflare_zero_trust_access_policy" "preview" {
  account_id = data.cloudflare_zone.main.account.id
  decision   = "allow"
  name       = "preview"

  include = [
    {
      email_domain = {
        domain = "gmail.com"
      }
    },
    {
      email = {
        email = "takafumi_sekiguchi@takkyuuplayer.com"
      }
    }
  ]
}

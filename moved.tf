# State migration from CDKTF to plain Terraform.
# These blocks can be removed after the first successful `terraform apply`.

# Cloudflare MX records
moved {
  from = cloudflare_dns_record.aspmxlgooglecom
  to   = cloudflare_dns_record.mx["aspmx"]
}

moved {
  from = cloudflare_dns_record.alt1aspmxlgooglecom
  to   = cloudflare_dns_record.mx["alt1_aspmx"]
}

moved {
  from = cloudflare_dns_record.alt2aspmxlgooglecom
  to   = cloudflare_dns_record.mx["alt2_aspmx"]
}

moved {
  from = cloudflare_dns_record.alt3aspmxlgooglecom
  to   = cloudflare_dns_record.mx["alt3_aspmx"]
}

moved {
  from = cloudflare_dns_record.alt4aspmxlgooglecom
  to   = cloudflare_dns_record.mx["alt4_aspmx"]
}

# Cloudflare CNAME records
moved {
  from = cloudflare_dns_record.CNAME--wwwtakkyuuplayercom
  to   = cloudflare_dns_record.cname_root
}

moved {
  from = cloudflare_dns_record.CNAME--takkyuuplayercom
  to   = cloudflare_dns_record.cname_www
}

# GitHub branch protections
moved {
  from = github_branch_protection.go-exercise--main_protection
  to   = github_branch_protection.main["go-exercise"]
}

moved {
  from = github_branch_protection.homepage40--main_protection
  to   = github_branch_protection.main["homepage4.0"]
}

moved {
  from = github_branch_protection.rb-exercise--main_protection
  to   = github_branch_protection.main["rb-exercise"]
}

moved {
  from = github_branch_protection.rs-exercise--main_protection
  to   = github_branch_protection.main["rs-exercise"]
}

moved {
  from = github_branch_protection.ts-exercise--main_protection
  to   = github_branch_protection.main["ts-exercise"]
}

# 旧サイト（homepage4.0）を homepage4.takkyuuplayer.com で残す。
# S3 の website endpoint は Host ヘッダでバケットを選ぶため、homepage4.0 の CDK で作る CloudFront を挟む。
# 値の受け渡しは SSM パラメータ:
#   tf-infra -> CDK: 証明書 ARN（/homepage4/certificate-arn）
#   CDK -> tf-infra: CloudFront のドメイン名（/homepage4/distribution-domain-name）

locals {
  homepage4_domain = "homepage4.${local.domain}"
}

resource "aws_acm_certificate" "homepage4" {
  provider          = aws.us_east_1
  domain_name       = local.homepage4_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_dns_record" "homepage4_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.homepage4.domain_validation_options : dvo.domain_name => {
      name   = trimsuffix(dvo.resource_record_name, ".")
      record = trimsuffix(dvo.resource_record_value, ".")
      type   = dvo.resource_record_type
    }
  }

  name    = each.value.name
  zone_id = data.cloudflare_zone.main.zone_id
  content = each.value.record
  type    = each.value.type
  proxied = false
  ttl     = 60
}

resource "aws_acm_certificate_validation" "homepage4" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.homepage4.arn
  validation_record_fqdns = [for record in cloudflare_dns_record.homepage4_acm_validation : record.name]
}

resource "aws_ssm_parameter" "homepage4_certificate_arn" {
  name  = "/homepage4/certificate-arn"
  type  = "String"
  value = aws_acm_certificate_validation.homepage4.certificate_arn
}

data "aws_ssm_parameter" "homepage4_distribution_domain_name" {
  name = "/homepage4/distribution-domain-name"
}

# TLS は CloudFront で終端する。proxied にすると zone の SSL モード（Flexible）で
# CloudFront へ http で届き、CloudFront の https リダイレクトとループする
resource "cloudflare_dns_record" "homepage4" {
  name    = local.homepage4_domain
  zone_id = data.cloudflare_zone.main.zone_id
  content = data.aws_ssm_parameter.homepage4_distribution_domain_name.insecure_value
  type    = "CNAME"
  proxied = false
  ttl     = 1
}

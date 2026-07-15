terraform {
  backend "s3" {
    bucket = "tp-tfstate"
    key    = "tf-infra/cdktf.tfstate"
    region = "ap-northeast-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.25"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.14"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.9"
    }
  }
}

data "aws_secretsmanager_secret" "tf_infra" {
  name = "tf-infra"
}

ephemeral "aws_secretsmanager_secret_version" "tf_infra" {
  secret_id = data.aws_secretsmanager_secret.tf_infra.id
}

locals {
  secrets = jsondecode(ephemeral.aws_secretsmanager_secret_version.tf_infra.secret_string)
}

provider "aws" {
  region = "ap-northeast-1"
}

provider "cloudflare" {
  api_token = local.secrets.cloudflare_api_token
}

provider "github" {
  owner = "takkyuuplayer"
}

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

provider "aws" {
  region = "ap-northeast-1"
}

provider "cloudflare" {}

provider "github" {
  owner = "takkyuuplayer"
}

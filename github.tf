locals {
  github_repos = toset([
    "aws-provisioning",
    "go-exercise",
    "homepage4.0",
    "rb-exercise",
    "rs-exercise",
    "tf-infra",
    "ts-exercise",
  ])
}

resource "github_repository" "repos" {
  for_each = local.github_repos

  name                        = each.key
  allow_auto_merge            = true
  allow_merge_commit          = false
  allow_rebase_merge          = false
  allow_squash_merge          = true
  squash_merge_commit_title   = "PR_TITLE"
  squash_merge_commit_message = "BLANK"
  delete_branch_on_merge      = true
  has_issues                  = true
  has_projects                = true
  has_wiki                    = true

  lifecycle {
    ignore_changes = [description, merge_commit_title, merge_commit_message]
  }
}

import {
  for_each = local.github_repos
  to       = github_repository.repos[each.key]
  id       = each.key
}

resource "github_repository_ruleset" "main" {
  for_each = local.github_repos

  name        = "main"
  repository  = each.key
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH"]
      exclude = []
    }
  }

  rules {
    deletion         = true
    non_fast_forward = false

    pull_request {
      allowed_merge_methods           = ["squash"]
      dismiss_stale_reviews_on_push   = false
      require_code_owner_review       = false
      required_approving_review_count = 0
    }

    required_status_checks {
      strict_required_status_checks_policy = true

      required_check {
        context = "CI"
      }
    }
  }
}

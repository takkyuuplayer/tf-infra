locals {
  github_repos = toset([
    "go-exercise",
    "homepage4.0",
    "rb-exercise",
    "rs-exercise",
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

  lifecycle {
    ignore_changes = [description]
  }
}

resource "github_branch_protection" "main" {
  for_each = local.github_repos

  repository_id = each.key
  pattern       = "main"
  enforce_admins = true

  required_status_checks {
    strict   = true
    contexts = ["CI"]
  }

  required_pull_request_reviews {
    dismiss_stale_reviews           = false
    require_code_owner_reviews      = false
    required_approving_review_count = 0
  }

  allows_force_pushes = false
  allows_deletions    = false
}

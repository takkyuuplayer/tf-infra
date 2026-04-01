resource "github_branch_protection" "main" {
  for_each = toset([
    "go-exercise",
    "homepage4.0",
    "rb-exercise",
    "rs-exercise",
    "ts-exercise",
  ])

  repository_id = each.key
  pattern       = "main"
  enforce_admins = true

  required_pull_request_reviews {
    dismiss_stale_reviews           = false
    require_code_owner_reviews      = false
    required_approving_review_count = 0
  }

  allows_force_pushes = false
  allows_deletions    = false
}

data "github_repositories" "source" {
  query = "user:takkyuuplayer archived:false fork:false"
}

resource "github_branch_protection" "main" {
  for_each = toset(data.github_repositories.source.names)

  repository_id  = each.key
  pattern        = "main"
  enforce_admins = true

  required_pull_request_reviews {
    dismiss_stale_reviews           = false
    require_code_owner_reviews      = false
    required_approving_review_count = 0
  }

  allows_force_pushes = false
  allows_deletions    = false
}

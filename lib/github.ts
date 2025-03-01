import { ActionsSecret } from "@cdktf/provider-github/lib/actions-secret";
import { BranchProtection } from "@cdktf/provider-github/lib/branch-protection";
import { DataGithubRepositories } from "@cdktf/provider-github/lib/data-github-repositories";
import { GithubProvider } from "@cdktf/provider-github/lib/provider";
import { Repository } from "@cdktf/provider-github/lib/repository";
import { TerraformIterator, TerraformVariable } from "cdktf";
import { Construct } from "constructs";

export function GitHub(scope: Construct) {
  // https://github.com/peter-evans/create-pull-request/blob/main/docs/concepts-guidelines.md#authenticating-with-github-app-generated-tokens
  const githubCiAppId = new TerraformVariable(scope, "github_ci_app_id", {
    type: "string",
  });
  const githubCiAppPrivateKey = new TerraformVariable(
    scope,
    "github_ci_app_private_key",
    {
      type: "string",
    }
  );

  new GithubProvider(scope, "github", {
    token: process.env.GITHUB_TOKEN,
    owner: "takkyuuplayer",
  });

  // Get all non-archived repositories
  const allRepos = new DataGithubRepositories(scope, "all_repos", {
    query: "archived:false user:takkyuuplayer",
  });

  // Repositories that need CI secrets
  const ciRepos = [
    "go-exercise",
    "homepage4.0",
    "rb-exercise",
    "rs-exercise",
    "ts-exercise",
  ];

  // Configure CI secrets for specific repositories
  ciRepos.forEach((repo) => {
    new ActionsSecret(scope, `${repo}/app_id`, {
      repository: repo,
      secretName: "CI_APP_ID",
      plaintextValue: githubCiAppId.value,
    });
    new ActionsSecret(scope, `${repo}/app_private_key`, {
      repository: repo,
      secretName: "CI_APP_PRIVATE_KEY",
      plaintextValue: githubCiAppPrivateKey.value,
    });
  });

  // Configure all non-archived repositories with the required settings
  // Use TerraformIterator to properly handle the token list
  const repoIterator = TerraformIterator.fromList(allRepos.names);

  // Create a repository resource for each non-archived repository
  new Repository(scope, "repo", {
    name: repoIterator.value,
    allowMergeCommit: false,
    allowRebaseMerge: false,
    allowSquashMerge: true,
    allowAutoMerge: false,
    deleteBranchOnMerge: true,
    squashMergeCommitTitle: "PR_TITLE",
    squashMergeCommitMessage: "PR_TITLE",
    archiveOnDestroy: true, // Safety measure to prevent accidental deletion
    
    // Use the iterator to create multiple resources
    forEach: repoIterator,
  });

  // Configure branch protection for main branch
  new BranchProtection(scope, "branch_protection", {
    repositoryId: repoIterator.value, // Use the repository name directly
    pattern: "main",
    enforceAdmins: true,
    requiredStatusChecks: [{
      strict: true, // Require branches to be up to date before merging
      contexts: ["ci"], // Require CI to pass (adjust this to match your actual CI check name)
    }],
    requiredPullRequestReviews: [{
      dismissStaleReviews: true,
      requireCodeOwnerReviews: false,
    }],
    restrictPushes: [{
      pushAllowances: ["takkyuuplayer"], // Restrict who can push to matching branches
    }],
    allowsForcePushes: false,
    allowsDeletions: false,
    
    // Use the same iterator to create branch protection for each repository
    forEach: repoIterator,
  });
}

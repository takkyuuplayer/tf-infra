import { ActionsSecret } from "@cdktf/provider-github/lib/actions-secret";
import { BranchProtection } from "@cdktf/provider-github/lib/branch-protection";
import { GithubProvider } from "@cdktf/provider-github/lib/provider";
import { TerraformVariable } from "cdktf";
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

  [
    "go-exercise",
    "homepage4.0",
    "rb-exercise",
    "rs-exercise",
    "ts-exercise",
  ].forEach((repo) => {
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
    new BranchProtection(scope, `${repo}/main_protection`, {
      repositoryId: repo,
      pattern: "main",
      enforceAdmins: true,
      requiredStatusChecks: [
        {
          strict: false, // Require branches to be up to date before merging
          contexts: ["CI"], // Require CI to pass (adjust this to match your actual CI check name)
        },
      ],
      requiredPullRequestReviews: [
        {
          dismissStaleReviews: false,
          requireCodeOwnerReviews: false,
        },
      ],
      allowsForcePushes: false,
      allowsDeletions: false,
    });
  });
}

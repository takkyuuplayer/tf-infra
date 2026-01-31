import { BranchProtection } from "@cdktf/provider-github/lib/branch-protection";
import { GithubProvider } from "@cdktf/provider-github/lib/provider";
import { Construct } from "constructs";

export function GitHub(scope: Construct) {
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
    new BranchProtection(scope, `${repo}/main_protection`, {
      repositoryId: repo,
      pattern: "main",
      enforceAdmins: true,
      requiredPullRequestReviews: [
        {
          dismissStaleReviews: false,
          requireCodeOwnerReviews: false,
          requiredApprovingReviewCount: 0,
        },
      ],
      allowsForcePushes: false,
      allowsDeletions: false,
    });
  });
}

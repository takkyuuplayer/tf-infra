import { DataGithubRepositories } from "@cdktf/provider-github/lib/data-github-repositories";
import { GithubProvider } from "@cdktf/provider-github/lib/provider";
import { Repository } from "@cdktf/provider-github/lib/repository";
import { TerraformIterator } from "cdktf";
import { Construct } from "constructs";

export function GitHub(scope: Construct) {
  new GithubProvider(scope, "github", {
    token: process.env.GITHUB_TOKEN,
    owner: "takkyuuplayer",
  });

  const repos = TerraformIterator.fromList(
    new DataGithubRepositories(scope, "repos", {
      query: "archived:false user:takkyuuplayer",
    }).names
  );

  new Repository(scope, "repo", {
    forEach: repos,
    name: repos.value,
    mergeCommitTitle: "PR_TITLE",
    squashMergeCommitTitle: "PR_TITLE",
    deleteBranchOnMerge: true,
  });
}

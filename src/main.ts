import * as core from '@actions/core';
import * as github from '@actions/github';
import {PullRequest} from './octo/pull-request';

const inputToken: string = core.getInput('token');
const inputLabels: string[] = core.getInput('labels').split(',');
const repoOwner: string = github.context.repo.owner;
const repo: string = github.context.repo.repo;
const octokit = github.getOctokit(inputToken);

async function getPulls(): Promise<Array<PullRequest>> {
  const {data: pulls} = await octokit.rest.pulls.list({
    owner: repoOwner,
    repo: repo,
  });
  return pulls;
}

function excludePullRequest(pulls: Array<PullRequest>, id: number): Array<PullRequest> {
  const newPulls: Array<PullRequest> = [];
  for (let pull of pulls) {
    if (pull.id !== id) {
      newPulls.push(pull);
    }
  }
  return newPulls;
}

function getLabelNames(pulls: Array<PullRequest>): Array<string> {
  const labelNames: Array<string> = [];
  for (let pull of pulls) {
    for (let label of pull.labels) {
      if (!label.name) {
        continue;
      }
      labelNames.push(label.name);
    }
  }
  return labelNames;
}

(async () => {
  const currentPull = github.context.payload.pull_request
    ? (github.context.payload.pull_request as PullRequest)
    : undefined;
  let pulls = await getPulls();

  // Exclude current pull request if this is a pull request.
  if (currentPull) {
    pulls = excludePullRequest(pulls, currentPull.id);
  }

  const usedLabelNames = getLabelNames(pulls);

  for (let inputLabelName of inputLabels) {
    if (usedLabelNames.indexOf(inputLabelName) !== -1) {
      core.setOutput('result', 'true');
      return;
    }
  }
  core.setOutput('result', 'false');
})();

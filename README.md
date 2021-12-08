This action checks if any of the currently **open** PRs (excluding the current PR if this action runs for a PR) in the
current repository contain any of the given labels.

## Use case

We want to deploy any PR with the `deploy` label to the test environment, except if there is already an open PR with
the `deploy` label.

## Usage example

### Terminate workflow if there is a PR with a given label

```
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Check if there is a PR with the 'deploy' label
        id: has-label
        uses: unitedwardrobe/gha-has-label@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          labels: deploy

      - name: Stop if 'deploy' PR exists
        if: ${{ steps.has-label.outputs.result == 'true' }}
        run: exit 1
```

At the time of writing there doesn't seem to be a nice way to gracefully halt a workflow without marking it "failed".
See [here](https://github.com/actions/runner/issues/662).

### Only run step if there are no PRs with a given label

```
jobs:
  test:
    - name: Check if there is a PR with the 'deploy' label
      id: has-label
      uses: unitedwardrobe/gha-has-label@main
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        labels: deploy
          
    - name: Run if there are no PRs with given label
      if: ${{ steps.has-label.outputs.result == 'false' }}
      run: someCommand
```

Created with https://github.com/actions/typescript-action

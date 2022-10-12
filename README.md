# scale-ecs-service

A GitHub action that scales an ECS service by setting the desired task count for the service.

## Repo Tools

This repo uses `pre-commit` to handle Git pre-commit hooks. Installation instructions are [here](https://pre-commit.com/#installation).

## Action Prerequisites

This action requires the following minimum set of IAM permissions:

```json
{
  "Sid": "UpdateService",
  "Effect": "Allow",
  "Action": ["ecs:UpdateService"],
  "Resource": [
    "arn:aws:ecs:<region>:<aws_account_id>:service/<cluster_name>/<service_name>"
  ]
}
```

It also requires AWS credentials that grant these permissions to be set in the environment of the GitHub runner that is executing the action. You can set them using the [configure-aws-credentials Action](https://github.com/aws-actions/configure-aws-credentials)

```yaml
name: Configure AWS credentials
uses: aws-actions/configure-aws-credentials@v1
with:
  aws-region: us-east-1
  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
  aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Action Usage

This action can be used to provision and de-provision self-hosted GitHub runners from the [github-actions-runner-aws](https://github.com/CMSgov/github-actions-runner-aws) repository. When provisioning, set the `desired-count` argument for the action to the number of runners your self-hosted workflow requires. You also must populate the `needs` field for any jobs on self-hosted runners and the de-provisioning job, following the example below:

```yaml
scale-up-ecs:
  name: Scale up self-hosted GitHub runners
  runs-on: ubuntu-latest
  steps:
    - name: scale-ecs-service
      uses: Enterprise-CMCS/scale-ecs-service
      with:
        cluster: example-cluster-name
        service: example-service-name
        desired-count: 1

example-self-hosted-job:
  name: Example job
  needs: [scale-up-ecs]
  runs-on: self-hosted
  steps:
    - name: Example step
      run: echo "This is an example"

scale-down-ecs:
  name: Scale down self-hosted GitHub runners
  needs: [scale-up-ecs, example-self-hosted-job]
  runs-on: ubuntu-latest
  steps:
- name: scale-ecs-service
      uses: Enterprise-CMCS/scale-ecs-service
      with:
        cluster: example-cluster-name
        service: example-service-name
        desired-count: 0
```

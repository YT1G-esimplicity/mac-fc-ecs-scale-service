import core from "@actions/core";
import aws from "aws-sdk";

const ecs = new aws.ECS({
  customUserAgent: "scaleEcsService",
});
ecs.config.getCredentials((error) => {
  if (error) {
    // credentials are not present in the environment for the action
    core.setFailed(`Error configuring AWS ECS: ${error.message}`);
  }
});

try {
  const cluster = core.getInput("cluster", { required: true });
  const service = core.getInput("service", { required: true });
  const desiredCount = core.getInput("desired-count", { required: true });
  core.info(
    `Setting desired task count to ${desiredCount} for service ${service} in cluster ${cluster}`
  );
  await ecs.updateService({ service, cluster, desiredCount }).promise();
} catch (error) {
  core.setFailed(error.message);
}

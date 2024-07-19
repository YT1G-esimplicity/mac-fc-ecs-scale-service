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
  const desiredCount = core.getInput("desired-count");
  const adjustCount = core.getInput("adjust-count");

  if (desiredCount) {
    core.info(
      `Setting desired task count to ${desiredCount} for service ${service} in cluster ${cluster}`
    );
    await ecs.updateService({ service, cluster, desiredCount }).promise();
  } else if (adjustCount) {
    const describeServicesResponse = await ecs.describeServices({
      services: [service],
      cluster,
    }).promise();

    const currentDesiredCount = describeServicesResponse.services[0].desiredCount;
    const newDesiredCount = currentDesiredCount + parseInt(adjustCount, 10);

    core.info(
      `Adjusting task count by ${adjustCount}. New desired task count is ${newDesiredCount} for service ${service} in cluster ${cluster}`
    );
    await ecs.updateService({ service, cluster, desiredCount: newDesiredCount }).promise();
  } else {
    core.setFailed("Either 'desired-count' or 'adjust-count' must be provided.");
  }
} catch (error) {
  core.setFailed(error.message);
}

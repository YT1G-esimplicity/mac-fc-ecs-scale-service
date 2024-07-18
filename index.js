import core from "@actions/core";
import aws from "aws-sdk";

const ecs = new aws.ECS({
  customUserAgent: "scaleEcsService",
});

ecs.config.getCredentials((error) => {
  if (error) {
    core.setFailed(`Error configuring AWS ECS: ${error.message}`);
  }
});

async function main() {
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
      core.info(`Adjusting desired task count for service ${service} in cluster ${cluster} by ${adjustCount}`);
      const currentCount = await getCurrentDesiredCount(cluster, service);
      const newDesiredCount = currentCount + parseInt(adjustCount);
      core.info(`New desired task count is ${newDesiredCount}`);
      await ecs.updateService({ service, cluster, desiredCount: newDesiredCount }).promise();
    } else {
      core.setFailed("Either 'desired-count' or 'adjust-count' must be provided.");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getCurrentDesiredCount(cluster, service) {
  try {
    const describeServicesResponse = await ecs.describeServices({ cluster, services: [service] }).promise();
    const currentCount = describeServicesResponse.services[0].desiredCount;
    return currentCount;
  } catch (error) {
    core.setFailed(`Error retrieving current desired count: ${error.message}`);
    throw error;
  }
}

main();

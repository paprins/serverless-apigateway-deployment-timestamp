'use strict';

/*
 * Serverless ApiGateway::Deployment plugin
 */

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    // Using `after:` because we also want to process the custom resources mentioned in the `serverless.yml`
    this.hooks = {
      'after:aws:package:finalize:mergeCustomProviderResources': this.fixApiGatewayDeployment.bind(this),
    };
  }

  fixApiGatewayDeployment() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    const log = this.serverless.cli.consoleLog;

    log("About to process all resources of type 'AWS::ApiGateway::Deployment' ...");

    // Find the deployment resource in CloudFormation template
    const gatewayDeployResources = Object.keys(template.Resources).filter(id => template.Resources[id].Type === 'AWS::ApiGateway::Deployment');

    gatewayDeployResources.forEach(addTimestampResourceId);

    function addTimestampResourceId(resourceId) {
      // Check if `deploymentId` already ends with digits
      if (!/\d+$/.test(resourceId)) {
        log(`Appending timestamp to '${resourceId}' to force new deployment!`);
        // Add new resource (with timestamp)
        const newResourceId = resourceId + Date.now();
        template.Resources[newResourceId] = template.Resources[resourceId];
        // Remove old resource (without timestamp)
        delete template.Resources[resourceId];
      } else {
        log(`Resource '${resourceId}' already contains timestamp.`);
      }
    }
  }
}

module.exports = ServerlessPlugin;

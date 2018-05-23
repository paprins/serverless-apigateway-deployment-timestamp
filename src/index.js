'use strict';

/*
 * Serverless ApiGateway::Deployment plugin
 */

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.log = serverless.cli.consoleLog;

    this.hooks = {
      'before:aws:package:finalize:mergeCustomProviderResources': this.fixApiGatewayDeployment.bind(this),
    };
  }

  fixApiGatewayDeployment() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    // Find the deployment resource in CloudFormation template
    const gatewayDeployResources = Object.keys(template.Resources).filter(id => template.Resources[id].Type === 'AWS::ApiGateway::Deployment');

    function addTimestampResourceId(resourceId) {
      // Check if `deploymentId` already ends with digits
      if (!/\d+$/.test(resourceId)) {
        this.log(`Appending timestamp to '${resourceId}' to force new deployment!`);
        // Add new resource (with timestamp)
        const newResourceId = resourceId + Date.now();
        template.Resources[newResourceId] = template.Resources[resourceId];
        // Remove old resource (without timestamp)
        delete template.Resources[resourceId];
      }
    }

    gatewayDeployResources.forEach(addTimestampResourceId);
  }
}

module.exports = ServerlessPlugin;

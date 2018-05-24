# Serverless API Gateway Deployment Timestamp

Serverless plugin that adds a timestamp to any `AWS::ApiGateway::Deployment` resource to enforce a re-deployment each time you run `serverless deploy`.

## Installation
Install the package using the following command:

```
$ npm install --save-dev serverless-apigateway-deployment-timestamp
```

Next, add the plugin to your `serverless.yml` like this:

```
plugins:
  - serverless-apigateway-deployment-timestamp
```

That's it ...

## Usage
Given the following example (~ not complete for obvious reasons):

```
...
resources:
  Resources:
    FoobarApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        Name: "${self:provider.stage}-foobar"
    FoobarMethod:
      Type: AWS::ApiGateway::Method
      Properties:
        HttpMethod: POST
        Integration:
          IntegrationHttpMethod: PUT
          IntegrationResponses:
            - StatusCode: 200
          PassthroughBehavior: WHEN_NO_MATCH
          RequestParameters:
            integration.request.path.object: method.request.body.requestData.metaData.documentReference
            integration.request.path.bucket: "'${self:custom.upload_bucket}'"
          Type: AWS
          Uri: "arn:aws:apigateway:#{AWS::Region}:s3:path/{bucket}/{object}.json"
        MethodResponses:
          - StatusCode: 200
            ResponseModels: 
              application/json: "Empty"
        ResourceId:
          Fn::GetAtt:
            - FoobarApi
            - RootResourceId
        RestApiId:
          Ref: FoobarApi
    FoobarApiDeployment:
      Type: AWS::ApiGateway::Deployment
      Properties:
        RestApiId:
          Ref: FoobarApi
        StageName: ${self:provider.stage}
      DependsOn: FoobarMethod
```

The `FoobarApiDeployment` (by default) will not re-deploy after you executed `sls deploy`. This plugin will add a timestamp to the name of the resource to enforce a re-deployment.

You can see the results yourself by running `sls package` and check the log:

```
About to process all resources of type 'AWS::ApiGateway::Deployment' ...
Resource 'ApiGatewayDeployment1527149678818' already contains timestamp.
Appending timestamp to 'FoobarApiDeployment' to force new deployment!
```

Check the result in `.serverless/cloudformation-template-update-stack.json`:

```
  "FoobarApiDeployment1527149678828": {
    "Type": "AWS::ApiGateway::Deployment",
    "Properties": {
      "RestApiId": {
        "Ref": "FoobarApi"
      },
      "StageName": "dev"
    },
    "DependsOn": "FoobarMethod"
  }
```

~ the end
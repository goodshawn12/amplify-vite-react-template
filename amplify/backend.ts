import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
});

const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  "https://bedrock-runtime.us-west-2.amazonaws.com",
  {
    authorizationConfig: {    
      signingRegion: "us-west-2",
      signingServiceName: "bedrock",
    },
  }
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
      // "arn:aws:bedrock:us-west-2::foundation-mosdel/anthropic.claude-3-haiku-20240307-v1:0",
      // "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-instant-v1",
      // "arn:aws:bedrock:us-west-2::foundation-model/meta.llama3-1-8b-instruct-v1:0",
      // "arn:aws:bedrock:us-west-2::foundation-model/meta.llama3-1-405b-instruct-v1:0",
      // "arn:aws:bedrock:us-west-2:739275469823:inference-profile/us.meta.llama3-2-90b-instruct-v1:0",
    ],
    actions: ["bedrock:InvokeModel"],
    
  })
);
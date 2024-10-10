// import {
//     BedrockRuntimeClient,
//     InvokeModelCommand,
// } from "@aws-sdk/client-bedrock-runtime";

export function request(ctx) {
 
    // Construct the prompt with the provided ingredients
    const { patientMessage, weatherMessage, activityMessage } = ctx.args;

    const activitiesList = `
    Activity Name,Indoor or Outdoor,Type,Daytime or Nighttime,Age Requirement
    """a 10-minute balancing exercise indoors""",indoor,exercise,nighttime,<80
    """a 10-minute indoor cycling""",indoor,exercise,daytime,<80
    """deep breathing exercises 5 times""",indoor,relax,nighttime,<100
    """a 5-10 minute meditation""",indoor,relax,nighttime,<100
    """playing soothing music or your favorite song""",indoor,relax,nighttime,<100
    """a 10-minute walk in your neighborhood""",outdoor,exercise,daytime,<100
    """a 10-minute barefoot walk on grass, sand, or earth""",outdoor,exercise,daytime,<100
    """a 10-minute of outdoor stretching/yoga""",outdoor,exercise,daytime,<80
    """a 20-minute gardening in your backyard""",outdoor,relax,daytime,<100
    """a 10-minute sensory walk in your favorite park close by, focusing on the sounds, the touches, and the smell""",outdoor,relax,daytime,<100
    `

    const prompt = `
    You are an expert medical doctor and an experienced lifestyle coach. You are working with a patient with the following background information. At the end, you will reply to the patient in a text message only with the specified format.

    Patient demographic
    """
    ${patientMessage}
    """

    You will choose the best “exercise activity” and the best “relax activity” for the patient to improve their health and reply in the text message:
    """
    To keep up your good health, how about {exercise activity} or {relax activity} now? Let's do this!
    """

    The best activites you choose will be "${weatherMessage}" activities considering the age of the patient. 
    If there are several options for "${weatherMessage}" activities, choose the most similar one to patient's preferred activities: ${activityMessage}.

    The list of activities you can choose from:
    """
    ${activitiesList}
    """

    The accuracy and quality of your decisions and suggested activities are critical to the patient's health and quality of life. The reply should only contain the specified text message. 
    `

    // Return the request configuration
    return {
      resourcePath: `/model/anthropic.claude-3-sonnet-20240229-v1:0/invoke`,
      // resourcePath: `/model/anthropic.claude-3-haiku-20240307-v1:0/invoke`,
      // resourcePath: `/model/anthropic.claude-instant-v1/invoke`,
      // resourcePath: `/model/meta.llama3-1-405b-instruct-v1:0/invoke`,
      // resourcePath: `/model/us.meta.llama3-2-90b-instruct-v1:0/invoke`,

      method: "POST",
      params: {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `\n\nHuman: ${prompt}\n\nAssistant:`,
                },
              ],
            },
          ],
        }),
      },
    };
  }
  
  export function response(ctx) {
    // Parse the response body
    const parsedBody = JSON.parse(ctx.result.body);
    // Extract the text content from the response
    const res = {
      body: parsedBody.content[0].text,
    };
    // Return the response
    return res;
  }
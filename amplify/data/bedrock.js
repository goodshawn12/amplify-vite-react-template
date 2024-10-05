// import {
//     BedrockRuntimeClient,
//     InvokeModelCommand,
// } from "@aws-sdk/client-bedrock-runtime";

export function request(ctx) {
 
    // Construct the prompt with the provided ingredients
    const { patientInfo, patientData, weatherData } = ctx.args;
    
    const prompt = `
    You are an expert medical doctor and an experienced lifestyle coach. You are working with a patient with the following background information. At the end, you will reply to the patient in a text message only with the specified format.

    Patient demographic
    “”””
    ${patientInfo}
    “””

    The patient's resting blood pressure (SBP, systolic blood pressure, and DBP, diastolic blood pressure) are given below: 
    “””
    ${patientData}
    “””

    If the patient's “SBP is equal to or higher than 130" or “DBP is equal to or higher than 90", you will reply to the patient with the following text message without modification: 
    “””
    Thanks for sharing your reading! Your blood pressure is higher than normal today. Watch for the following symptoms such as dizziness, headache, and chest discomfort. Contact your provider if needed. Otherwise, recheck your blood pressure after a few minutes of rest.
    ”””

    If the above condition is not met, the patient's blood pressure is normal and you will reply to the patient with the following text message without modification: 
    “””
    Thanks for sharing your reading! Your blood pressure looks great.
    “”” 
    
    Only if the patient has a normal blood pressure measurement today, you will choose one “physical activity” and one “relaxing activity” and reply in the same text message:
    “””
    To keep up your good health, how about {physical activity} or {relaxing activity} now? Let's do this!
    “””

    The suggestion of indoor or outdoor activities depending on the current time, sunrise and sunset time, outdoor temperature, and weather:
    “””
    ${weatherData}
    “””
    
    If the temperature is too hot (above 85F) or too cold (below 50F), or the current local time is after sunset or before sunrise, or the UV Index is too high, or the weather is rainy, you will choose one “physical activity” and one “relaxing activity” from the following Indoor list.
    “””
    Indoor Physical Activity:
    1. a 10-minute balancing exercise indoors
    2. a 10-minute  indoor cycling

    Indoor Relaxing Activity:
    1. deep breathing exercises 5 times
    2. a 5-10 minute meditation
    3. playing soothing music or your favorite song
    “””

    If the above conditions are not met, you will choose one “physical activity” and one “relaxing activity” from the following Outdoor list. 
    “””
    Outdoor Physical Activity:
    1. a 10-minute walk in your neighborhood
    2. a 10-minute barefoot walk on grass, sand, or earth
    3. a 10-minute of outdoor stretching/yoga

    Outdoor Relaxing Activity:
    1. a 20-minute gardening in your backyard
    2. a 10-minute sensory walk in your favorite park close by, focusing on the sounds, the touches, and the smell
    “””

    The accuracy and quality of your decisions and suggested activities are critical to the patient's health and quality of life. The reply should only contain the specified text message. 
    `

    // Return the request configuration
    return {
      resourcePath: `/model/anthropic.claude-3-sonnet-20240229-v1:0/invoke`,
    //   resourcePath: `/model/anthropic.claude-3-haiku-20240307-v1:0/invoke`,
    //   resourcePath: `/model/anthropic.claude-instant-v1/invoke`,
    //   resourcePath: `/model/meta.llama3-1-405b-instruct-v1:0/invoke`,
    //   resourcePath: `/model/us.meta.llama3-2-90b-instruct-v1:0/invoke`,

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
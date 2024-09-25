// import {
//     BedrockRuntimeClient,
//     InvokeModelCommand,
// } from "@aws-sdk/client-bedrock-runtime";

export function request(ctx) {
    // const { ingredients = [] } = ctx.args;
    // const client = new BedrockRuntimeClient({ region: "us-west-2" });
    // const modelId = "meta.llama3-1-8b-instruct-v1:0";

    // // Construct the prompt with the provided ingredients
    // const userMessage = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;
    
    // // Embed the message in Llama 3's prompt format.
    // const prompt = `
    // <|begin_of_text|>
    // <|start_header_id|>user<|end_header_id|>
    // ${userMessage}
    // <|eot_id|>
    // <|start_header_id|>assistant<|end_header_id|>
    // `;
    
    // // Format the request payload using the model's native structure.
    // const userRequest = {
    //     prompt,
    //     max_gen_len: 512,
    //     temperature: 0.5,
    //     top_p: 0.9,
    // };

    // // Encode and send the request.
    // const response = await client.send(
    //     new InvokeModelCommand({
    //       contentType: "application/json",
    //       body: JSON.stringify(request),
    //       modelId,
    //     }),
    //   );

    // // Return the request configuration
    // return {
    //   resourcePath: `/model/meta.llama3-1-8b-instruct-v1:0/invoke`,
    //   method: "POST",
    //   params: {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(userRequest),
    //   },
    // };

    // Construct the prompt with the provided ingredients
    const { patientInfo, patientData, envData } = ctx.args;
    
    const prompt = `
    You are an expert medical doctor and an experienced lifestyle coach. You are working with a patient with the following background information:

    Patient demographic
    “””
    ${patientInfo}
    “””

    The patient's history of resting blood pressure (SBP, systolic blood pressure, and DBP, diastolic blood pressure), and resting heart rate (HR) are given below. The multiple values per metric correspond to the daily measurements done in the past week, from 6 days ago (first value) to today's measurement (last value).

    “””
    ${patientData}
    “””

    In the first section of your response, titled: “Is your blood pressure normal?”
    Provide clinical insights into the patient's latest blood pressure measurement. Firstly, specify whether today's last blood pressure measurement is in the normal range, too high, or too low. If there are two or more of today's measurements, also comment on the change of the blood pressure of today at different times. Secondly, if today's blood pressure is not in the normal range, communicate with the patient to ask for any symptoms. If the patient does not have two or more measurements of today's blood pressure,  remind the patient to retake the blood pressure measurements. In this section, use no more than five sentences to communicate your comments to the patient in a clear, concise, and caring way.  

    In the second section of your response, titled: “Recommended activities”, there are two scenarios based on the result of the first section:

    In the first scenario, If the patient does not have normal blood pressure today, recommend the pressure refrain from any physical activities until their blood pressure goes back to normal. 

    In the second scenario, if the patient has a normal blood pressure measurement today, determine whether to suggest indoor activities or outdoor activities depending on the current local time, weather and today's sunrise / sunset time:
    
    “””
    Patient's local time and weather information:
    ${envData}
    “””

    Once the indoor or outdoor activities are determined, you will use the corresponding “Outdoor” or “Indoor” section provided below. Then you will choose one of the following physical exercises from the list “Physical Exercises” and one of the following relaxing activities from the list “Relaxing Activities”, using the list from “Outdoor” or “Indoor”.  The best choice will consider the patient’s age, gender, health status, fitness level, and the local time and weather. 

    “””
    Section: Outdoor
    a. List: Physical Activities
    1. Take a 10-minute walk in your neighborhood.
    2. Take a 10-minute barefoot walk on grass, sand, or earth. 
    3. Take a 10-minute of outdoor stretching/yoga.

    B. List: Relaxing Activities
    1. Take a 20-minute gardening in your backyard
    2. Take a 10-minute sensory walk in your favorite park close by, focusing on the sounds, the touches, and the smells.
    “””

    “””
    Section: Indoor
    a. List: Physical Activities
    1. Do a 10-minute balancing exercise indoors
    2. Do a 10-minute  indoor cycling

    a. List: Relaxing Activities
    1. Do deep breathing exercises 5 times
    2. Do 5-10 minute meditation
    3. Play soothing music or your favorite song
    “””

    The accuracy and quality of your decisions and suggested activities are critical to the patient's health and quality of life. 
    `

    // Return the request configuration
    return {
    //   resourcePath: `/model/anthropic.claude-3-sonnet-20240229-v1:0/invoke`,
      resourcePath: `/model/anthropic.claude-3-haiku-20240307-v1:0/invoke`,
      method: "POST",
      params: {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 1000,
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
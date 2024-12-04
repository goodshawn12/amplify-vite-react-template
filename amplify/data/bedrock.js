// import {
//     BedrockRuntimeClient,
//     InvokeModelCommand,
// } from "@aws-sdk/client-bedrock-runtime";

export function request(ctx) {
 
    // Construct the prompt with the provided ingredients
    const { patientMessage, weatherMessage, activityMessage, conditionMessage } = ctx.args;

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
    """taking a warm shower or bath to unwind and relax""",indoor,relax,daytime/evening/nighttime,<100
    """taking a warm shower or bath before bed to unwind and relax""",indoor,sleep,nighttime,<100
    """darkening your bedroom or dimming the lights an hour before bed"" ",indoor,sleep,nighttime,<100
    """using earplugs or white noise to reduce the interruption from outside""",indoor,sleep,nighttime,<100
    """limiting drinks with caffeine and sugar""",indoor,sleep,daytime,<80
    """establishing a relaxation routine""",indoor,sleep,nighttime,<100
    """adjusting room temperature to keep it cool, around 65-70F""",indoor,sleep,nighttime,<100
    """limiting your nap to 20-30 minutes for a quick refresh""",indoor,sleep,daytime,<100
    """going to bed and waking up at the same time everyday""",indoor,sleep,daytime/nighttime,<100
    """avoiding screens for at least 30-60 minutes before sleep""",indoor,sleep,nighttime,<100
    """using calming scents such as essential oils""",indoor,sleep,nighttime,<100
    """limiting fluids in the evening""",indoor,sleep,daytime,<100
    """taking relaxing herbal tea before bed, but keeping the quantity small""",indoor,sleep,nighttime,<100
    """having a light and early dinner to allow digestion""",indoor,sleep,evening,<100
    """choosing complex carbohydrates for energy""",indoor,diet,daytime,<100
    """eating small, frequent meals""",indoor,diet,daytime,<100
    """staying hydrated with water-rich foods such as cucumbers, celery or orange""",indoor,diet,daytime,<100
    """including anti-inflammatory foods like berries and leafy greens""",indoor,diet,daytime,<100
    """eating foods high in protein to stay full, not overeat, and build muscle""",indoor,diet,daytime/evening,<100
    """eating less red meat and more fish/poultry or vegetable-based proteins to lessen cholesterol""",indoor,diet,daytime/evening,<100
    """limit the amount of fat (e.g. butter, margarine, oil) when cooking""",indoor,diet,daytime/evening,<100
    """eating food that's high in fiber to stay full for longer""",indoor,diet,daytime/evening,<100
    """limiting processed or ready-made food""",indoor,diet,daytime/evening,<100
    """limit foods that are high in salt/sodium""",indoor/outdoor,diet,daytime/evening,<100
    """avoid foods that are high in sugar""",indoor,diet,daytime/evening,<100
    """take a walk along the beach""",outdoor,exercise,daytime,<80
    """swim or walk in a pool""",indoor/outdoor,exercise,daytime,<80
    """sweep the driveway or vacuum the carpet in your home""",indoor/outdoor,exercise,daytime,<80
    """dance around in your house""",indoor,exercise,daytime,<80
    """use resistance bands for strength training""",indoor,exercise,daytime,<80
    """read a book""",indoor,sleep,evening/nighttime,<100
    """journal your thoughts""",indoor/outdoor,relax,daytime/evening/nighttime,<100
    """talk to a family member or close friend""",indoor/outdoor,relax,daytime/evening/nighttime,<100
    `

    let prompt = '';
    if (conditionMessage == 'recommendation') {
      // main prompt with activity suggestion
      prompt = `
      You are an expert medical doctor and an experienced lifestyle coach. You are working with a patient who has the following background information. Finally, you will reply to the patient in a text message only with the specified format.

      Patient demography
      """
      ${patientMessage}
      """

      You will choose the best two activities for the patient to improve their health and reply in the text message:
      """
      To keep up your good health, how about {activity one} or {activity two}? Let's do this!
      """
      Exclude the quotation marks from the activities. 

      Your selection will follow the steps below:
      1. Find "${weatherMessage}" activities that match the "Indoor or Outdoor" and "Daytime or Nighttime" properties.
      2. Find activities with "Type" property matching or closest to "${activityMessage}".
      3. Select the best two activities that satisfy patient's age requirement and are the most similar to patient's preferred activities: ${activityMessage}.

      Below is the list of activities you can choose from. The first row is the properties of the activities.
      """
      ${activitiesList}
      """

      The accuracy and quality of your decisions and suggested activities are critical to the patient's health and quality of life. The reply should only contain the specified text message. 
      `

    } else if (conditionMessage == 'history') {

      prompt = `
      You are an expert medical doctor and an experienced lifestyle coach. Below is the patient's history of blood pressure measurements:
      """
      Data Upload Time, Systolic Blood Pressure, Diastolic Blood Pressure;
      ${patientMessage}
      """

      You will provide three data-citing comments on the data upload pattern, the trend of blood pressure values, and especially how the latest blood pressure value compared to the history values. Do not give any negative feedback or comment on abnormal measurements. Your goal is to provide insights and encouragement for the patient such that they keep measuring their blood pressure. 
      Your reply will be a concise text message addressed to the patient without title line. Your reply will include three concise sentences on the comments of data insights coments and and one sentence of encouragement message.
      `

    } else {
      prompt = `Display the following information without modification: """Condition ${conditionMessage} is not implemented."""`
    }

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
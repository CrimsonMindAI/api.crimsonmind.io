import OpenAI from "openai";
import { isImage, convertImageB64 } from "../util/File.js";

const { OPENAI_API_KEY } = process.env;

export class Chat {
    static model = 'gpt-4o';

    constructor() {
        this.Oai = new OpenAI(OPENAI_API_KEY);
    }

    simpleAsk = async (statement = 'Say hello') => {
        const { reply } = this;

        const messages = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: statement
                    }
                ]
            }
      ]

        try {
            return await reply(messages);
        } catch (error) {
            console.error('Error in simpleAsk:', error);
            throw error;
        }
    }

    describeImage = async (imageBuffer, statement = 'Describe the image') => {
        try {
            if(!imageBuffer) {
                throw new Error('Image path is required');
            }
            if (!isImage(imageBuffer)) {
                throw new Error('Unsupported image type');
            }

            const base64 = await convertImageB64(imageBuffer);
            const messages = [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: statement
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64
                            }
                        }
                    ]
                }
            ];
            return await this.reply(messages);
        } catch (error) {
            console.error('Error in describeImage:', error);
            throw error;
        }
    }

    reply = async (messages = []) => {
        const { Oai } = this;
        const { model } = Chat;

        try {
            const response = await Oai.chat.completions.create({
                model,
                messages,
            });
            const { choices } = response;
            return choices[0].message;
        } catch (error) {
            console.error('Error in reply:', error);
            throw error;
        }
    }
}
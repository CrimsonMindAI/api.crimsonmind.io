import OpenAI from "openai";
import { isImage, convertImageB64 } from "../util/File.js";
import fetch from 'node-fetch';

const { OPENAI_API_KEY } = process.env;

export class Chat {
    static model = 'gpt-4o';

    constructor() {
        this.Oai = new OpenAI(OPENAI_API_KEY);
    }

    describe = async (imageBuffer, statement = 'Describe the image') => {
        Chat.model = 'gpt-4o';

        try {
            if(!imageBuffer) {
                throw new Error('Image path is required');
            }
            if (!isImage(imageBuffer)) {
                throw new Error('Unsupported image type');
            }

            const base64 = await convertImageB64(imageBuffer);
            const prompt = [
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
            return await this.reply(prompt);
        } catch (error) {
            console.error('Error in describeImage:', error);
            throw error;
        }
    }

    generate = async (prompt) => {
        Chat.model = 'dall-e';
        return await this.reply(prompt);
    }

    reply = async (prompt = []) => {
        const { Oai } = this;
        const { model } = Chat;

        try {
            let response;
            switch(model) {
                case 'dall-e':
                    response = await this.Oai.images.generate({
                        prompt
                    });

                    const imageUrl = response.data[0].url;
                    const imageResponse = await fetch(imageUrl);
                    const imageBuffer = await imageResponse.arrayBuffer();
                    const base64Image = Buffer.from(imageBuffer).toString('base64');

                    return { "message" : base64Image };
                default:
                    response = await Oai.chat.completions.create({
                        model,
                        messages:prompt,
                    });
                    const { choices } = response;
                    return choices[0].message;
            }

        } catch (error) {
            console.error('Error in reply:', error);
            throw error;
        }
    }
}
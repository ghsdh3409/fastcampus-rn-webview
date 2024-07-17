import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import OpenAI from "openai";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parsing error" });
    }

    const file = files.file?.[0];
    if (file == null) {
      console.error("File is undefined");
      return res.status(500).json({ erro: "Transcription failed" });
    }

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.filepath),
        model: "whisper-1",
        language: "ko",
        response_format: "verbose_json",
      });

      console.log("transcription", transcription);
      return res.status(200).json({ transcription });
    } catch (error: any) {
      console.error("error", error);
      return res.status(500).json({ error: error.message });
    } finally {
      fs.unlinkSync(file.filepath);
    }
  });
};

export default handler;

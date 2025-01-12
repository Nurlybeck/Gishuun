import { supabase } from "../../config/supabaseClient";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to handle FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(400).json({ error: "Invalid FormData" });
      }

      console.log("Fields:", fields);
      console.log("Files:", files);

      const file = files.file && files.file[0];
      const bucket = fields.bucket && fields.bucket[0];
      const fileName = fields.fileName && fields.fileName[0];

      if (!file || !bucket || !fileName) {
        console.error("Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log("File Path:", file.filepath);

      const fileData = fs.readFileSync(file.filepath);

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileData, {
          contentType: file.mimetype,
          upsert: true,
        });

      console.log("Upload data:", data);

      if (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: error.message });
      }

      // Generate the public URL manually
      const publicURL = `https://bwehyieikoldjpiehoqy.supabase.co/storage/v1/object/public/${bucket}/${data.path}`;

      console.log("Public URL:", publicURL);

      res.status(200).json({ fileUrl: publicURL });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
}

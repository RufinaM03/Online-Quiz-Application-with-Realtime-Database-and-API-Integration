const express = require("express");
const multer = require("multer");
const cors = require("cors");

// Import Document AI client from @google-cloud/documentai v8.12.0
const { DocumentUnderstandingServiceClient } =
  require("@google-cloud/documentai").v1;

// Initialize Express
const app = express();
const port = 3000;

// Setup CORS
app.use(cors());

// Instantiate Document AI client
const client = new DocumentUnderstandingServiceClient();

// Setup Multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuration for Google Cloud Document AI
const PROJECT_ID = "online-quiz-application-6ba6d"; // Your GCP Project ID
const LOCATION = "us"; // Location for your processor
const PROCESSOR_ID = "1f3b37ea9210d39"; // Your Processor ID
const processorName = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;

// Endpoint for file upload and processing
app.post("/process-file", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    // Prepare the document for processing
    const document = {
      inputConfig: {
        mimeType: "application/pdf", // Change mimeType if your file isn't PDF
        content: req.file.buffer,
      },
    };

    // Process the document using Document AI
    const [result] = await client.processDocument({
      name: processorName,
      rawDocument: document.inputConfig,
    });

    // Extract text from the document
    const extractedText = result.document.text;

    //process the extracted text (e.g., extract questions and answers) in javascript regex

    // Send the extracted text back in the response
    res.json({ extractedText });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Error processing the file." });
  }
});

// Start the server
app.listen(port, () => {
  console.log("Server running at http://localhost:${port}");
});


const express = require("express")
const app = express();
const fs = require('fs');
const PDFParser = require('pdf-parse');
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
const natural = require('natural');
app.use(cors());
app.use("/files", express.static("files"));


//mongodb connection----------------------------------------------
const mongoUrl =
    "mongodb+srv://nandhinib:nandhinib@cluster0.2jhrbie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("Connected to database");
    })
    .catch((e) => console.log(e));


//multer---------------------------------------------------
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./files");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname);
    },
});


const PdfSchema = require('./pdfDetails');
const upload = multer({ storage: storage });


app.post("/upload-files", upload.single("file"), async (req, res) => {
    console.log(req.file);
    const title = req.body.title;
    const fileName = req.file.filename;
    const filePath = req.file.path;
    try {

        const fileData = fs.readFileSync(filePath);
        const text = await extractTextFromPdf(fileData);
        const newPdf = new PdfSchema({
            title: title,
            pdf: fileData,
            text: text
        });
        await newPdf.save();
        //fs.unlinkSync(filePath);
        res.send({ status: "ok" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to upload file" });
    }

});
//Getting Text from PDF
async function extractTextFromPdf(pdfData) {
    try {
        const data = await PDFParser(pdfData);
        return data.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        return "";
    }
}


app.get("/download-pdf/:id", async (req, res) => {
    try {
        const pdf = await PdfSchema.findById(req.params.id);
        if (!pdf) {
            return res.status(404).send("PDF not found");
        }
        const fileName = `${pdf.title}.pdf`; // Name your file here
        // // Convert Buffer to a file
        // fs.writeFile(fileName, pdf.pdf, (err) => {
        //     if (err) {
        //         return res.status(500).send("Error converting PDF");
        //     }
        //     // Send the file to the client
        //     res.sendFile(fileName, { root: __dirname }); // Change the root directory if needed
        // });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${pdf.title}.pdf"`);
        res.send(pdf.pdf);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/get-files", async (req, res) => {
    try {
        const data = await PdfSchema.find({});
        res.send({ status: "ok", data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to retrieve files" });
    }
});

app.get("/search", async (req, res) => {
    const query = req.query.q;
    try {
        const results = await PdfSchema.find({ $text: { $search: query } });
        res.send({ status: "ok", results: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to perform text search" });
    }
});
//apis-------------------------------------------------------------
app.get("/", async (req, res) => {
    res.send("success");
})
app.listen(5000, () => {
    console.log("server started");

}
)













// const express = require("express");
// const app = express();
// const fs = require('fs');
// const PDFParser = require('pdf-parse');
// const mongoose = require("mongoose");
// const axios = require('axios');
// const MongoClient = require('mongodb').MongoClient;
// const multer = require('multer');
// const cors = require("cors");
// const natural = require('natural');
// const PdfSchema = require('./pdfDetails');

// // Set up middleware
// app.use(express.json());
// app.use(cors());
// app.use("/files", express.static("files"));

// // MongoDB connection
// const mongoUrl = "mongodb+srv://nandhinib:nandhinib@cluster0.2jhrbie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// mongoose.connect(mongoUrl, { useNewUrlParser: true })
//     .then(() => {
//         console.log("Connected to database");
//     })
//     .catch((e) => console.log(e));

// // Multer configuration for file upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./files");
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now();
//         cb(null, uniqueSuffix + file.originalname);
//     },
// });
// const upload = multer({ storage: storage });

// // Function to get text embeddings from OpenAI
// async function getEmbedding(query) {
//     const url = 'https://api.openai.com/v1/embeddings';
//     const openai_key = 'your_openai_key'; // Replace with your OpenAI key.

//     let response = await axios.post(url, {
//         input: query,
//         model: "text-embedding-ada-002"
//     }, {
//         headers: {
//             'Authorization': `Bearer ${openai_key}`,
//             'Content-Type': 'application/json'
//         }
//     });

//     if (response.status === 200) {
//         return response.data.data[0].embedding;
//     } else {
//         throw new Error(`Failed to get embedding. Status code: ${response.status}`);
//     }
// }

// // Function to find similar documents based on embeddings
// async function findSimilarDocuments(embedding) {
//     const url = mongoUrl; // Replace with your MongoDB URL.
//     const client = new MongoClient(url);

//     try {
//         await client.connect();

//         const db = client.db('your_database_name'); // Replace with your database name.
//         const collection = db.collection('your_collection_name'); // Replace with your collection name.

//         const documents = await collection.aggregate([
//             { "$vectorSearch": { "queryVector": embedding, "path": "plot_embedding", "numCandidates": 100, "limit": 5, "index": "moviesPlotIndex" } }
//         ]).toArray();

//         return documents;
//     } finally {
//         await client.close();
//     }
// }

// // Route for uploading files
// app.post("/upload-files", upload.single("file"), async (req, res) => {
//     // Code for uploading files
// });

// // Route for downloading PDFs
// app.get("/download-pdf/:id", async (req, res) => {
//     // Code for downloading PDFs
// });

// // Route for retrieving files
// app.get("/get-files", async (req, res) => {
//     // Code for retrieving files
// });

// // Route for performing semantic search
// app.get("/search", async (req, res) => {
//     const query = req.query.q;
//     try {
//         const embedding = await getEmbedding(query);
//         const results = await findSimilarDocuments(embedding);
//         res.send({ status: "ok", results: results });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: "error", message: "Failed to perform semantic search" });
//     }
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

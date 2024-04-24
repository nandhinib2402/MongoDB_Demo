// const mongoose = require("mongoose");

// const PdfDetailsSchema = new mongoose.Schema(
//   {
//     pdf: String,
//     title: String,
//   },
//   { collection: "PdfDetails" }
// );

// mongoose.model("PdfDetails", PdfDetailsSchema);
const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    pdf: {
        type: Buffer, // Store binary data of the PDF file
        required: true
    },
    text: {
        type: String, // Store the extracted text from the PDF
        required: true
    }
});
pdfSchema.index({ text: 'text' });
module.exports = mongoose.model('PdfDetails', pdfSchema);

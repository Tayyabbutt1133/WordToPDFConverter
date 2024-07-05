const express = require("express");
const app = express();
const multer = require("multer");
const port = 3000;
const docxToPDF = require("docx-pdf");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Ensure the uploads and files directories exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
if (!fs.existsSync("files")) {
  fs.mkdirSync("files");
}

app.use(cors());

// Setting up storage for file uploading at uploads folder, then on server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});



const upload = multer({ storage: storage });
// Root route to avoid "Cannot GET /" error
app.get("/", (req, res) => {
  res.send("Welcome to the file conversion server!");
});

app.post("/convertFile", upload.single("file"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file",
      });
    }

    // Defining output path/folder for converted file
    let outputPath = path.join(
      __dirname,
      "files",
      `${req.file.originalname}.pdf`
    );

    docxToPDF(req.file.path, outputPath, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Error converting Docx to Pdf",
        });
      }
      res.download(outputPath, (downloadErr) => {
        if (downloadErr) {
          console.log(downloadErr);
          return res.status(500).json({
            message: "Error downloading the file",
          });
        }
        console.log("File Downloaded");
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

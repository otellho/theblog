import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from 'fs';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensure the correct views directory

// In-memory storage for posts
const posts = [];

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index", { posts: posts });
});

app.get("/blogpost", (req, res) => {
  res.render("blogpost");
});

const placeholderImage = 'placeholder.png'; // Specify the path to your placeholder image

app.post("/blogpost", upload.single("postImage"), (req, res) => {
  const postTitle = req.body.postTitle;
  const postText = req.body.postText;
  const postImage = req.file ? req.file.filename : placeholderImage; // Use placeholder image if no image is uploaded
  const createdAt = new Date().toISOString().split('T')[0];  // Save the creation time of the post
  posts.push({ title: postTitle, text: postText, image: postImage, createdAt: createdAt });
  console.log(posts); // Debugging: Log posts to verify data
  res.redirect("/");
});

app.get("/viewpost/:id", (req, res) => {
  const postId = req.params.id;
  const post = posts[postId];
  res.render("viewpost", { id: postId, title: post.title, text: post.text, image: post.image });
});

app.get("/editpost/:id", (req, res) => {
  const postId = req.params.id;
  const post = posts[postId];
  if (!post) {
    return res.status(404).send('Post not found');
  }
  res.render("editpost", { id: postId, title: post.title, text: post.text, image: post.image });
});

app.post("/editpost/:id", upload.single("postImage"), (req, res) => {
  const postId = req.params.id;
  const updatedTitle = req.body.postTitle;
  const updatedText = req.body.postText;
  const postImage = req.file ? req.file.filename : posts[postId].image || placeholderImage; // Use new image if uploaded, else keep old image
  const createdAt = posts[postId].createdAt; // Preserve original creation time

  // Check if the post exists
  if (!posts[postId]) {
    return res.status(404).send('Post not found');
  }

  // Update the post
  posts[postId] = { ...posts[postId], title: updatedTitle, text: updatedText, image: postImage, createdAt: createdAt };
  res.redirect(`/viewpost/${postId}`);
});

app.post("/deletepost/:id", (req, res) => {
  const postId = req.params.id;
  posts.splice(postId, 1); // Remove the post from the array
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

import ejs from 'ejs';
import fs from 'fs';
import { join } from 'path';

// Define the path to your EJS file
const ejsFilePath = join(process.cwd(), 'views', 'index.ejs');

// Sample posts data
const posts = [
    {
        title: "First Post",
        createdAt: new Date(),
        image: null
    },
    {
        title: "Second Post",
        createdAt: new Date(),
        image: "image1.jpg"
    }
];

// Render the EJS file to HTML
ejs.renderFile(ejsFilePath, { posts }, (err, str) => {
    if (err) {
        console.error(err);
        return;
    }

    // Write the rendered HTML to index.html
    fs.writeFileSync(join(process.cwd(), 'index.html'), str);
});

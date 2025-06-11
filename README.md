> 🚀 [Pocket is shutting down on July 8, 2025](https://getpocket.com/farewell). Migrate all your data to Faved by uploading Pocket data export file. Keep your bookmarks safe and always accessible locally on you computer!

# Faved

Faved is a simple self-hosted web application to store and organise web links. All data is stored locally on your computer.

100% free and open source. No ads, tracking, or data collection.

🌐 **[Try Live Demo](https://demo.faved.dev/)**

![image](https://github.com/user-attachments/assets/70c9cf83-43bf-4c7d-8444-d6967aa3ae40)



## Features

- Save bookmarks with titles, descriptions, URLs and custom notes from any desktop browser using a bookmarklet.
- Organize bookmarks with color-styled nested tags. Pin important tags at the top for quick access.
- Super fast performance: loads full page with 2,000+ bookmarks in under 100ms.
- Import bookmarks from Pocket: easily migrate your saved links, tags, collections and notes from Pocket by uploading the exported ZIP file.

## Requirements

- Docker

## Installation

Clone this repository:

```bash
git clone https://github.com/denho/faved.git
cd faved
```

Start the Docker container (change the port if needed):

```bash
PORT=8000 docker-compose up -d
```

Visit `http://localhost:8000` in your browser to access Faved.

- The first time you visit, you'll be prompted to set up the database. Just click "Initialize Database" to proceed and finish installation.

### Using the Bookmarklet

<img src="https://github.com/user-attachments/assets/c4a4c95f-5cd4-49c1-88ce-1b88837e8c12" width="60%" />

1. Look for the bookmarklet link "Add to Faved" at the top right corner of the Faved interface.
2. Drag the link to your browser's bookmarks bar.
3. When browsing the web, click the bookmarklet on any page you want to save.
4. The form to add the web page to Faved will open.
5. Add tags and notes as desired, then save.


## Project Structure

- `/controllers`: Application controllers
- `/framework`: Core framework components
- `/models`: Data models
- `/public`: Web-accessible files
- `/storage`: Database storage
- `/utils`: Utility classes
- `/views`: HTML templates

## License

This project is licensed under the [MIT License](LICENSE).

## Credits

Faved uses only open source packages:

- Bootstrap for UI components
- Select2 for enhanced tag select inputs
- Apache + PHP 8 + SQLite stack for the backend

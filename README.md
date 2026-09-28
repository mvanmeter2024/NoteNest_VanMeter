# NoteNest_VanMeter
# NoteNest

NoteNest is a simple student note-taking web application designed to help students create, organize, edit, and delete their notes in one convenient place.

## Live Application

https://notenestvanmeter.netlify.app


## Live Demo
https://www.youtube.com/watch?v=HoO7I7xLWac


## Features

- User registration and login
- Secure user authentication through Supabase
- Create new notes
- View saved notes
- Edit existing notes
- Delete notes
- Notes are saved to a cloud database
- Users can only access and modify their own notes
- Notes remain saved after refreshing the application

## Technologies Used

- HTML
- CSS
- JavaScript
- Supabase Authentication
- Supabase Database
- Netlify
- GitHub

## Database

NoteNest uses Supabase as its backend database.

The application contains a `notes` table with the following information:

- `id` - Unique identifier for each note
- `user_id` - Identifies the user who created the note
- `title` - Title of the note
- `content` - Content of the note
- `created_at` - Date and time the note was created

Row Level Security (RLS) is enabled so that authenticated users can only view, create, edit, and delete their own notes.

## Project Structure

```text
NoteNest_VanMeter/
│
├── index.html    # Main application page
├── style.css     # Application styling
├── app.js        # Application logic, authentication, and database operations
└── README.md     # Project documentation

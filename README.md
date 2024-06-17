A README file should be informative yet concise. Here's a more streamlined version:

# Movie Recommendation Website

This repository contains a full-stack movie recommendation website built with React (frontend), Express.js/Node.js (backend), and MySQL, deployed on AWS EC2 using Docker.

## Overview

The Movie Recommendation Website leverages The Movie Database (TMDB) API and OpenAI API to provide personalized movie recommendations based on user preferences.

## Features

### User Account and Preferences
- **Account Creation:** Users can create an account to start using the platform.
- **Initial Preferences:** Users are prompted to like a few randomly selected movies from the Top Rated and Popular categories on TMDB to help the AI provide relevant suggestions.

### AI Movie Search
- **Flexible Search:** Search for movies using queries like "space movies" or "intellectual movies."
- **Refinement:** Refine searches with additional criteria, such as "older movies."
- **Unique Recommendations:** AI avoids recommending movies the user has already liked.
- **Movie Details:** AI-generated recommendations include detailed information from TMDB.

### AI Weekly-Mix
- **Weekly Recommendations:** AI provides six movie recommendations weekly based on the user's liked movies.

### Movie Interaction
- **Like/Watchlist Buttons:** Users can like movies to improve recommendations or add them to their watchlist.
- **Detailed Movie Page:** View detailed information about movies and manage personal lists.

### Database Movie Search
- **Direct Search:** Search for specific movies using the Navbar for more detailed information.

### Profile Page (Work in Progress)
- **User Profile:** Manage liked movies, watchlist, and seen movies.

## Deployment
The website is deployed on AWS EC2 using Docker with a deploy.yml script for automated deployment.

# Belay - A Slack Messaging App Clone

Welcome to Belay, a lightweight Slack clone built as a final project for Web Development. This app is designed to demonstrate a modern, database-backed single-page application with real-time messaging capabilities.

## Getting Started

To get started with Belay, clone this repository to your local machine and navigate to the project directory.

## Installation

Ensure you have Python 3.11+ and SQLite3 installed on your system. Then install the required dependencies with pip:

```bash
pip3 install -r requirements.txt
```

## Running the Application

To run the application, go to the belay folder and start the server with Flask.

```bash
cd belay
flask run
```

Open your web browser and navigate to the URL indicated by Flask, typically ***<http://127.0.0.1:5000/>***.

## Using the Application

- Unauthenticated users can sign up or log in from the homepage.
- Once authenticated, users can view and join channels, read messages, and post their own messages.
- Users can reply to some messages or leave an emoji reaction and the channel will show you unread messages count.
- To log out, change the username, or password, users can navigate to the account settings.

## Core Features

- Real-time chat in various channels
- Users can freely create or delete the channels
- Threaded replies in channels
- Emoji reactions to messages and unread messages count

## Acknowledgments & Reference

Thanks to to the Web Development course staff for their guidance.
React single-page-application: <https://legacy.reactjs.org/docs/glossary.html#single-page-application>
React getting started: <https://www.w3schools.com/react/react_getstarted.asp>

## Have Fun! Enjoy your own Slack

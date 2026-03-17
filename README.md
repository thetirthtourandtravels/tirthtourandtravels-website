# Tirth Tour & Travels - Official Website

This repository contains the source code for the official static website of Tirth Tour & Travels. The project is built adhering to modern web standards, with a strong focus on high-speed performance, SEO optimization, and providing a seamless user experience.

## Project Overview

The website is completely front-end based. Instead of a traditional backend database, it utilizes a modular JSON architecture. This approach makes it exceptionally easy to manage travel packages, pricing, and admin contact details. The platform also features direct WhatsApp booking integration to help streamline inquiries and improve customer conversion rates.

## Key Features

* Modular Data Architecture: Destinations, testimonials, and admin contact details are dynamically rendered from separate JSON files (places.json, testimonials.json, admin.json).
* High-Speed Caching: JavaScript Session Storage is implemented to cache API requests, resulting in near-instant page loads across the site.
* Dynamic Pricing & Duration: Users can select their preferred tour duration from a dropdown, and the package price updates in real-time.
* Direct WhatsApp Integration: Data submitted through the booking and contact forms is formatted automatically and redirected straight to the admin's WhatsApp.
* Advanced Search & Filter: Destinations can be easily found using category filters and a real-time text search input.
* Fully Responsive: The UI/UX is highly optimized for mobile, tablet, and desktop screens.

## Tech Stack

* HTML5 (Semantic & SEO Optimized)
* CSS3 (Flexbox, Grid, Custom Variables, Custom Animations)
* Vanilla JavaScript (ES6+, Async/Await, Promise.all, DOM Manipulation)
* JSON (Static Data Storage)
* External Libraries: Flatpickr (for date selection), Remix Icons (for iconography)

## Folder Structure

/
|-- index.html              (Home Page)
|-- about.html              (About Us Page)
|-- all-destinations.html   (Explore all places)
|-- destination.html        (Dynamic single package details)
|-- contact.html            (Contact form & details)
|-- faq.html                (Frequently Asked Questions)
|-- README.md               (Project documentation)
|-- assets/
    |-- css/                (Page-specific and global stylesheets)
    |-- js/                 (Page-specific and global JS scripts)
    |-- images/             (Images and videos)
    |-- data/               (places.json, testimonials.json, admin.json)

## How to Run Locally

Since this project uses the JavaScript `fetch()` API to load local JSON files, opening the HTML files directly by double-clicking them in a browser may trigger CORS (Cross-Origin Resource Sharing) errors.

To run and test the website properly on your local machine:

1. Clone the repository to your local system.
2. Open the project folder in Visual Studio Code (VS Code).
3. Install the 'Live Server' extension from the VS Code marketplace.
4. Right-click on the `index.html` file and select "Open with Live Server".
5. The website will automatically open and run on a local server environment in your default browser.

## Deployment

This project consists entirely of static files, meaning it can be directly hosted on any modern static hosting platform such as Vercel, Netlify, or GitHub Pages. There are no special build steps or complex configurations required. Simply import the repository and deploy.

---

Developed by dgisight (<https://dgisight.oxzeen.com/>)

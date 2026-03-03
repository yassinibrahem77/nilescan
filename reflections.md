# CSCI 2170: Assignment Creative Curiosity Corner

## 1. Student Details

* Full Name: Yassin Ibrahem
* Dal Email: ys743518@dal.ca
* B00 ID: B00940619

## 2. Introducing the Creative Curiosity Corner

In addition to completing the main requirements for each assignment, here’s an invitation to explore beyond the task at hand through the Creative Curiosity Corner. This is an opportunity for you to demonstrate creative thinking and curiosity about the topics we are learning. Creative Curiosity Corner a space for you to experiment, explore, and challenge yourself with concepts related to the assignment, but not directly part of the main requirements. This could involve:

* Expanding on a specific idea that caught your attention
* Testing out a new technique you haven’t had the chance to explore
* Applying the material in a creative way that goes beyond the instructions

We learn best by trying new things, making mistakes, and pushing beyond what feels comfortable. This is how we grow as learners, and it’s also how we build resilience. The Creative Curiosity Corner gives you the freedom to experiment without the pressure of perfection. It’s a chance to take risks, learn from them, and bounce back when things don’t work out as planned. The goal isn’t just to get things right—it’s about developing your problem-solving skills, embracing the unknown, and becoming more confident when facing challenges.

### 2.1. Grading: The focus is on learning and experimentation: not correctness

* Grading for `creative-curiosity-corner` is not based on something working or being correct. It is about encouraging you to learn beyond boundaries!
* The code and reflections will be graded as a bonus component of the assignment, making you eligible to receive a grade of __*exceeds expectations*__ in case all other assignment components are complete.
* In case other assignment components are not complete, you are eligible to get the next level of the grade.
  * For example, if your grade was “Incomplete, does not meet expectations yet”, you could receive a grade of “Incomplete, has scope for improvements”.

## 3. Reflections

### 3.1. What did you do in this creative curiosity corner activity? (at least 250 words)

Describe your creative exploration in detail.

I created a complete live article search and filter system for this project using traditional JavaScript without any database connections or page transitions or any additional software except for Bootstrap. The search function exists in two separate files which include search.html for the user interface and search.js for all functional operations. The article list filters the search results based on user input through the search box because JavaScript uses Array.filter() and String.includes() to create instant filters that respond to each key pressed. The system demonstrates every keyword match through the card titles and excerpts which highlight matching terms that use a dynamically built regular expression inside a mark HTML element. The system allows users to filter results through author filter chips which show content written by their selected author while I implemented a debounce pattern with setTimeout that waits 200 milliseconds after user input ends before running the filter to prevent unneeded rendering when users type. The system displays a clear button which becomes visible when users start typing and the button restarts all functions when users click it. The entire dataset is embedded directly in search.js so the feature works as a completely standalone file without needing a running server which was an interesting constraint to design around. The cards enter the display through staggered animations which create a responsive effect that displays results progressively instead of showing them all at once.

### 3.2. Why did you choose to do this? (at least 100 words)

Describe why did this topic or concept interest you?

The home page of the assignment operates by loading all articles simultaneously but it lacks any system that enables users to search for particular articles. The situation creates significant difficulties for users because the article list keeps expanding. I wanted to explore whether I could solve that problem purely on the client side without touching the server, without adding any new routes, and without any JavaScript framework. The concept of creating instant responsive experiences through existing browser functionalities presented an appealing challenge for me. The assignment naturally progresses into this topic which explains how web pages handle data transmission.

### 3.3. How it connects to this assignment? (no word limit; bullet points encouraged)

How does this work relate to the assignment, even though it's not part of the requirements.

The search feature operates on the same article data structure defined in data/articles.json using the same id, title, content, author and date fields used throughout the assignment. The system starts from the home page article display as its foundation while it implements an interactive feature that users can engage with. The HTML file follows the same Bootstrap 5 styling approach used in all assignment views. The author filter chips connect to the same usernames that appear as authors in the articles and as credentials in users.json.

### 3.4. What worked and what didn’t? (no word limit; bullet points encouraged)

* Reminder: Grading for `creative-curiosity-corner` is not based on something working or being correct. It is about encouraging you to learn beyond boundaries!
* Share your successes and challenges.

The core filter logic used Array.filter() and String.toLowerCase().includes() function worked correctly during its first implementation. The debounce pattern functioned correctly while it decreased unnecessary rendering that occurred during rapid typing. The highlight function experienced implementation difficulties. My initial version crashed because I used new RegExp() to process the search query which contained regex special characters like ( or *. I did not expect user input to disrupt the operation of regular expressions.

### 3.5. What did you tried to fix? (no word limit; bullet points encouraged)

Did you run into problems? How did you approach solving them.

The highlight function crashed when it processed queries which included regex metacharacters that contained the symbols . * ( + and ). The solution required us to escape the query before we built the RegExp because we needed to apply the standard escaping pattern which converts all special characters into their backslash-escaped versions to make them behave as regular characters. I found this pattern in the MDN RegExp documentation and it solved the problem completely. The solution required us to escape the query before we built the RegExp because we needed to apply the standard escaping pattern which converts all special characters into their backslash-escaped versions to make them behave as regular characters. 

### 3.6. References/Citations: What additional resources did you use, and why? (no word limit; bullet points encouraged)

Did any tutorials, articles, or external materials help you in your exploration?

MDN Web Docs Array.prototype.filter() — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter — used to write the filtering predicate correctly.
MDN Web Docs String.prototype.includes() — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes — used for case-insensitive substring matching.
MDN Web Docs RegExp constructor — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp — used to solve the special character escaping problem.
MDN Web Docs setTimeout — https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout — used to implement the debounce delay pattern.
Bootstrap 5.3 — https://getbootstrap.com/ — MIT License — used for layout and styling consistent with the rest of the assignment.

### 3.7 What did you learn from this experience? (at least 150 words)

What are your key takeaways from this experience.

The primary lesson that I acquired showed me that users can resolve multiple UI issues through client-side solutions which need no server support. Before this exercise I would have instinctively added a new server route to handle search. The same result which I needed to achieve now takes me 60 lines of JavaScript because I made no server modifications. The process of changing my thought pattern reached an important stage. I discovered that regular expressions provide users with more complex matching capabilities than their actual usability. The highlight feature stopped working with actual input because I failed to anticipate that users would type text which included regex metacharacters. I needed to debug that problem through careful reading of MDN RegExp documentation because I could not depend on my initial assumptions. The debounce pattern was also new to me. I had heard the term before but never implemented it. The method of using setTimeout together with clearTimeout to create input delays demonstrates a useful technique which I will implement in my upcoming work. The exercise helped me to become more familiar with using vanilla JavaScript as my primary tool before turning to libraries or server-side solutions.
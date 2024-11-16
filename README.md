# Golf Fantasy Website

This is a Golf Fantasy website built with Next.js, a Flask API, Firebase authentication, and MySQL storage.

## Front End: React

The front end of the Golf Fantasy website is built using Next.js, a React framework for server-side rendering and static site generation. Next.js provides a seamless development experience with features like automatic code splitting, hot module replacement, and server-side rendering.

## Back End: Flask

The back end of the Golf Fantasy website is built using Flask, a lightweight web framework for Python. Flask allows for easy development of RESTful APIs and provides a flexible and scalable architecture for building web applications.

## Firebase Authentication

Firebase Authentication is used for user authentication in the Golf Fantasy website. It provides a secure and easy-to-use authentication system, allowing users to sign up, sign in, and manage their account credentials.

## Database: MySQL

The Golf Fantasy website utilizes a MySQL database for storing and managing data. Here is a placeholder description of the DB structure:

- `golfer` : Stores information about golf players, including their name, nationality, and ranking.
- `league` : Represents the fantasy leagues created by users, containing details like league name, member, commisioner, and owner.
- `user` : Contains information about registered users, such as their username, email, link to their avatar photo, etc.
- `roles` : list of roles, permissions associated with those roles


## Development Roadmap
- 1/27/24: Alpha Release
- 1/29/24: Beta Testing
- 2/4/24: Full Release

## More Info

For more information on Next.js, Flask, Firebase Authentication, and Firebase Storage, refer to the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
<!-- - [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details. -->
### Run the API

To run the Flask API in development mode:
1. From the root directory, run `source .venv/bin/activate`
2. Navigate to the `src/api` directory:
3. Run `flask run dev`
4. Hopefully it works


### Run the frontend

To run the frontend in development mode:

1. Navigate to the root directory
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`


## TODO List

### Performance Optimizations
- [ ] Optimize golfer photo loading in dropdown
  - [ ] Implement client-side caching for Firebase Storage URLs
  - [ ] Preload images for frequently accessed golfers
  - [ ] Configure Firebase Storage CDN settings
  - [ ] Add loading states/skeletons for images
  - [ ] Consider implementing lazy loading for off-screen images
  - [ ] Investigate batch loading strategies for golfer photos


- [ ] Move scoring system to database
  - Currently hardcoded in `src/api/jobs/calculate_points/calculate_points.py`
  - Should be configurable per league/season
  - Reference tables: League, ScoringRuleset, ScoringRule





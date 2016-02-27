# DOING

# TODO
  - understand sourcemaps
  - make app page with router handler to react and still server side rendering?
  - make webpage with login that allows you to reproduce playlists from youtube
  - fix serving gzip on the server

# PENDING
  - manifest file
  - Tests in the workflow
  - push to another platform besides heroku
  - make a server pretty easy to implement (like mamp)in order to add a index.html file and be enough

# COMMENTS
  - Views are in Jade and we don't need react render in the server for now
  - if you're logged in, you handle the router to the webapp and the latter has to manage 404 and
    error pages. If you're not logged in, you use the landing page error pages when necessary.
  - markojs seems a pretty good template engine

# QUESTIONS
  - effectively managing webpack chunks/modules?

# DONE
  - css autoprefixer
  - gzip in server
  - cache headers to dist files
  - Error pages
  - solve shared chunk thing in the 404 page
  - change app to src
  - shared jade templates
  - generate correct common.css file
  - fonts assets (missing import from google)
  - font icons (better organization)
  - organize css file imports in index and about

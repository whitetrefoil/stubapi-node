StubAPI (stubapi-node)
==========

A mock server to help web page development.  When it receives requests, it will
try to load a JSON file in disk (according to the requested path), and return
it as the response to the browser.

It can be started standalone or work as a "connect" middleware.

It's planned to have request verification, dynamic response, and some other
advanced functions in the future.

_But it will **NEVER** have too many functions otherwise you will no longer need
your real backend services. ;)_

WHY?
----------

The "StubAPI" is a HTTP server.  It is designed to be used to help developing
web applications.

As we know, many web applications nowadays have a well front / back separated
design.  The frontend part is usually a static HTML web page, using JavaScript
to communicate with the backend web service, then render the page accordingly.
And the frontend part is usually developed by a frontend development team
separated from traditional backend team, under separated management.

But the frontend is quite difficult to develop totally separately from the
backend, because it heavily rely on the response from backend.  Without knowing
what the response will be, the frontend team will have no idea about how to
process the data and how to show them to the user.

Thus, most frontend at least have an API document which describe what will the
response from backend look like, and what should they send to backend.  Or they
may work very closely with the backend team to communicate on the API design
frequently.

But that's still not enough.  With only the API document, frontend team can
write the code, but won't be able to test it.  Usually they have to write many
"development only" code right in the product code to verify how the pages work.
The productivity of this way is very low, and it's very easy to make mistakes
(e.g. forget to remove the "dev-only" code).

That's why this small application stand for.

Roadmap
----------

I'll try to follow [Semantic Versioning](http://semver.org).  So the below steps
is not the version number.  It's just a big picture.

### Step 1

Achieve the same functionality as the `stubapi` I used to write
inside `Gulp/Gruntfile.js`, which contains:

* Read JSON files inside a preset directory (`/stubapi/` for example)
  according to request URL.
* The response status code can be set in the JSON files.
* Each request with the same URL will get exactly the same response,
  no realtime modification can be done via POST / PUT / DELETE requests.
  But modifications directly on the JSON files will affects immediately.
* Querystring, parameters in request body, HTTP headers will just be ignored.
* No validation.
* Standalone / Middleware mode.

### Step 2

The most important function in this phase is request validation.

* Validate request body, querystring, HTTP headers.
* Use custom functions to validate.
* Use [JSONSchema](http://json-schema.org/) to validate.
* Use some simple rules (e.g. `{"name": "string", "age": "number"}`) to validate.

### Step 3

Modification request (`POST`, `PUT`, `PATCH`, `DELETE`) will really affect the
next responses.

* Console to reload initial response from JSON files.
* Optionally save changes to JSON files.

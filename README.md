# NeDB-Demo 
## What is this?
A tiny Node.js application that shows some of the basic functionallity of Node embedded Database (NeDB).
* Create a collection that is persisted into a file.
* Initialize the collection with a few documents.
* Wipe out the collection.
* Get all documents from the collection.
* Get a set of documents from the collection that matches a RegEx.
* Update a set of documents from the collection that matches a certain criteria.

## How do I set up this app?
1. Install Node.js.
2. Clone this repository.
3. In your console, move to the directory where the package.json file is located and execute *npm install*
4. In that same directory execute *node server.js*

## How do I use it? 
* *http://localhost:3000/init* - Creates the collection with initial data and persists the collection in a file named "annotations.json" on the same directory the app is installed.
* *http://localhost:3000/getAnnotations* - List all the defcets.
* *http://localhost:3000/saveAnnotation* - Creates a new defect
* *http://localhost:3000/getAnnotationList* - redirects to defect page


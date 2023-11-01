# RELEASE

## 3.0.2

Updated models to ensure we can use with TS correctly, moved all perameters too into object to follow same rules for each model type
pg service now takes ssl param

## 3.0.1

Make this.$globals available too to make it easy to pass to things like models or other files from any class that extends core

## 3.0.0

While every possible action has been taken to make this backwards compatible, please bare in mind this could be a breaking change.

Express and socket IO need to have isolated globals to access services, env vars etc, which in a lamdba/function env we use process to achieve this.

Due to express and socketIO using a fixed singular process, there is a requirement to to ensure this can be handled with confliction.

In express or socketIO application types, it is now a requierment to pass in the application stack directly to anything that extends from core class directly or indirectly.

Normal for aws and azure..

```js
const app = new Application('aws');
const cmvcServiceOrMiddleware = new CerberusMVCService();
const yourServiceOrMiddleware = new YourServiceOrMiddleware();
```

Using globals with express

```js
const app = new Application('express');
const cmvcServiceOrMiddleware = new CerberusMVCService(app.globals);
const yourServiceOrMiddleware = new YourServiceOrMiddleware(app.globals);
```

this will make app.globals available for this.$environment, this.$service etc from within the service

Pass these in to any classes that extend core directly or indirectly for express and socket IO, failure to do so will result in a node Error to do so

In typescript, we need to pass over the Globals type to any cerberus classes, your own will import Globals directly and push to extended class

```ts
const app = new Application<Globals>('express');
const cmvcServiceOrMiddleware = new CerberusMVCService<Globals>(app.globals);
const yourServiceOrMiddleware = new YourServiceOrMiddleware(app.globals); // import Globals type inside your own class, to get availability inside the class
```

Any type not express or socketIO should fall back naturally to process storing, due to the nature.

You may override the automated behavour, forcing globals on all types using hte forceGlobals flag

```js
const app = new Application('express', null, true);
const cmvcServiceOrMiddleware = new CerberusMVCService(app.globals);
const yourServiceOrMiddleware = new YourServiceOrMiddleware(app.globals);
```

## 2.0.4

Update type for Response, to allow us ot inject in types

## 2.0.3

Update type for Request, as we only accept path based vars on API in lin ewith REST

## 2.0.2

Issue with express request catch all {error+} not patching through.

## 2.0.1

Problem with package file, left over files setting. removed.

## 2.0.0

Added support for tpyescript, this is experimental at present, while types need to be adjusted.
Addition on suppert for specifying controller dir on application instantiation.
adjusting of imports for TS support

## 1.2.1

Added support for Azure Functions! choose azure form the CLI tool to create a new azure api
## 1.1.9

Fix issue with empty responses failing... Update logging

## 1.1.8

Need to ensure middleware 'in' is ran before endpoint but after instantiation to ensure method not allowed can be caught. Updated Cors middleware headers. Updated logging by adding logging var. All vars should be prefixed with CMVC_ in tmeplate.yaml ot tmeplate.json.

## 1.1.7

Change order of precedent of assigning env vars, with CLI being hte most important followed by those set in template.json for express based systems. Allows us to set vars for dev and override with say docker compose. Handy when running locally two ways. 

## 1.1.6

Fix for early failure when bootstrapping without a server (like mounting manually for testing). Need to ensure we end all services.

## 1.1.5

Whoopsie missing fix added back in for mode switching, also added in further fix for unshift to ensure when you reduce path to nothing it will load index.

## 1.1.4

Added a global environment variable override to allow us to add a path adjustment on the incomming request, this enables us to take ain a layer 7 routed style of endpint such as xxx.com/layer/seven/route/login
we may want this in a live enviornment, but locally and testing we may not, beacuse we can route traffic differently in these environments.

This change allows us to shift a portion of the route off or unshift a portion of a new route on to the resolution of the controller endpoints.

As such by adding '/layer/seven/route' to the environemnt variable CWC_PATH_UNSHIFT we end up routing this path to the controller at src/Controller/Login.js for commonjs modular setup and .mj for es modules (the system supports both modes dependend on how you suffix your handler .js or .mjs).

the end result is for a production template we can have layer seven routes map to base route address with layer seven routing in CDN such as xxx.com/layer/seven/route/login, and locally our template does not have this environment var set and we just connect to say localhost:8082/login. In both circumstances controllers start at src/Controller base route.

To add a route portion to the beginning use unsift, you can use unsift to remove hte portion at the front and shift to add a portion to the front, in theory you could remove layer seven route and sit all your controllers ad a folder deep inside the Controller folder.

These change is put in place to aid development and different routing stratagies allowing devs to not worry so much about URL's, keeping the code in the same place regardless of CDN or routing stratagy

## 1.1.3

Updated application to accept a mode parameter on instantiation to force node mode, accpets 'module' for require() or 'es-module' for import. Note SAM and aws require node 14.X and up runtime. 

## 1.1.1

Updated express request to allow an array of methods to be used in template file fo routes, and also route / endpoint to Index.js controller 

## 1.1.0

New middleware lifecycle, introduced three new middleware hooks 'start', 'end' and 'mount' to accompany 'in' and 'out'.
In and out should function as is, for backawards camptibility, start is before anything loads, so mutliple requests can be seen (as some internal aws requests may come in many at a time)
End is once all requests have been fullfilled for that instantiation.
Mount is before each individual requests controller is mounted.

You can benefit from moving middleware service instantiation to start and end, to ensure they are only called once... such as adding a postgres service. this ensures that we only ever load it once er session

This should not break existing systems, but allow users to migrate to start and end for singleton service instantiation, with the others as a per request (which is just one on API gateway hits but could be many on SQS hits)

## 1.0.51

Added support for event bridge

## 1.0.29

Fixed faulty crypto classes
## 1.0.24

Debuggin for bad db connection details
## 1.0.23

Reques fixes due to node 14.X needing global flag on math all... also support for es6 modular imports.
## 1.0.12

Added ability to have Knex model ot PG native model, depracting model to be removed next major release
Also pushed console logging out to JSON.stringify due to bug with AWS lambda logging and new lines in debug content

## 1.0.13

Added missing Middleware and Service for PG native

## 1.0.14

Cleanup of logging
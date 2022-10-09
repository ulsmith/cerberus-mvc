# RELEASE

## 1.1.5

Whoopsie missing fix added back in for mode switching, also added in further fix for unshift to ensure when you reduce path to nothing it will load index.

## 1.1.4

Added a global environment variable override to allow us to add a path adjustment on the incomming request, this enables us to take ain a layer 7 routed style of endpint such as xxx.com/layer/seven/route/login
we may want this in a live enviornment, but locally and testing we may not, beacuse we can route traffic differently in these environments.

This change allows us to shift a portion of the route off or unshift a portion of a new route on to the resolution of the controller endpoints.

As such by adding '/layer/seven/route' to the environemnt variable CWC_PATH_UNSHIFT we end up routing this path to the controller at src/Controller/Login.js for commonjs modular setup and .mj for es modules (the systme supports both modes dependend on how you suffix your handler .js or .mjs).

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
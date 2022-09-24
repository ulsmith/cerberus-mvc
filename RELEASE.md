# RELEASE

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
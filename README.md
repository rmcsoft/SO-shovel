# SO-shovel
SO-shovel is an application to process [Stackoverflow dump](https://archive.org/details/stackexchange), normalize it and extract data that can be used during analysis of errors in the logs of different applications. SO-shovel written in javascript and can be run with NodeJS. It has web GUI developed with JQuery and Bootstrap.
### Dump format
SO-shovel assumes that SO dump corresponds to [a certain format](https://meta.stackexchange.com/questions/2677/database-schema-documentation-for-the-public-data-dump-and-sede).
### Starting the application
```sh
$ node app.js
```
### Checking if application works
```sh
http://${host}:${port}
```
### Configuration file format
```
{
    "port" : 1337, // port to listen on
    "mongoose": {
        "uri": "mongodb://localhost:27017/stackoverflow-dump" // uri to connect to MongoDB
    },
    "scoreThreshold": 0, // score threshold to filter messages by
    "tags": ["nginx", "tomcat", "glassfish"], // tags to filter messages by
    "separator": ",", // separator to use on writing normalized data in CSV file
    "normalizedDumpFilepath": "/home/user/normalized-dump.csv", // path to the file where normalized data will be stored
    "dumpFilepath": "/home/user/Posts.xml" // path to the file with SO dump
}
```
### Format of CSV file with normalized data
Field|Description
-----|-----------
id|Message identifier in SO database. Can be used for mapping or as meta data.
body|Body of message with HTML tags.
tags|list of tags message marked with.
### REST API
Method|URI|Description
------|---|-----------
GET|/api|Checks if REST API is working
POST|/api/posts|Accepts message as JSON and stores it in MongoDB
GET|/api/dump/info|Retrieves info about last installed SO dump
GET|/api/dump/installed|Retrieves info about installed SO dump
GET|/api/config|Retrieves app configuration
GET|/api/update-dump|Triggers dump update
GET|/api/write-csv|Triggers writing of normalized dump into CSV file

### How to update SO dump
1. Download dump manually from https://archive.org/details/stackexchange
2. Unzip it and place somewhere. Let's call this location **${dump_path}**
3. Make sure **${dump_path}** written in **dumpFilepath** property of configuration file
4. Click on button "Update SO dump" or send GET request to /api/update-dump
5. SO-shovel checks **import-info.properties** and compares last modification date and dump size in it with ones of loaded dump. If they are different the dump will be loaded
6. In case the dump is loading you should wait for update to complete
